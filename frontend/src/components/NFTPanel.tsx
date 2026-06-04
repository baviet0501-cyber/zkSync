import React, { useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Flame,
  Image,
  Loader2,
  Lock,
  Minus,
  Plus,
  RefreshCw,
  Upload,
  X,
} from "lucide-react";
import type { NFTToken } from "../types";
import {
  shortenAddress,
  getExplorerUrl,
  getTokenExplorerUrl,
} from "../utils/contract";

interface NFTPanelProps {
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
  isConnected: boolean;
  isProcessing: boolean;
  walletAddress: string | null;
  networkChainId: number;
  nftContractAddress: string;
  onMintNFT: (
    count: number,
    metadata?: { name?: string; description?: string; imageDataUri?: string }
  ) => Promise<void> | void;
  onBurnNFT?: (tokenId: string) => void;
  onRefreshNFTs: () => void;
}

const MAX_IMAGE_SIZE = 500 * 1024;
const MAX_DESCRIPTION_LENGTH = 280;

const statusLabel: Record<NFTToken["status"], string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  failed: "Failed",
};

const statusIcon: Record<NFTToken["status"], typeof CheckCircle2> = {
  pending: Loader2,
  confirmed: CheckCircle2,
  failed: AlertCircle,
};

function fallbackImage(tokenId: string) {
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="#1A1A3E" width="400" height="400"/><text x="200" y="205" text-anchor="middle" fill="#6B6B8D" font-size="18">#${tokenId}</text></svg>`
  )}`;
}

const NFTPanel: React.FC<NFTPanelProps> = ({
  nftCollection,
  nftTokens,
  isConnected,
  isProcessing,
  walletAddress,
  networkChainId,
  nftContractAddress,
  onMintNFT,
  onBurnNFT,
  onRefreshNFTs,
}) => {
  const [selectedNFT, setSelectedNFT] = useState<NFTToken | null>(null);
  const [mintCount, setMintCount] = useState(1);
  const [nftName, setNftName] = useState("");
  const [nftDescription, setNftDescription] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isZkSyncNetwork = networkChainId === 300 || networkChainId === 324;
  const canMintNFT = isConnected && isZkSyncNetwork;
  const mintProgress = nftCollection
    ? ((parseInt(nftCollection.totalMinted) / parseInt(nftCollection.maxSupply)) * 100).toFixed(1)
    : "0";

  const clearForm = () => {
    setNftName("");
    setNftDescription("");
    setImagePreview(null);
    setFormError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      setFormError(
        `Image is ${(file.size / 1024).toFixed(0)} KB. The demo limit is 500 KB.`
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      setImagePreview(readerEvent.target?.result as string);
      setFormError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleMint = async () => {
    const trimmedName = nftName.trim();
    const trimmedDescription = nftDescription.trim();

    if (!isZkSyncNetwork) {
      setFormError("Switch MetaMask to zkSync Era Testnet before minting.");
      return;
    }

    if (imagePreview && !trimmedName) {
      setFormError("Name is required when minting with a custom image.");
      return;
    }

    if (trimmedDescription.length > MAX_DESCRIPTION_LENGTH) {
      setFormError(`Description must be ${MAX_DESCRIPTION_LENGTH} characters or less.`);
      return;
    }

    setFormError(null);
    await onMintNFT(
      mintCount,
      imagePreview
        ? {
            name: trimmedName,
            description: trimmedDescription,
            imageDataUri: imagePreview,
          }
        : undefined
    );
    clearForm();
  };

  const renderStatus = (nft: NFTToken) => (
    <span className={`nft-status-badge status-${nft.status}`}>
      {React.createElement(statusIcon[nft.status], {
        size: 12,
        className: nft.status === "pending" ? "spin-icon" : undefined,
      })}
      {statusLabel[nft.status]}
    </span>
  );

  return (
    <div className="card nft-panel">
      <div className="card-header">
        <div className="card-icon">
          <Image size={18} />
        </div>
        <h3>NFT Gallery</h3>
        <span className="badge badge-nft">ERC-721</span>
      </div>

      <div className="card-body">
        {nftCollection ? (
          <div className="nft-collection-info">
            <div className="nft-collection-name">
              <strong>{nftCollection.name}</strong>
              <span className="nft-collection-symbol">({nftCollection.symbol})</span>
            </div>
            <div className="nft-supply-bar-container">
              <div className="nft-supply-header">
                <span className="nft-supply-label">Minted</span>
                <span className="nft-supply-count">
                  {nftCollection.totalMinted} / {nftCollection.maxSupply}
                </span>
              </div>
              <div className="nft-supply-bar">
                <div
                  className="nft-supply-fill"
                  style={{ width: `${Math.min(parseFloat(mintProgress), 100)}%` }}
                />
              </div>
              <div className="nft-supply-footer">
                <span>Supply: {mintProgress}% filled</span>
                <span>Last minted: {nftCollection.lastMintedAt}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="nft-placeholder">
            <div className="placeholder-icon">
              {isConnected ? <Loader2 size={34} className="spin-icon" /> : <Lock size={34} />}
            </div>
            <p>{isConnected ? "Loading collection data..." : "Connect wallet to view NFTs"}</p>
          </div>
        )}

        {isConnected && nftCollection && (
          <div className="nft-mint-area">
            <div className="nft-mint-header">
              <h4 className="form-title">Mint NFT</h4>
              <button
                className="btn btn-sm btn-outline"
                onClick={onRefreshNFTs}
                disabled={isProcessing}
                title="Refresh NFTs"
              >
                <RefreshCw size={14} />
                Refresh
              </button>
            </div>

            {!isZkSyncNetwork && (
              <div className="error-message">
                <AlertCircle size={16} />
                Switch MetaMask to zkSync Era Testnet before minting or loading NFTs.
              </div>
            )}

            <p className="nft-mint-info">
              Add a clear name, description, and optional image. The demo stores this
              metadata locally in your browser after the transaction confirms.
            </p>

            <div className="nft-custom-mint">
              <input
                type="text"
                className="input nft-name-input"
                placeholder={imagePreview ? "NFT name (required)" : "NFT name (optional)"}
                value={nftName}
                onChange={(event) => setNftName(event.target.value)}
                disabled={isProcessing || !canMintNFT}
              />
              <textarea
                className="input nft-desc-input"
                placeholder={`Description (optional, max ${MAX_DESCRIPTION_LENGTH} chars)`}
                rows={3}
                value={nftDescription}
                onChange={(event) => setNftDescription(event.target.value)}
                disabled={isProcessing || !canMintNFT}
              />
              <div className="balance-hint">
                {nftDescription.length} / {MAX_DESCRIPTION_LENGTH} characters
              </div>
              <div className="nft-image-upload">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileSelect}
                />
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing || !canMintNFT}
                >
                  <Upload size={14} />
                  {imagePreview ? "Change image" : "Choose image"}
                </button>
                {imagePreview && (
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={clearForm}
                    disabled={isProcessing || !canMintNFT}
                    title="Clear metadata"
                  >
                    <X size={14} />
                    Clear
                  </button>
                )}
                {imagePreview && (
                  <div className="nft-image-preview">
                    <img src={imagePreview} alt="NFT preview" />
                  </div>
                )}
              </div>
              {formError && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  {formError}
                </div>
              )}
            </div>

            <div className="nft-mint-actions">
              <div className="nft-mint-count">
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => setMintCount(Math.max(1, mintCount - 1))}
                  disabled={mintCount <= 1 || isProcessing || !canMintNFT}
                >
                  <Minus size={14} />
                </button>
                <span className="nft-count-value">{mintCount}</span>
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => setMintCount(Math.min(5, mintCount + 1))}
                  disabled={mintCount >= 5 || isProcessing || !canMintNFT}
                >
                  <Plus size={14} />
                </button>
              </div>
              <button
                className="btn btn-primary btn-nft-mint"
                onClick={handleMint}
                disabled={isProcessing || !walletAddress || !canMintNFT}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="spin-icon" />
                    Minting {mintCount > 1 ? `${mintCount} NFTs...` : "NFT..."}
                  </>
                ) : (
                  <>
                    <Image size={16} />
                    Mint {mintCount > 1 ? `${mintCount} NFTs` : "NFT"}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {isConnected && nftTokens.length > 0 && (
          <div className="nft-gallery-section">
            <h4 className="form-title">Your NFTs ({nftTokens.length})</h4>
            <div className="nft-gallery-grid">
              {nftTokens.map((nft) => (
                <div
                  key={`${nft.tokenId}-${nft.txHash || "chain"}`}
                  className={`nft-card nft-card-${nft.status}`}
                  onClick={() => setSelectedNFT(nft)}
                >
                  <div className="nft-card-image">
                    <img
                      src={nft.image}
                      alt={nft.name}
                      loading="lazy"
                      onError={(event) => {
                        (event.target as HTMLImageElement).src = fallbackImage(nft.tokenId);
                      }}
                    />
                    <div className="nft-card-overlay">
                      <span className="nft-card-view">View details</span>
                    </div>
                  </div>
                  <div className="nft-card-info">
                    <div className="nft-card-header-row">
                      <div className="nft-card-name" title={nft.name}>
                        {nft.name}
                      </div>
                      {renderStatus(nft)}
                    </div>
                    <div className="nft-token-id">Token #{nft.tokenId}</div>
                    <div className="nft-card-desc" title={nft.description}>
                      {nft.description || "No description provided."}
                    </div>
                    <div className="nft-card-creator">
                      Creator: {shortenAddress(nft.creator)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isConnected && nftCollection && nftTokens.length === 0 && (
          <div className="nft-empty">
            <div className="nft-empty-icon">
              <Image size={40} />
            </div>
            <p className="nft-empty-text">
              This wallet has not minted any NFTs from this collection yet.
            </p>
            <p className="nft-empty-hint">
              Mint one above to add it to this gallery with its image, description, and transaction status.
            </p>
          </div>
        )}
      </div>

      {selectedNFT && (
        <div className="nft-modal-overlay" onClick={() => setSelectedNFT(null)}>
          <div className="nft-modal" onClick={(event) => event.stopPropagation()}>
            <button className="nft-modal-close" onClick={() => setSelectedNFT(null)}>
              <X size={17} />
            </button>
            <div className="nft-modal-content">
              <div className="nft-modal-image">
                <img
                  src={selectedNFT.image}
                  alt={selectedNFT.name}
                  onError={(event) => {
                    (event.target as HTMLImageElement).src = fallbackImage(selectedNFT.tokenId);
                  }}
                />
              </div>
              <div className="nft-modal-details">
                <div className="nft-card-header-row">
                  <h2 className="nft-modal-title">{selectedNFT.name}</h2>
                  {renderStatus(selectedNFT)}
                </div>
                <p className="nft-modal-description">
                  {selectedNFT.description || "No description provided."}
                </p>
                <div className="nft-modal-attributes">
                  <div className="nft-attr">
                    <span className="nft-attr-label">Token ID</span>
                    <span className="nft-attr-value mono">#{selectedNFT.tokenId}</span>
                  </div>
                  <div className="nft-attr">
                    <span className="nft-attr-label">Owner</span>
                    <span className="nft-attr-value mono">
                      {shortenAddress(selectedNFT.owner)}
                    </span>
                  </div>
                  <div className="nft-attr">
                    <span className="nft-attr-label">Creator</span>
                    <span className="nft-attr-value mono">
                      {shortenAddress(selectedNFT.creator)}
                    </span>
                  </div>
                  <div className="nft-attr">
                    <span className="nft-attr-label">Metadata</span>
                    <span className="nft-attr-value">{selectedNFT.metadataSource}</span>
                  </div>
                  <div className="nft-attr">
                    <span className="nft-attr-label">Minted at</span>
                    <span className="nft-attr-value">
                      {selectedNFT.mintedAt
                        ? new Date(selectedNFT.mintedAt * 1000).toLocaleString()
                        : "Unknown"}
                    </span>
                  </div>
                  <div className="nft-attr">
                    <span className="nft-attr-label">Blockchain</span>
                    <span className="nft-attr-value badge-zk">zkSync Era</span>
                  </div>
                </div>

                <div className={`nft-tx-status status-${selectedNFT.status}`}>
                  <span className="nft-tx-status-icon">{statusLabel[selectedNFT.status]}</span>
                  <div className="nft-tx-status-text">
                    <span className="nft-tx-status-label">Transaction status</span>
                    <span className="nft-tx-status-value">
                      {selectedNFT.status === "pending"
                        ? "Waiting for confirmation"
                        : selectedNFT.status === "failed"
                        ? "Transaction failed"
                        : "Confirmed on zkSync Era"}
                    </span>
                  </div>
                </div>

                <div className="nft-modal-links">
                  <a
                    href={
                      selectedNFT.txHash
                        ? getExplorerUrl(networkChainId, selectedNFT.txHash)
                        : getTokenExplorerUrl(
                            networkChainId,
                            nftContractAddress,
                            selectedNFT.tokenId
                          )
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-full"
                  >
                    <ExternalLink size={16} />
                    View on Explorer
                  </a>
                  {selectedNFT.txHash && (
                    <div className="nft-tx-hash">
                      Tx: {selectedNFT.txHash.slice(0, 10)}...{selectedNFT.txHash.slice(-6)}
                    </div>
                  )}
                  {onBurnNFT &&
                    walletAddress &&
                    walletAddress.toLowerCase() === selectedNFT.owner.toLowerCase() &&
                    selectedNFT.status === "confirmed" && (
                      <button
                        className="btn btn-danger btn-full"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Burn NFT #${selectedNFT.tokenId}? This cannot be undone.`
                            )
                          ) {
                            onBurnNFT(selectedNFT.tokenId);
                            setSelectedNFT(null);
                          }
                        }}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 size={16} className="spin-icon" />
                            Burning...
                          </>
                        ) : (
                          <>
                            <Flame size={16} />
                            Burn NFT
                          </>
                        )}
                      </button>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTPanel;
