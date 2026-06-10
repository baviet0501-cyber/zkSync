import { getEthers } from "./ethersLazy";
import type { providers, Signer } from "ethers";

type TxOverrides = Record<string, unknown>;

// Greeter ABI
export const GREETER_ABI = [
  "function greet() view returns (string)",
  "function setGreeting(string memory _greeting)",
  "function owner() view returns (address)",
  "function lastUpdater() view returns (address)",
  "function lastUpdated() view returns (uint256)",
  "function getInfo() view returns (address, address, string, uint256, uint256)",
  "event GreetingChanged(address indexed changer, string newGreeting, uint256 timestamp)",
  "event ContractDeployed(address indexed deployer, string initialGreeting, uint256 timestamp)",
];

// SimpleToken ERC20 ABI
export const TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function MAX_SUPPLY() view returns (uint256)",
  "function totalBurned() view returns (uint256)",
  "function owner() view returns (address)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function mintTokens(address to, uint256 amount)",
  "function burn(uint256 amount)",
  "function burnFrom(address account, uint256 amount)",
  "function getTokenInfo() view returns (string, string, uint256, uint256, uint256, uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event TokensMinted(address indexed to, uint256 amount, uint256 timestamp)",
];

// Paymaster ABI
export const PAYMASTER_ABI = [
  "function acceptedToken() view returns (address)",
  "function owner() view returns (address)",
  "function getPaymasterInfo() view returns (address, address, uint256)",
  "function getPaymasterStats() view returns (uint256, uint256, uint256)",
  "function quoteTokenFee(uint256 ethFee) view returns (uint256)",
];

// SimpleNFT ERC-721 ABI
export const NFT_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function getTokensOfOwner(address owner) view returns (uint256[])",
  "function getCreator(uint256 tokenId) view returns (address)",
  "function getCollectionInfo() view returns (string, string, uint256, uint256, uint256, uint256, uint256)",
  "function owner() view returns (address)",
  "function mintNFT(address to, string memory uri) returns (uint256)",
  "function mintDefaultNFT(address to) returns (uint256)",
  "function tokenExists(uint256 tokenId) view returns (bool)",
  "function MAX_SUPPLY() view returns (uint256)",
  "function totalMinted() view returns (uint256)",
  "function burn(uint256 tokenId)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event NFTCreated(uint256 indexed tokenId, address indexed creator, address indexed owner, string tokenURI, uint256 timestamp)",
];

/**
 * Fetch greeting from Greeter contract
 */
export async function fetchGreeting(
  contractAddress: string,
  providerOrSigner: providers.Provider | Signer
): Promise<{
  greeting: string;
  owner: string;
  lastUpdater: string;
  lastUpdated: number;
  chainId: number;
}> {
  const e = await getEthers();
  const contract = new e.Contract(
    contractAddress,
    GREETER_ABI,
    providerOrSigner
  );

  const [owner, lastUpdater, greeting, lastUpdated, chainId] =
    await contract.getInfo();

  return {
    greeting,
    owner,
    lastUpdater,
    lastUpdated: lastUpdated.toNumber(),
    chainId: chainId.toNumber(),
  };
}

/**
 * Update greeting on the Greeter contract
 */
export async function setGreeting(
  contractAddress: string,
  newGreeting: string,
  signer: Signer,
  txOverrides?: TxOverrides
): Promise<any> {
  const e = await getEthers();
  const contract = new e.Contract(
    contractAddress,
    GREETER_ABI,
    signer
  );

  const tx = await contract.setGreeting(newGreeting, txOverrides || {});
  return tx;
}

/**
 * Get token balance for an address
 */
export async function getTokenBalance(
  tokenAddress: string,
  userAddress: string,
  provider: providers.Provider
): Promise<{
  name: string;
  symbol: string;
  decimals: number;
  balance: string;
  totalSupply: string;
  maxSupply: string;
  totalBurned: string;
  owner: string;
}> {
  const e = await getEthers();
  const contract = new e.Contract(
    tokenAddress,
    TOKEN_ABI,
    provider
  );

  const [name, symbol, decimals, balance, info, owner] = await Promise.all([
    contract.name(),
    contract.symbol(),
    contract.decimals(),
    contract.balanceOf(userAddress),
    contract.getTokenInfo(),
    contract.owner(),
  ]);

  return {
    name,
    symbol,
    decimals,
    balance: e.utils.formatUnits(balance, decimals),
    totalSupply: e.utils.formatUnits(info[2], decimals),
    maxSupply: e.utils.formatUnits(info[3], decimals),
    totalBurned: e.utils.formatUnits(info[5], decimals),
    owner,
  };
}

/**
 * Transfer tokens on zkSync
 */
export async function transferToken(
  tokenAddress: string,
  to: string,
  amount: string,
  decimals: number,
  signer: Signer,
  txOverrides?: TxOverrides
): Promise<any> {
  const e = await getEthers();
  const contract = new e.Contract(
    tokenAddress,
    TOKEN_ABI,
    signer
  );

  const parsedAmount = e.utils.parseUnits(amount, decimals);
  const tx = await contract.transfer(to, parsedAmount, txOverrides || {});
  return tx;
}

/**
 * Mint ERC-20 tokens. Only the SimpleToken owner can call this.
 */
export async function mintTokens(
  tokenAddress: string,
  to: string,
  amount: string,
  decimals: number,
  signer: Signer,
  txOverrides?: TxOverrides
): Promise<any> {
  const e = await getEthers();
  const contract = new e.Contract(tokenAddress, TOKEN_ABI, signer);
  const parsedAmount = e.utils.parseUnits(amount, decimals);
  const tx = await contract.mintTokens(to, parsedAmount, txOverrides || {});
  return tx;
}

/**
 * Burn ERC-20 tokens from the connected wallet.
 */
export async function burnTokens(
  tokenAddress: string,
  amount: string,
  decimals: number,
  signer: Signer,
  txOverrides?: TxOverrides
): Promise<any> {
  const e = await getEthers();
  const contract = new e.Contract(tokenAddress, TOKEN_ABI, signer);
  const parsedAmount = e.utils.parseUnits(amount, decimals);
  const tx = await contract.burn(parsedAmount, txOverrides || {});
  return tx;
}

// ============================================================================
// NFT Functions
// ============================================================================

/**
 * Fetch NFT collection info
 */
export async function getNFTCollectionInfo(
  nftAddress: string,
  provider: providers.Provider
): Promise<{
  name: string;
  symbol: string;
  maxSupply: string;
  currentSupply: string;
  totalMinted: string;
  deploymentTime: string;
  lastMintedAt: string;
  owner: string;
}> {
  const e = await getEthers();
  const contract = new e.Contract(nftAddress, NFT_ABI, provider);
  const [info, owner] = await Promise.all([
    contract.getCollectionInfo(),
    contract.owner(),
  ]);

  return {
    name: info[0],
    symbol: info[1],
    maxSupply: info[2].toString(),
    currentSupply: info[3].toString(),
    totalMinted: info[4].toString(),
    deploymentTime: new Date(info[5].toNumber() * 1000).toLocaleString(),
    lastMintedAt:
      info[6].toNumber() > 0
        ? new Date(info[6].toNumber() * 1000).toLocaleString()
        : "Not minted yet",
    owner,
  };
}

/**
 * Fetch NFTs owned by a user
 */
export async function getOwnerNFTs(
  nftAddress: string,
  owner: string,
  provider: providers.Provider
): Promise<{
  tokenId: string;
  tokenURI: string;
  creator: string;
}[]> {
  const e = await getEthers();
  const contract = new e.Contract(nftAddress, NFT_ABI, provider);
  const tokenIds = await contract.getTokensOfOwner(owner);

  const nfts: { tokenId: string; tokenURI: string; creator: string }[] = [];
  for (const id of tokenIds) {
    const tokenId = id.toString();
    const tokenURI = await contract.tokenURI(id);
    const creator = await contract.getCreator(id);
    nfts.push({ tokenId, tokenURI, creator });
  }

  return nfts;
}

/**
 * Mint an NFT
 */
export async function mintNFT(
  nftAddress: string,
  to: string,
  uri: string,
  signer: Signer,
  txOverrides?: TxOverrides
): Promise<any> {
  const e = await getEthers();
  const contract = new e.Contract(nftAddress, NFT_ABI, signer);
  const tx = await contract.mintNFT(to, uri, txOverrides || {});
  return tx;
}

/**
 * Mint a default NFT (auto-generates URI from baseURI + tokenId)
 */
export async function mintDefaultNFT(
  nftAddress: string,
  to: string,
  signer: Signer,
  txOverrides?: TxOverrides
): Promise<any> {
  const e = await getEthers();
  const contract = new e.Contract(nftAddress, NFT_ABI, signer);
  const tx = await contract.mintDefaultNFT(to, txOverrides || {});
  return tx;
}

/**
 * Check token existence
 */
export async function tokenExists(
  nftAddress: string,
  tokenId: string,
  provider: providers.Provider
): Promise<boolean> {
  const e = await getEthers();
  const contract = new e.Contract(nftAddress, NFT_ABI, provider);
  return await contract.tokenExists(tokenId);
}

/**
 * Burn (destroy) an NFT
 */
export async function burnNFT(
  nftAddress: string,
  tokenId: string,
  signer: Signer,
  txOverrides?: TxOverrides
): Promise<any> {
  const e = await getEthers();
  const contract = new e.Contract(nftAddress, NFT_ABI, signer);
  const tx = await contract.burn(tokenId, txOverrides || {});
  return tx;
}

/**
 * Format address for display
 */
export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format timestamp to readable date
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}

/**
 * Check if MetaMask is installed
 */
export function isMetaMaskInstalled(): boolean {
  return typeof window !== "undefined" && !!window.ethereum;
}

/**
 * Resolve an injected wallet provider. Prefer MetaMask, but support the
 * EIP-6963 provider discovery flow used by modern wallet extensions.
 */
export async function getInjectedWalletProvider(): Promise<NonNullable<Window["ethereum"]> | null> {
  if (typeof window === "undefined") return null;

  if (window.ethereum) return window.ethereum;

  const discoveredProviders: EIP6963ProviderDetail[] = [];

  const provider = await new Promise<NonNullable<Window["ethereum"]> | null>((resolve) => {
    const timeout = window.setTimeout(() => {
      window.removeEventListener(
        "eip6963:announceProvider",
        handleProviderAnnouncement as EventListener
      );
      const metamaskProvider =
        discoveredProviders.find(
          ({ info, provider }) =>
            provider.isMetaMask || info.rdns === "io.metamask" || /metamask/i.test(info.name)
        )?.provider || discoveredProviders[0]?.provider;
      resolve(metamaskProvider || null);
    }, 500);

    function handleProviderAnnouncement(event: EIP6963AnnounceProviderEvent) {
      discoveredProviders.push(event.detail);
      if (
        event.detail.provider.isMetaMask ||
        event.detail.info.rdns === "io.metamask" ||
        /metamask/i.test(event.detail.info.name)
      ) {
        window.clearTimeout(timeout);
        window.removeEventListener(
          "eip6963:announceProvider",
          handleProviderAnnouncement as EventListener
        );
        resolve(event.detail.provider);
      }
    }

    window.addEventListener(
      "eip6963:announceProvider",
      handleProviderAnnouncement as EventListener
    );
    window.dispatchEvent(new Event("eip6963:requestProvider"));
  });

  return provider;
}

/**
 * Get network name from chain ID
 */
export function getNetworkName(chainId: number): string {
  const networks: Record<number, string> = {
    1: "Ethereum Mainnet",
    5: "Goerli Testnet",
    11155111: "Sepolia Testnet",
    280: "zkSync Era Testnet (Goerli)",
    300: "zkSync Era Testnet (Sepolia)",
    324: "zkSync Era Mainnet",
  };
  return networks[chainId] || `Unknown Chain (${chainId})`;
}

/**
 * Get explorer URL for a transaction
 */
export function getExplorerUrl(chainId: number, txHash: string): string {
  switch (chainId) {
    case 324:
      return `https://explorer.zksync.io/tx/${txHash}`;
    case 300:
      return `https://sepolia.explorer.zksync.io/tx/${txHash}`;
    default:
      return `https://etherscan.io/tx/${txHash}`;
  }
}

/**
 * Get explorer URL for a token (NFT)
 */
export function getTokenExplorerUrl(chainId: number, nftAddress: string, _tokenId: string): string {
  switch (chainId) {
    case 324:
      return `https://explorer.zksync.io/token/${nftAddress}`;
    case 300:
      return `https://sepolia.explorer.zksync.io/token/${nftAddress}`;
    default:
      return `https://etherscan.io/nft/${nftAddress}/${_tokenId}`;
  }
}

/**
 * Generate a default SVG-based NFT image URI (data URI)
 * For demo purposes - creates a unique colorful SVG based on token ID
 */
export function generateDemoNFTImage(tokenId: string, symbol: string): string {
  const hue = (parseInt(tokenId) * 137.508) % 360; // Golden angle for distribution
  const hue2 = (hue + 60) % 360;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:hsl(${hue},70%,50%)"/>
        <stop offset="100%" style="stop-color:hsl(${hue2},80%,30%)"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="url(#bg)" rx="20"/>
    <text x="200" y="180" text-anchor="middle" fill="rgba(255,255,255,0.2)" font-size="120" font-weight="bold" font-family="monospace">#${tokenId}</text>
    <text x="200" y="230" text-anchor="middle" fill="white" font-size="28" font-weight="bold" font-family="sans-serif">${symbol}</text>
    <text x="200" y="270" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-size="16" font-family="sans-serif">zkSync Era NFT</text>
    <text x="200" y="310" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="12" font-family="monospace">Token ID: ${tokenId}</text>
    <rect x="140" y="340" width="120" height="30" rx="15" fill="rgba(255,255,255,0.15)"/>
    <text x="200" y="360" text-anchor="middle" fill="white" font-size="11" font-family="sans-serif">Layer 2 by zkSync</text>
  </svg>`;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
