import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Coins,
  ExternalLink,
  Loader2,
  Send,
} from "lucide-react";

interface TxResultDisplay {
  hash: string;
  explorerUrl: string;
  status: string;
}

interface TokenPanelProps {
  token: {
    name: string;
    symbol: string;
    balance: string;
    totalSupply: string;
    decimals: number;
  } | null;
  isConnected: boolean;
  isProcessing: boolean;
  txResult?: TxResultDisplay | null;
  onSendTokens: (to: string, amount: string) => void;
}

function isValidAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

function parseNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

const TokenPanel: React.FC<TokenPanelProps> = ({
  token,
  isConnected,
  isProcessing,
  txResult,
  onSendTokens,
}) => {
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [dismissedInline, setDismissedInline] = useState(false);

  useEffect(() => {
    if (txResult?.hash) setDismissedInline(false);
  }, [txResult?.hash]);

  const availableBalance = useMemo(() => parseNumber(token?.balance || ""), [token?.balance]);

  const validate = () => {
    const cleanAddress = toAddress.trim();
    const cleanAmount = amount.trim();
    const numericAmount = parseNumber(cleanAmount);

    if (!isValidAddress(cleanAddress)) {
      return "Recipient must be a valid 0x address.";
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return "Amount must be greater than 0.";
    }

    if (Number.isFinite(availableBalance) && numericAmount > availableBalance) {
      return "Amount exceeds your current balance.";
    }

    return null;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const error = validate();
    if (error) {
      setFormError(error);
      return;
    }

    setFormError(null);
    onSendTokens(toAddress.trim(), amount.trim());
    setToAddress("");
    setAmount("");
  };

  return (
    <div className="card workflow-card">
      <div className="card-header workflow-card-header">
        <div className="card-icon">
          <Coins size={18} />
        </div>
        <div>
          <h3>Token Dashboard</h3>
          <p>View balance and transfer ERC-20 tokens.</p>
        </div>
        <span className="badge badge-erc20">ERC-20</span>
      </div>

      <div className="card-body">
        {token ? (
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
        ) : (
          <div className="token-placeholder">
            <Coins size={34} />
            <p>{isConnected ? "Loading token data..." : "Connect wallet to view token balance"}</p>
          </div>
        )}

        {isConnected && token && (
          <form className="transfer-form" onSubmit={handleSubmit}>
            <h4 className="form-title">Transfer Tokens</h4>

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

            {formError && (
              <div className="error-message">
                <AlertCircle size={16} />
                {formError}
              </div>
            )}

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

        {txResult?.hash && !dismissedInline && (
          <div className={`inline-tx-result ${txResult.status === "confirmed" ? "success" : txResult.status?.includes("Error") ? "error" : "pending"}`}>
            <div className="inline-tx-header">
              <span className="inline-tx-icon">
                {txResult.status === "confirmed" ? <CheckCircle2 size={16} /> : <Loader2 size={16} className="spin-icon" />}
              </span>
              <span className="inline-tx-title">
                {txResult.status === "confirmed" ? "Tokens sent" : txResult.status}
              </span>
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
