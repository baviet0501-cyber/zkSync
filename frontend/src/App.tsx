import React, { useEffect, useState } from "react";
import {
  Coins,
  Image,
  Layers,
  MessageSquare,
  Network,
  Wallet,
} from "lucide-react";
import { useZkSync } from "./hooks/useZkSync";
import WalletConnect from "./components/WalletConnect";
import GreeterPanel from "./components/GreeterPanel";
import TokenPanel from "./components/TokenPanel";
import NFTPanel from "./components/NFTPanel";
import NetworkStats from "./components/NetworkStats";
import TransactionToast from "./components/TransactionToast";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const CONTRACT_ADDRESSES = {
  greeter: import.meta.env.VITE_GREETER_ADDRESS || ZERO_ADDRESS,
  simpleToken: import.meta.env.VITE_TOKEN_ADDRESS || ZERO_ADDRESS,
  paymaster: import.meta.env.VITE_PAYMASTER_ADDRESS || ZERO_ADDRESS,
  simpleNFT: import.meta.env.VITE_NFT_ADDRESS || ZERO_ADDRESS,
};

type DashboardTab = "greeter" | "token" | "nft";

const tabs: Array<{
  id: DashboardTab;
  label: string;
  description: string;
  Icon: typeof MessageSquare;
}> = [
  {
    id: "greeter",
    label: "Greeter",
    description: "Read and update a message on-chain",
    Icon: MessageSquare,
  },
  {
    id: "token",
    label: "Token",
    description: "Check balance and transfer ERC-20 tokens",
    Icon: Coins,
  },
  {
    id: "nft",
    label: "NFTs",
    description: "Mint, view, and burn ERC-721 NFTs",
    Icon: Image,
  },
];

const App: React.FC = () => {
  const {
    wallet,
    greeting,
    token,
    nftCollection,
    nftTokens,
    isProcessing,
    txResult,
    connectWallet,
    switchToZkSync,
    updateGreeting,
    sendTokens,
    mintToken,
    burnToken,
    mintNFT,
    burnNFT,
    refreshContractData,
    fetchNFTData,
    disconnectWallet,
    shortenAddress,
  } = useZkSync(CONTRACT_ADDRESSES);

  const [activeTab, setActiveTab] = useState<DashboardTab>("greeter");
  const [dismissedTx, setDismissedTx] = useState(false);

  useEffect(() => {
    if (txResult) {
      setDismissedTx(false);
      const timer = setTimeout(() => setDismissedTx(true), 15000);
      return () => clearTimeout(timer);
    }
  }, [txResult]);

  useEffect(() => {
    if (
      wallet.isConnected &&
      wallet.network?.isL2 &&
      (activeTab === "greeter" || activeTab === "token")
    ) {
      refreshContractData();
    }
  }, [activeTab, refreshContractData, wallet.isConnected, wallet.network?.isL2]);

  const isDeployed = CONTRACT_ADDRESSES.greeter !== ZERO_ADDRESS;
  const isNFTDeployed = CONTRACT_ADDRESSES.simpleNFT !== ZERO_ADDRESS;

  return (
    <div className="app dashboard-app">
      <header className="app-header">
        <div className="header-content dashboard-header">
          <div className="logo">
            <div className="logo-icon">
              <Layers size={22} />
            </div>
            <div className="logo-text">
              <h1>zkSync Demo Dashboard</h1>
              <span className="logo-subtitle">Smart contract interaction demo</span>
            </div>
          </div>

          <div className="header-status">
            {wallet.network && (
              <div className={`network-pill ${wallet.network.isL2 ? "is-l2" : "is-l1"}`}>
                <Network size={15} />
                {wallet.network.name}
              </div>
            )}
            {wallet.isConnected && wallet.address && (
              <div className="connection-badge">
                <Wallet size={15} />
                {shortenAddress(wallet.address)}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="app-main dashboard-shell">
        <aside className="dashboard-sidebar">
          <WalletConnect
            wallet={wallet}
            onConnect={connectWallet}
            onSwitchNetwork={switchToZkSync}
            onDisconnect={disconnectWallet}
          />
          <NetworkStats />
        </aside>

        <section className="dashboard-main">
          <div className="workflow-tabs">
            {tabs.map(({ id, label, description, Icon }) => (
              <button
                key={id}
                className={`workflow-tab ${activeTab === id ? "active" : ""}`}
                onClick={() => setActiveTab(id)}
              >
                <Icon size={18} />
                <span>
                  <strong>{label}</strong>
                  <small>{description}</small>
                </span>
              </button>
            ))}
          </div>

          {!wallet.isConnected && (
            <div className="card info-card">
              <div className="card-body">
                <div className="info-content">
                  <Wallet size={22} />
                  <div>
                    <h4>Connect wallet to start the demo</h4>
                    <p>
                      Connect MetaMask and switch to zkSync Era Testnet to use
                      Greeter, Token, and NFT workflows.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {wallet.isConnected && !isDeployed && activeTab !== "nft" && (
            <div className="card info-card">
              <div className="card-body">
                <div className="info-content">
                  <Network size={22} />
                  <div>
                    <h4>Contracts not deployed</h4>
                    <p>Deploy Greeter and Token contracts before using this workflow.</p>
                    <code className="code-block">npm run deploy:testnet</code>
                  </div>
                </div>
              </div>
            </div>
          )}

          {wallet.isConnected && activeTab === "greeter" && isDeployed && (
            <GreeterPanel
              greeting={greeting}
              isConnected={wallet.isConnected}
              isProcessing={isProcessing}
              walletAddress={wallet.address}
              txResult={txResult}
              onUpdateGreeting={updateGreeting}
            />
          )}

          {wallet.isConnected && activeTab === "token" && isDeployed && (
            <TokenPanel
              token={token}
              isConnected={wallet.isConnected}
              isProcessing={isProcessing}
              txResult={txResult}
              walletAddress={wallet.address}
              paymasterEnabled={CONTRACT_ADDRESSES.paymaster !== ZERO_ADDRESS}
              onSendTokens={sendTokens}
              onMintTokens={mintToken}
              onBurnTokens={burnToken}
            />
          )}

          {wallet.isConnected && activeTab === "nft" && !isNFTDeployed && (
            <div className="card info-card">
              <div className="card-body">
                <div className="info-content">
                  <Image size={22} />
                  <div>
                    <h4>NFT contract not deployed</h4>
                    <p>Deploy the NFT contract before minting and viewing NFTs.</p>
                    <code className="code-block">
                      npx hardhat deploy-zksync --script deploy.ts --network zkSyncTestnet
                    </code>
                  </div>
                </div>
              </div>
            </div>
          )}

          {wallet.isConnected && activeTab === "nft" && isNFTDeployed && (
            <NFTPanel
              nftCollection={nftCollection}
              nftTokens={nftTokens}
              isConnected={wallet.isConnected}
              isProcessing={isProcessing}
              walletAddress={wallet.address}
              networkChainId={wallet.network?.chainId || 300}
              nftContractAddress={CONTRACT_ADDRESSES.simpleNFT}
              onMintNFT={mintNFT}
              onBurnNFT={burnNFT}
              onRefreshNFTs={() => fetchNFTData(wallet.address!)}
            />
          )}
        </section>
      </main>

      {!dismissedTx && (
        <TransactionToast
          txResult={txResult}
          onDismiss={() => setDismissedTx(true)}
        />
      )}
    </div>
  );
};

export default App;
