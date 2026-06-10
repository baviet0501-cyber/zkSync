import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Coins,
  ExternalLink,
  Flame,
  Info,
  Loader2,
  PlusCircle,
  Send,
} from "lucide-react";

interface TxResultDisplay {
  hash: string;
  explorerUrl: string;
  status: string;
}

type TokenAction = "transfer" | "mint" | "burn";

interface TokenPanelProps {
  token: {
    name: string;
    symbol: string;
    balance: string;
    totalSupply: string;
    decimals: number;
    maxSupply: string;
    totalBurned: string;
    owner: string;
  } | null;
  isConnected: boolean;
  isProcessing: boolean;
  walletAddress?: string | null;
  paymasterEnabled?: boolean;
  txResult?: TxResultDisplay | null;
  onSendTokens: (to: string, amount: string) => void;
  onMintTokens: (to: string, amount: string) => void;
  onBurnTokens: (amount: string) => void;
}

function isValidAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

function parseNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

const actionConfig: Record<TokenAction, { label: string; Icon: typeof Send }> = {
  transfer: { label: "Transfer", Icon: Send },
  mint: { label: "Mint", Icon: PlusCircle },
  burn: { label: "Burn", Icon: Flame },
};

const TokenPanel: React.FC<TokenPanelProps> = ({
  token,
  isConnected,
  isProcessing,
  walletAddress,
  paymasterEnabled = false,
  txResult,
  onSendTokens,
  onMintTokens,
  onBurnTokens,
}) => {
  const [activeAction, setActiveAction] = useState<TokenAction>("transfer");
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [mintAddress, setMintAddress] = useState("");
  const [mintAmount, setMintAmount] = useState("");
  const [burnAmount, setBurnAmount] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [dismissedInline, setDismissedInline] = useState(false);

  useEffect(() => {
    if (txResult?.hash) setDismissedInline(false);
  }, [txResult?.hash]);

  const availableBalance = useMemo(() => parseNumber(token?.balance || ""), [token?.balance]);
  const isOwner = Boolean(
    token?.owner && walletAddress && token.owner.toLowerCase() === walletAddress.toLowerCase()
  );

  const validateAmount = (value: string, label = "Amount") => {
    const numericAmount = parseNumber(value.trim());
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return `${label} must be greater than 0.`;
    }
    return null;
  };

  const handleTransferSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const cleanAddress = toAddress.trim();
    const cleanAmount = amount.trim();

    if (!isValidAddress(cleanAddress)) {
      setFormError("Recipient must be a valid 0x address.");
      return;
    }

    const amountError = validateAmount(cleanAmount);
    if (amountError) {
      setFormError(amountError);
      return;
    }

    if (Number.isFinite(availableBalance) && parseNumber(cleanAmount) > availableBalance) {
      setFormError("Amount exceeds your current balance.");
      return;
    }

    setFormError(null);
    onSendTokens(cleanAddress, cleanAmount);
    setToAddress("");
    setAmount("");
  };

  const handleMintSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const cleanAddress = mintAddress.trim();
    const cleanAmount = mintAmount.trim();

    if (!isOwner) {
      setFormError("Only the token owner can mint.");
      return;
    }

    if (!isValidAddress(cleanAddress)) {
      setFormError("Recipient must be a valid 0x address.");
      return;
    }

    const amountError = validateAmount(cleanAmount);
    if (amountError) {
      setFormError(amountError);
      return;
    }

    setFormError(null);
    onMintTokens(cleanAddress, cleanAmount);
    setMintAddress("");
    setMintAmount("");
  };

  const handleBurnSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const cleanAmount = burnAmount.trim();
    const amountError = validateAmount(cleanAmount);

    if (amountError) {
      setFormError(amountError);
      return;
    }

    if (Number.isFinite(availableBalance) && parseNumber(cleanAmount) > availableBalance) {
      setFormError("Burn amount exceeds your current balance.");
      return;
    }

    setFormError(null);
    onBurnTokens(cleanAmount);
    setBurnAmount("");
  };

  const switchAction = (action: TokenAction) => {
    setActiveAction(action);
    setFormError(null);
  };

  const txTitle = txResult?.status === "Tokens minted"
    ? "Tokens minted"
    : txResult?.status === "Tokens burned"
    ? "Tokens burned"
    : txResult?.status === "confirmed"
    ? "Tokens sent"
    : txResult?.status;

  return (
    <div className="card workflow-card">
      <div className="card-header workflow-card-header">
        <div className="card-icon">
          <Coins size={18} />
        </div>
        <div>
          <h3>Token Dashboard</h3>
          <p>View balance, mint, burn, and transfer ERC-20 tokens.</p>
        </div>
        <div className="token-header-badges">
          {paymasterEnabled && <span className="badge badge-paymaster">Gas via token</span>}
          <span className="badge badge-erc20">ERC-20</span>
        </div>
      </div>

      <div className="card-body">
        {token ? (
          <>
            <div className="token-balance-display">
              <div className="token-main">
                <div className="token-amount">{token.balance}</div>
                <div className="token-symbol">{token.symbol}</div>
              </div>
              <div className="token-name">{token.name}</div>
              <div className="token-total-supply">
                Total supply: {token.totalSupply} {token.symbol}
              </div>
            </div>

            <div className="token-info-grid">
              <div className="token-info-item">
                <span>Max supply</span>
                <strong>{token.maxSupply} {token.symbol}</strong>
              </div>
              <div className="token-info-item">
                <span>Burned</span>
                <strong>{token.totalBurned} {token.symbol}</strong>
              </div>
              <div className="token-info-item token-info-wide">
                <span>Owner</span>
                <strong className="mono">{shortenAddress(token.owner)}</strong>
              </div>
            </div>
          </>
        ) : (
          <div className="token-placeholder">
            <Coins size={34} />
            <p>{isConnected ? "Loading token data..." : "Connect wallet to view token balance"}</p>
          </div>
        )}

        {isConnected && token && (
          <div className="token-actions-panel">
            <div className="token-action-tabs" role="tablist" aria-label="Token actions">
              {(Object.keys(actionConfig) as TokenAction[]).map((action) => {
                const { label, Icon } = actionConfig[action];
                return (
                  <button
                    key={action}
                    type="button"
                    className={`token-action-tab ${activeAction === action ? "active" : ""}`}
                    onClick={() => switchAction(action)}
                    disabled={isProcessing}
                  >
                    <Icon size={15} />
                    {label}
                  </button>
                );
              })}
            </div>

            {activeAction === "transfer" && (
              <form className="token-action-form" onSubmit={handleTransferSubmit}>
                <div className="form-group">
                  <label htmlFor="to-address">Recipient address</label>
                  <input
                    id="to-address"
                    type="text"
                    value={toAddress}
                    onChange={(event) => {
                      setToAddress(event.target.value);
                      setFormError(null);
                    }}
                    placeholder="0x..."
                    disabled={isProcessing}
                    className="input mono"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="amount">Amount ({token.symbol})</label>
                  <input
                    id="amount"
                    type="number"
                    min="0"
                    step="any"
                    value={amount}
                    onChange={(event) => {
                      setAmount(event.target.value);
                      setFormError(null);
                    }}
                    placeholder="0.0"
                    disabled={isProcessing}
                    className="input"
                  />
                  <div className="balance-hint">
                    Available: {token.balance} {token.symbol}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  disabled={!toAddress.trim() || !amount.trim() || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={16} className="spin-icon" />
                      Sending
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send Tokens
                    </>
                  )}
                </button>
              </form>
            )}

            {activeAction === "mint" && (
              <form className="token-action-form" onSubmit={handleMintSubmit}>
                {!isOwner && (
                  <div className="token-action-note">
                    <Info size={15} />
                    Connected wallet is not the token owner.
                  </div>
                )}
                <div className="form-group">
                  <label htmlFor="mint-address">Recipient address</label>
                  <input
                    id="mint-address"
                    type="text"
                    value={mintAddress}
                    onChange={(event) => {
                      setMintAddress(event.target.value);
                      setFormError(null);
                    }}
                    placeholder="0x..."
                    disabled={isProcessing || !isOwner}
                    className="input mono"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="mint-amount">Amount ({token.symbol})</label>
                  <input
                    id="mint-amount"
                    type="number"
                    min="0"
                    step="any"
                    value={mintAmount}
                    onChange={(event) => {
                      setMintAmount(event.target.value);
                      setFormError(null);
                    }}
                    placeholder="0.0"
                    disabled={isProcessing || !isOwner}
                    className="input"
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-secondary btn-full"
                  disabled={!mintAddress.trim() || !mintAmount.trim() || isProcessing || !isOwner}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={16} className="spin-icon" />
                      Minting
                    </>
                  ) : (
                    <>
                      <PlusCircle size={16} />
                      Mint Tokens
                    </>
                  )}
                </button>
              </form>
            )}

            {activeAction === "burn" && (
              <form className="token-action-form" onSubmit={handleBurnSubmit}>
                <div className="form-group">
                  <label htmlFor="burn-amount">Amount ({token.symbol})</label>
                  <input
                    id="burn-amount"
                    type="number"
                    min="0"
                    step="any"
                    value={burnAmount}
                    onChange={(event) => {
                      setBurnAmount(event.target.value);
                      setFormError(null);
                    }}
                    placeholder="0.0"
                    disabled={isProcessing}
                    className="input"
                  />
                  <div className="balance-hint">
                    Available: {token.balance} {token.symbol}
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-danger btn-full"
                  disabled={!burnAmount.trim() || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={16} className="spin-icon" />
                      Burning
                    </>
                  ) : (
                    <>
                      <Flame size={16} />
                      Burn Tokens
                    </>
                  )}
                </button>
              </form>
            )}

            {formError && (
              <div className="error-message">
                <AlertCircle size={16} />
                {formError}
              </div>
            )}
          </div>
        )}

        {txResult?.hash && !dismissedInline && (
          <div className={`inline-tx-result ${txResult.status === "confirmed" || txResult.status === "Tokens minted" || txResult.status === "Tokens burned" ? "success" : txResult.status?.includes("Error") ? "error" : "pending"}`}>
            <div className="inline-tx-header">
              <span className="inline-tx-icon">
                {txResult.status === "confirmed" || txResult.status === "Tokens minted" || txResult.status === "Tokens burned" ? <CheckCircle2 size={16} /> : <Loader2 size={16} className="spin-icon" />}
              </span>
              <span className="inline-tx-title">{txTitle}</span>
              <button className="inline-tx-close" onClick={() => setDismissedInline(true)} title="Dismiss">
                x
              </button>
            </div>
            <div className="inline-tx-hash">
              Hash: {txResult.hash.slice(0, 10)}...{txResult.hash.slice(-6)}
            </div>
            {txResult.explorerUrl && (
              <a href={txResult.explorerUrl} target="_blank" rel="noopener noreferrer" className="inline-tx-link">
                <ExternalLink size={14} />
                View on zkSync Explorer
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenPanel;
