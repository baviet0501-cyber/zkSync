import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  MessageSquare,
  Send,
  User,
} from "lucide-react";
import { formatTimestamp } from "../utils/contract";

interface TxResultDisplay {
  hash: string;
  explorerUrl: string;
  status: string;
}

interface GreeterPanelProps {
  greeting: {
    message: string;
    owner: string;
    lastUpdated: number;
    chainId: number;
  } | null;
  isConnected: boolean;
  isProcessing: boolean;
  walletAddress: string | null;
  txResult?: TxResultDisplay | null;
  onUpdateGreeting: (message: string) => void;
}

const MAX_GREETING_LENGTH = 256;

const GreeterPanel: React.FC<GreeterPanelProps> = ({
  greeting,
  isConnected,
  isProcessing,
  walletAddress,
  txResult,
  onUpdateGreeting,
}) => {
  const [newGreeting, setNewGreeting] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [dismissedInline, setDismissedInline] = useState(false);
  const isOwner =
    !!greeting?.owner &&
    !!walletAddress &&
    greeting.owner.toLowerCase() === walletAddress.toLowerCase();
  const canUpdateGreeting = isConnected && isOwner;

  useEffect(() => {
    if (txResult?.hash) setDismissedInline(false);
  }, [txResult?.hash]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = newGreeting.trim();

    if (!trimmed) {
      setFormError("Greeting cannot be empty.");
      return;
    }

    if (trimmed.length > MAX_GREETING_LENGTH) {
      setFormError(`Greeting must be ${MAX_GREETING_LENGTH} characters or less.`);
      return;
    }

    if (!canUpdateGreeting) {
      setFormError("Only the contract owner can update the greeting.");
      return;
    }

    setFormError(null);
    onUpdateGreeting(trimmed);
    setNewGreeting("");
  };

  return (
    <div className="card workflow-card">
      <div className="card-header workflow-card-header">
        <div className="card-icon">
          <MessageSquare size={18} />
        </div>
        <div>
          <h3>Greeter Contract</h3>
          <p>Read and update an on-chain greeting.</p>
        </div>
        <span className="badge badge-zksync">zkSync Era</span>
      </div>

      <div className="card-body">
        <div className="contract-summary-grid">
          <div className="summary-tile summary-tile-wide">
            <span className="summary-label">Current greeting</span>
            <strong className="greeting-text">
              {greeting?.message || (isConnected ? "Fetching greeting..." : "Connect wallet")}
            </strong>
          </div>
          <div className="summary-tile">
            <span className="summary-label">
              <User size={14} />
              Owner
            </span>
            <strong className="mono">
              {greeting
                ? `${greeting.owner.slice(0, 6)}...${greeting.owner.slice(-4)}`
                : "--"}
            </strong>
          </div>
          <div className="summary-tile">
            <span className="summary-label">
              <Clock size={14} />
              Last updated
            </span>
            <strong>{greeting ? formatTimestamp(greeting.lastUpdated) : "--"}</strong>
          </div>
          <div className="summary-tile">
            <span className="summary-label">Chain ID</span>
            <strong>{greeting?.chainId || "--"}</strong>
          </div>
          <div className="summary-tile">
            <span className="summary-label">Connected wallet</span>
            <strong className="mono">
              {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "--"}
            </strong>
          </div>
        </div>

        {isConnected && (
          <form className="greeting-form" onSubmit={handleSubmit}>
            <div className="form-group">
              {greeting && !isOwner && (
                <div className="error-message">
                  This connected wallet is not the contract owner, so it cannot update the greeting.
                </div>
              )}
              <div className="form-label-row">
                <label htmlFor="greeting-input">New greeting</label>
                <span className="balance-hint">
                  {newGreeting.length} / {MAX_GREETING_LENGTH}
                </span>
              </div>
              <div className="input-row">
                <input
                  id="greeting-input"
                  type="text"
                  value={newGreeting}
                  onChange={(event) => {
                    setNewGreeting(event.target.value);
                    setFormError(null);
                  }}
                  placeholder="Enter a greeting message"
                  maxLength={MAX_GREETING_LENGTH}
                  disabled={isProcessing || !canUpdateGreeting}
                  className="input"
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!newGreeting.trim() || isProcessing || !canUpdateGreeting}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={16} className="spin-icon" />
                      Updating
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Update Greeting
                    </>
                  )}
                </button>
              </div>
              {formError && <div className="error-message">{formError}</div>}
            </div>
          </form>
        )}

        {txResult?.hash && !dismissedInline && (
          <div className={`inline-tx-result ${txResult.status === "confirmed" ? "success" : txResult.status?.includes("Error") ? "error" : "pending"}`}>
            <div className="inline-tx-header">
              <span className="inline-tx-icon">
                {txResult.status === "confirmed" ? <CheckCircle2 size={16} /> : <Loader2 size={16} className="spin-icon" />}
              </span>
              <span className="inline-tx-title">
                {txResult.status === "confirmed" ? "Greeting updated" : txResult.status}
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

export default GreeterPanel;
