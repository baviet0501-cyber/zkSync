import { useState, useCallback, useRef, useEffect } from "react";
import { getEthers } from "../utils/ethersLazy";
import type { providers } from "ethers";
import type { WalletState, ContractAddresses, NFTToken, NFTStatus } from "../types";
import {
  NFT_ABI,
  fetchGreeting,
  setGreeting,
  getTokenBalance,
  transferToken,
  getNFTCollectionInfo,
  getOwnerNFTs,
  mintDefaultNFT,
  mintNFT as contractMintNFT,
  burnNFT as contractBurnNFT,
  shortenAddress,
  getNetworkName,
  getExplorerUrl,
  getInjectedWalletProvider,
  generateDemoNFTImage,
} from "../utils/contract";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

// Default contract addresses - UPDATE after deployment
const DEFAULT_CONTRACTS: ContractAddresses = {
  greeter: ZERO_ADDRESS,
  simpleToken: ZERO_ADDRESS,
  paymaster: ZERO_ADDRESS,
  simpleNFT: ZERO_ADDRESS,
};

interface CachedNFTMetadata {
  name: string;
  description: string;
  image: string;
  txHash: string;
  mintedAt: number;
  status: NFTStatus;
}

function isZkSyncChain(chainId?: number): boolean {
  return chainId === 300 || chainId === 324;
}

function getNFTCacheKey(chainId: number, contractAddress: string, tokenId: string): string {
  return `zksync-dapp:nft:${chainId}:${contractAddress.toLowerCase()}:${tokenId}`;
}

function readCachedNFTMetadata(
  chainId: number,
  contractAddress: string,
  tokenId: string
): CachedNFTMetadata | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(getNFTCacheKey(chainId, contractAddress, tokenId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCachedNFTMetadata(
  chainId: number,
  contractAddress: string,
  tokenId: string,
  metadata: CachedNFTMetadata
) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      getNFTCacheKey(chainId, contractAddress, tokenId),
      JSON.stringify(metadata)
    );
  } catch (error) {
    console.warn("Unable to cache NFT metadata locally:", error);
  }
}

function parseTokenMetadata(tokenURI: string): Partial<Pick<NFTToken, "name" | "description" | "image">> {
  if (!tokenURI) return {};

  try {
    let raw = tokenURI;
    if (tokenURI.startsWith("data:application/json;base64,")) {
      raw = atob(tokenURI.replace("data:application/json;base64,", ""));
    } else if (tokenURI.startsWith("data:application/json,")) {
      raw = decodeURIComponent(tokenURI.replace("data:application/json,", ""));
    } else if (tokenURI.startsWith("%7B")) {
      raw = decodeURIComponent(tokenURI);
    }

    if (!raw.trim().startsWith("{")) return {};

    const parsed = JSON.parse(raw);
    return {
      name: typeof parsed.name === "string" ? parsed.name : undefined,
      description: typeof parsed.description === "string" ? parsed.description : undefined,
      image: typeof parsed.image === "string" ? parsed.image : undefined,
    };
  } catch {
    return {};
  }
}

function getSortableTokenId(tokenId: string): number {
  const numericId = Number(tokenId);
  return Number.isFinite(numericId) ? numericId : Number.MAX_SAFE_INTEGER;
}

function sortNFTTokens(tokens: NFTToken[]): NFTToken[] {
  return [...tokens].sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (b.status === "pending" && a.status !== "pending") return 1;
    return getSortableTokenId(a.tokenId) - getSortableTokenId(b.tokenId);
  });
}

interface ZkSyncState {
  wallet: WalletState;
  greeting: {
    message: string;
    owner: string;
    lastUpdater: string;
    lastUpdated: number;
    chainId: number;
  } | null;
  token: {
    name: string;
    symbol: string;
    balance: string;
    totalSupply: string;
    decimals: number;
  } | null;
  nftCollection: {
    name: string;
    symbol: string;
    maxSupply: string;
    currentSupply: string;
    totalMinted: string;
    deploymentTime: string;
    lastMintedAt: string;
    owner: string;
  } | null;
  nftTokens: NFTToken[];
  isProcessing: boolean;
  txResult: {
    hash: string;
    explorerUrl: string;
    status: string;
  } | null;
}

export function useZkSync(contracts: ContractAddresses = DEFAULT_CONTRACTS) {
  const [state, setState] = useState<ZkSyncState>({
    wallet: {
      address: null,
      network: null,
      balance: "0",
      isConnected: false,
      isConnecting: false,
      error: null,
    },
    greeting: null,
    token: null,
    nftCollection: null,
    nftTokens: [],
    isProcessing: false,
    txResult: null,
  });

  const updateWallet = useCallback((updates: Partial<WalletState>) => {
    setState((prev) => ({
      ...prev,
      wallet: { ...prev.wallet, ...updates },
    }));
  }, []);

  // Lazy-loaded zkSync provider — zksync-ethers is dynamically imported to reduce bundle size
  const zkSyncProviderRef = useRef<any>(null);
  const walletProviderRef = useRef<NonNullable<Window["ethereum"]> | null>(null);

  const resolveWalletProvider = useCallback(async () => {
    const provider = await getInjectedWalletProvider();
    walletProviderRef.current = provider;
    return provider;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { Provider } = await import("zksync-ethers");
        if (!cancelled) {
          zkSyncProviderRef.current = new Provider("https://sepolia.era.zksync.dev");
        }
      } catch (err) {
        console.error("Failed to load zkSync provider:", err);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /**
   * Connect to MetaMask and switch to zkSync network
   */
  const connectWallet = useCallback(async () => {
    try {
      updateWallet({ isConnecting: true, error: null });

      const ethereum = await resolveWalletProvider();
      if (!ethereum) {
        updateWallet({
          isConnecting: false,
          error:
            "Wallet provider not found. Unlock MetaMask, allow access to localhost, then refresh this page.",
        });
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const address = accounts[0];
      const e = await getEthers();
      const provider = new e.providers.Web3Provider(ethereum);
      const network = await provider.getNetwork();

      const balance = await provider.getBalance(address);
      const ethBalance = e.utils.formatEther(balance);

      const isZkSync = isZkSyncChain(network.chainId);

      updateWallet({
        address,
        balance: `${parseFloat(ethBalance).toFixed(4)} ETH`,
        isConnected: true,
        isConnecting: false,
        network: {
          name: getNetworkName(network.chainId),
          chainId: network.chainId,
          rpcUrl: "",
          explorerUrl: "",
          symbol: "ETH",
          isL2: isZkSync,
        },
        error: null,
      });

      if (isZkSync && contracts.greeter !== ZERO_ADDRESS) {
        await fetchContractData(provider, address);
      }
    } catch (error: any) {
      updateWallet({
        isConnecting: false,
        error: error.message || "Failed to connect wallet",
      });
    }
  }, [contracts, resolveWalletProvider]);

  /**
   * Switch network to zkSync Era Testnet
   */
  const switchToZkSync = useCallback(async () => {
    const ethereum = walletProviderRef.current || (await resolveWalletProvider());
    if (!ethereum) {
      updateWallet({ error: "Wallet provider not found. Please unlock MetaMask and refresh." });
      return;
    }

    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x12C" }], // 300 in hex
      });
    } catch (error: any) {
      // Chain not added yet
      if (error.code === 4902) {
        try {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x12C",
                chainName: "zkSync Era Testnet",
                nativeCurrency: {
                  name: "ETH",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: ["https://sepolia.era.zksync.dev"],
                blockExplorerUrls: ["https://sepolia.explorer.zksync.io"],
              },
            ],
          });
        } catch (addError: any) {
          updateWallet({
            error: addError.message || "Failed to add zkSync network",
          });
        }
      }
    }
  }, [resolveWalletProvider]);

  /**
   * Fetch data from Greeter and Token contracts
   */
  const fetchContractData = useCallback(
    async (
      provider?: providers.Web3Provider,
      userAddress?: string,
      options: { includeNFT?: boolean } = {}
    ) => {
      try {
        const includeNFT = options.includeNFT ?? true;
        const activeProvider = provider || zkSyncProviderRef.current;
        if (!activeProvider) return;

        const activeNetwork = provider ? await provider.getNetwork() : undefined;
        if (activeNetwork && !isZkSyncChain(activeNetwork.chainId)) {
          setState((prev) => ({
            ...prev,
            greeting: null,
            token: null,
            nftCollection: null,
            nftTokens: [],
          }));
          return;
        }

        const greeterData = await fetchGreeting(
          contracts.greeter,
          activeProvider
        );

        setState((prev) => ({
          ...prev,
          greeting: {
            message: greeterData.greeting,
            owner: greeterData.owner,
            lastUpdater: greeterData.lastUpdater,
            lastUpdated: greeterData.lastUpdated,
            chainId: greeterData.chainId,
          },
        }));

        const addr = userAddress;
        if (
          contracts.simpleToken !== ZERO_ADDRESS &&
          addr
        ) {
          const tokenData = await getTokenBalance(
            contracts.simpleToken,
            addr,
            activeProvider
          );

          setState((prev) => ({
            ...prev,
            token: tokenData,
          }));
        }

        // Fetch NFT collection info and user's NFTs
        if (
          includeNFT &&
          contracts.simpleNFT !== ZERO_ADDRESS &&
          addr
        ) {
          await fetchNFTData(addr, activeProvider);
        }
      } catch (error: any) {
        console.error("Failed to fetch contract data:", error);
      }
    },
    [contracts]
  );

  /**
   * Fetch NFT collection info and user's tokens
   */
  const fetchNFTData = useCallback(
    async (userAddress?: string, provider?: providers.Provider) => {
      try {
        const p = provider || zkSyncProviderRef.current;
        const addr = userAddress || state.wallet.address;
        if (!p || !addr || contracts.simpleNFT === ZERO_ADDRESS) return;

        const network = await (p as any).getNetwork?.();
        const chainId = network?.chainId || state.wallet.network?.chainId || 300;
        if (!isZkSyncChain(chainId)) {
          setState((prev) => ({
            ...prev,
            nftCollection: null,
            nftTokens: [],
          }));
          return;
        }

        const [collectionInfo, ownerTokens] = await Promise.all([
          getNFTCollectionInfo(contracts.simpleNFT, p),
          getOwnerNFTs(contracts.simpleNFT, addr, p),
        ]);

        // Format NFT data — try to parse tokenURI as JSON metadata
        const formattedTokens: NFTToken[] = ownerTokens.map((t) => {
          let name = `${collectionInfo.name} #${t.tokenId}`;
          let description = `A unique NFT from the ${collectionInfo.name} collection on zkSync Era.`;
          let image = generateDemoNFTImage(t.tokenId, collectionInfo.symbol);

          // If tokenURI is JSON metadata (from custom mint), extract fields
          if (t.tokenURI.startsWith("{") || t.tokenURI.startsWith("%7B")) {
            try {
              const decoded = decodeURIComponent(t.tokenURI);
              const parsed = JSON.parse(decoded);
              if (parsed.name) name = parsed.name;
              if (parsed.description) description = parsed.description;
              if (parsed.image) image = parsed.image;
            } catch {
              // Not valid JSON — keep defaults
            }
          }

          const cached = readCachedNFTMetadata(chainId, contracts.simpleNFT, t.tokenId);

          return {
            tokenId: t.tokenId,
            name: cached?.name || name,
            description: cached?.description || description,
            image: cached?.image || image,
            owner: addr,
            creator: t.creator,
            tokenURI: t.tokenURI,
            status: cached?.status || "confirmed",
            metadataSource: cached
              ? "local"
              : t.tokenURI.startsWith("{") || t.tokenURI.startsWith("%7B")
              ? "contract"
              : "fallback",
            txHash: cached?.txHash,
            mintedAt: cached?.mintedAt,
          };
        });

        setState((prev) => ({
          ...prev,
          nftCollection: collectionInfo,
          nftTokens: sortNFTTokens(formattedTokens),
        }));
      } catch (error: any) {
        console.error("Failed to fetch NFT data:", error);
      }
    },
    [contracts.simpleNFT, state.wallet.address, state.wallet.network]
  );

  const refreshContractData = useCallback(async () => {
    const ethereum = walletProviderRef.current || (await resolveWalletProvider());
    const address = state.wallet.address;
    if (!ethereum || !address || !isZkSyncChain(state.wallet.network?.chainId)) return;

    const e = await getEthers();
    const provider = new e.providers.Web3Provider(ethereum);
    await fetchContractData(provider, address, { includeNFT: false });
  }, [
    fetchContractData,
    resolveWalletProvider,
    state.wallet.address,
    state.wallet.network?.chainId,
  ]);

  useEffect(() => {
    if (
      !state.wallet.isConnected ||
      !state.wallet.address ||
      !isZkSyncChain(state.wallet.network?.chainId)
    ) {
      return;
    }

    const sync = () => {
      if (document.visibilityState !== "visible" || state.isProcessing) return;
      refreshContractData();
    };

    const intervalId = window.setInterval(sync, 5000);
    return () => window.clearInterval(intervalId);
  }, [
    refreshContractData,
    state.isProcessing,
    state.wallet.address,
    state.wallet.isConnected,
    state.wallet.network?.chainId,
  ]);

  /**
   * Update greeting on the Greeter contract
   */
  const updateGreeting = useCallback(
    async (newGreeting: string) => {
      const ethereum = walletProviderRef.current || (await resolveWalletProvider());
      if (!ethereum || !state.wallet.address) {
        updateWallet({ error: "Wallet not connected" });
        return;
      }

      try {
        setState((prev) => ({ ...prev, isProcessing: true, txResult: null }));

        const e = await getEthers();
        const provider = new e.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const tx = await setGreeting(contracts.greeter, newGreeting, signer);
        const receipt = await tx.wait();
        const greeterData =
          receipt.status === 1
            ? await fetchGreeting(contracts.greeter, provider)
            : null;

        setState((prev) => ({
          ...prev,
          isProcessing: false,
          greeting: greeterData
            ? {
                message: greeterData.greeting,
                owner: greeterData.owner,
                lastUpdater: greeterData.lastUpdater,
                lastUpdated: greeterData.lastUpdated,
                chainId: greeterData.chainId,
              }
            : prev.greeting,
          txResult: {
            hash: tx.hash,
            explorerUrl: getExplorerUrl(
              state.wallet.network?.chainId || 300,
              tx.hash
            ),
            status: receipt.status === 1 ? "confirmed" : "failed",
          },
        }));
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          isProcessing: false,
          txResult: {
            hash: "",
            explorerUrl: "",
            status: `Error: ${error.message}`,
          },
        }));
      }
    },
    [contracts.greeter, resolveWalletProvider, state.wallet.address, state.wallet.network]
  );

  /**
   * Transfer tokens to another address
   */
  const sendTokens = useCallback(
    async (to: string, amount: string) => {
      const ethereum = walletProviderRef.current || (await resolveWalletProvider());
      if (!ethereum || !state.wallet.address) {
        updateWallet({ error: "Wallet not connected" });
        return;
      }

      try {
        setState((prev) => ({ ...prev, isProcessing: true, txResult: null }));

        const e = await getEthers();
        const provider = new e.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        const tx = await transferToken(
          contracts.simpleToken,
          to,
          amount,
          state.token?.decimals || 18,
          signer
        );
        const receipt = await tx.wait();

        const freshTokenData =
          receipt.status === 1 && state.wallet.address
            ? await getTokenBalance(
                contracts.simpleToken,
                state.wallet.address,
                provider
              )
            : null;
        const freshWalletBalance =
          receipt.status === 1 && state.wallet.address
            ? e.utils.formatEther(await provider.getBalance(state.wallet.address))
            : null;

        setState((prev) => ({
          ...prev,
          token: freshTokenData || prev.token,
          wallet: freshWalletBalance
            ? { ...prev.wallet, balance: freshWalletBalance }
            : prev.wallet,
          isProcessing: false,
          txResult: {
            hash: tx.hash,
            explorerUrl: getExplorerUrl(
              state.wallet.network?.chainId || 300,
              tx.hash
            ),
            status: receipt.status === 1 ? "confirmed" : "failed",
          },
        }));
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          isProcessing: false,
          txResult: {
            hash: "",
            explorerUrl: "",
            status: `Error: ${error.message}`,
          },
        }));
      }
    },
    [contracts.simpleToken, resolveWalletProvider, state.wallet.address, state.wallet.network, state.token]
  );

  /**
   * Mint one or more NFTs for the current user
   * @param count Number of NFTs to mint (default 1)
   * @param metadata Optional custom metadata (name, description, image data URI)
   */
  const mintNFT = useCallback(
    async (
      count: number = 1,
      metadata?: { name?: string; description?: string; imageDataUri?: string }
    ) => {
      const ethereum = walletProviderRef.current || (await resolveWalletProvider());
      if (!ethereum || !state.wallet.address) {
        updateWallet({ error: "Wallet not connected" });
        return;
      }

      if (!isZkSyncChain(state.wallet.network?.chainId)) {
        updateWallet({ error: "Switch to zkSync Era Testnet before minting NFTs." });
        return;
      }

      if (metadata?.imageDataUri && !metadata.name?.trim()) {
        updateWallet({ error: "NFT name is required when minting with a custom image." });
        return;
      }

      if ((metadata?.description || "").length > 280) {
        updateWallet({ error: "NFT description must be 280 characters or less." });
        return;
      }

      try {
        setState((prev) => ({ ...prev, isProcessing: true, txResult: null }));

        const e = await getEthers();
        const provider = new e.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        // Build custom metadata JSON if image was uploaded
        const chainId = state.wallet.network?.chainId || 300;
        const nftInterface = new e.utils.Interface(NFT_ABI);
        const metadataJSON = metadata?.imageDataUri
          ? JSON.stringify({
              name: metadata.name?.trim() || "My NFT",
              description: metadata.description || "",
              image: metadata.imageDataUri,
            })
          : null;

        let lastTxHash = "";
        let lastStatus = "";
        // Track tokenId → txHash for each minted NFT
        const mintedTokenIds: string[] = [];

        for (let i = 0; i < count; i++) {
          const tx = metadataJSON
            ? await contractMintNFT(
                contracts.simpleNFT,
                state.wallet.address,
                metadataJSON,
                signer
              )
            : await mintDefaultNFT(
                contracts.simpleNFT,
                state.wallet.address,
                signer
              );

          lastTxHash = tx.hash;
          setState((prev) => ({
            ...prev,
          nftTokens: sortNFTTokens([
            {
              tokenId: `pending-${tx.hash.slice(2, 10)}`,
                name: metadata?.name?.trim() || `Minting NFT ${i + 1}`,
                description: metadata?.description || "Waiting for zkSync confirmation.",
                image: metadata?.imageDataUri || generateDemoNFTImage(`${Date.now()}${i}`, "NFT"),
                owner: state.wallet.address!,
                creator: state.wallet.address!,
                tokenURI: metadataJSON || "",
                status: "pending",
                metadataSource: metadataJSON ? "local" : "fallback",
                txHash: tx.hash,
            },
            ...prev.nftTokens,
          ]),
            txResult: {
              hash: tx.hash,
              explorerUrl: getExplorerUrl(chainId, tx.hash),
              status: "pending",
            },
          }));

          const receipt = await tx.wait();
          lastStatus = receipt.status === 1 ? "confirmed" : "failed";

          for (const log of receipt.logs || []) {
            try {
              const parsed = nftInterface.parseLog(log);
              if (parsed.name === "NFTCreated") {
                const tokenId = parsed.args.tokenId.toString();
                mintedTokenIds.push(tokenId);
                writeCachedNFTMetadata(chainId, contracts.simpleNFT, tokenId, {
                  name: metadata?.name?.trim() || "",
                  description: metadata?.description || "",
                  image: metadata?.imageDataUri || "",
                  txHash: tx.hash,
                  mintedAt: Math.floor(Date.now() / 1000),
                  status: receipt.status === 1 ? "confirmed" : "failed",
                });
              }
            } catch {
              // Ignore logs that do not belong to the NFT interface.
            }
          }
        }

        // Refresh NFT data after minting
        await fetchNFTData(state.wallet.address, provider);

        // Attach transaction hashes to newly minted NFTs
        setState((prev) => ({
          ...prev,
          isProcessing: false,
          nftTokens: sortNFTTokens(
            prev.nftTokens.map((t) =>
              mintedTokenIds.includes(t.tokenId)
                ? { ...t, status: lastStatus as NFTStatus, txHash: lastTxHash }
                : t
            )
          ),
          txResult: {
            hash: lastTxHash,
            explorerUrl: getExplorerUrl(chainId, lastTxHash),
            status: count > 1
              ? `${count} NFTs minted successfully`
              : lastStatus,
          },
        }));
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          isProcessing: false,
          txResult: {
            hash: "",
            explorerUrl: "",
            status: `Error: ${error.message}`,
          },
        }));
      }
    },
    [
      contracts.simpleNFT,
      resolveWalletProvider,
      state.wallet.address,
      state.wallet.network,
    ]
  );

  /**
   * Disconnect wallet
   */
  const disconnectWallet = useCallback(() => {
    setState({
      wallet: {
        address: null,
        network: null,
        balance: "0",
        isConnected: false,
        isConnecting: false,
        error: null,
      },
      greeting: null,
      token: null,
      nftCollection: null,
      nftTokens: [],
      isProcessing: false,
      txResult: null,
    });
  }, []);

  /**
   * Burn (destroy) an NFT
   */
  const burnNFT = useCallback(
    async (tokenId: string) => {
      const ethereum = walletProviderRef.current || (await resolveWalletProvider());
      if (!ethereum || !state.wallet.address) {
        updateWallet({ error: "Wallet not connected" });
        return;
      }

      try {
        setState((prev) => ({ ...prev, isProcessing: true, txResult: null }));

        const e = await getEthers();
        const provider = new e.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        const tx = await contractBurnNFT(contracts.simpleNFT, tokenId, signer);
        const receipt = await tx.wait();

        // Refresh NFT data after burn
        await fetchNFTData(state.wallet.address, provider);

        setState((prev) => ({
          ...prev,
          isProcessing: false,
          txResult: {
            hash: tx.hash,
            explorerUrl: getExplorerUrl(
              state.wallet.network?.chainId || 300,
              tx.hash
            ),
            status: receipt.status === 1
              ? `NFT #${tokenId} burned successfully`
              : "failed",
          },
        }));
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          isProcessing: false,
          txResult: {
            hash: "",
            explorerUrl: "",
            status: `Error: ${error.message}`,
          },
        }));
      }
    },
    [contracts.simpleNFT, resolveWalletProvider, state.wallet.address, state.wallet.network]
  );

  // ==========================================================================
  // Auto-connect & event listeners (placed last so all deps are declared)
  // ==========================================================================

  /**
   * Core wallet initialization logic — shared by connectWallet and auto-connect
   */
  const initializeWallet = async (
    accounts: string[],
    ethereum: NonNullable<Window["ethereum"]>
  ) => {
    const address = accounts[0];
    const e = await getEthers();
    const provider = new e.providers.Web3Provider(ethereum);
    const network = await provider.getNetwork();

    const balance = await provider.getBalance(address);
    const ethBalance = e.utils.formatEther(balance);

    const isZkSync = isZkSyncChain(network.chainId);

    updateWallet({
      address,
      balance: `${parseFloat(ethBalance).toFixed(4)} ETH`,
      isConnected: true,
      isConnecting: false,
      network: {
        name: getNetworkName(network.chainId),
        chainId: network.chainId,
        rpcUrl: "",
        explorerUrl: "",
        symbol: "ETH",
        isL2: isZkSync,
      },
      error: null,
    });

    // Fetch data if contracts are deployed
    if (isZkSync && contracts.greeter !== ZERO_ADDRESS) {
      await fetchContractData(provider, address);
    }
  };

  /**
   * Auto-connect on mount if MetaMask already has authorized accounts.
   * Uses eth_accounts (silent) — no user prompt.
   */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const ethereum = await resolveWalletProvider();
        if (!ethereum) return;
        const accounts = await ethereum.request({
          method: "eth_accounts",
        });
        if (!cancelled && accounts && accounts.length > 0) {
          await initializeWallet(accounts, ethereum);
        }
      } catch {
        // Silently fail — user can click "Connect MetaMask" manually
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /**
   * Listen for account/chain changes from MetaMask
   */
  useEffect(() => {
    let activeProvider: NonNullable<Window["ethereum"]> | null = null;

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        const ethereum = activeProvider || walletProviderRef.current;
        if (ethereum) await initializeWallet(accounts, ethereum);
      }
    };

    const handleChainChanged = () => {
      // Reload to pick up new network
      window.location.reload();
    };

    (async () => {
      activeProvider = walletProviderRef.current || (await resolveWalletProvider());
      activeProvider?.on("accountsChanged", handleAccountsChanged);
      activeProvider?.on("chainChanged", handleChainChanged);
    })();

    return () => {
      activeProvider?.removeListener("accountsChanged", handleAccountsChanged);
      activeProvider?.removeListener("chainChanged", handleChainChanged);
    };
  }, [disconnectWallet, resolveWalletProvider]);

  return {
    ...state,
    connectWallet,
    switchToZkSync,
    updateGreeting,
    sendTokens,
    mintNFT,
    burnNFT,
    refreshContractData,
    fetchContractData,
    fetchNFTData,
    disconnectWallet,
    shortenAddress,
  };
}
