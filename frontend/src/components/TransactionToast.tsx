import React from "react";
import { AlertCircle, CheckCircle2, ExternalLink, Info, Loader2, X } from "lucide-react";

interface TransactionToastProps {
  txResult: {
    hash: string;
    explorerUrl: string;
    status: string;
  } | null;
  onDismiss: () => void;
}

const TransactionToast: React.FC<TransactionToastProps> = ({
  txResult,
  onDismiss,
}) => {
  if (!txResult) return null;

  const normalizedStatus = txResult.status.toLowerCase();
  const isSuccess =
    normalizedStatus === "confirmed" || normalizedStatus.includes("success");
  const isError = normalizedStatus.includes("error") || normalizedStatus === "failed";
  const isPending = normalizedStatus === "pending";

  const statusClass = isSuccess ? "success" : isError ? "error" : isPending ? "pending" : "info";
  const title = isSuccess
    ? "Transaction confirmed"
    : isError
    ? "Transaction failed"
    : isPending
    ? "Transaction pending"
    : "Transaction update";
  const Icon = isSuccess ? CheckCircle2 : isError ? AlertCircle : isPending ? Loader2 : Info;

  return (
    <div className={`toast toast-${statusClass}`}>
      <div className="toast-content">
        <span className="toast-icon">
          <Icon size={18} className={isPending ? "spin-icon" : ""} />
        </span>
        <div className="toast-text">
          <div className="toast-title">{title}</div>
          <div className="toast-detail">
            {txResult.hash ? (
              <span>
                Hash: {txResult.hash.slice(0, 10)}...{txResult.hash.slice(-6)}
              </span>
            ) : (
              <span>{txResult.status}</span>
            )}
          </div>
          {txResult.explorerUrl && (
            <a
              href={txResult.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="toast-link"
            >
              <ExternalLink size={13} />
              View on zkSync Explorer
            </a>
          )}
        </div>
      </div>
      <button className="toast-close" onClick={onDismiss}>
        <X size={16} />
      </button>
    </div>
  );
};

export default TransactionToast;
