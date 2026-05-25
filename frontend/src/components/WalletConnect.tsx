import React from "react";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  LogOut,
  Network,
  RefreshCw,
  Wallet,
} from "lucide-react";
import type { WalletState } from "../types";
import { shortenAddress } from "../utils/contract";

interface WalletConnectProps {
  wallet: WalletState;
  onConnect: () => void;
  onSwitchNetwork: () => void;
  onDisconnect: () => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({
  wallet,
  onConnect,
  onSwitchNetwork,
  onDisconnect,
}) => {
  return (
    <div className="card wallet-card">
      <div className="card-header">
        <div className="card-icon">
          <Wallet size={18} />
        </div>
        <h3>Wallet</h3>
      </div>

      {!wallet.isConnected ? (
        <div className="wallet-not-connected">
          <div className="wallet-info-text">
            Connect MetaMask to run the demo workflows against zkSync Era.
          </div>
          <button
            className="btn btn-primary btn-lg"
            onClick={onConnect}
            disabled={wallet.isConnecting}
          >
            {wallet.isConnecting ? (
              <>
                <span className="spinner" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet size={17} />
                Connect MetaMask
              </>
            )}
          </button>
          {wallet.error && (
            <div className="error-message">
              <AlertCircle size={16} />
              {wallet.error}
            </div>
          )}
        </div>
      ) : (
        <div className="wallet-connected">
          <div className="wallet-status">
            <CheckCircle2 size={16} />
            <span>Connected</span>
          </div>

          <div className="wallet-details">
            <div className="detail-row">
              <span className="detail-label">Address</span>
              <span className="detail-value mono">
                {shortenAddress(wallet.address!)}
                <button
                  className="btn-copy"
                  onClick={() => navigator.clipboard.writeText(wallet.address!)}
                  title="Copy address"
                >
                  <Copy size={14} />
                </button>
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Network</span>
              <span className={`detail-value ${wallet.network?.isL2 ? "l2-badge" : "l1-badge"}`}>
                <Network size={14} />
                {wallet.network?.name || "Unknown"}
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Balance</span>
              <span className="detail-value">{wallet.balance}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Type</span>
              <span className={`detail-value ${wallet.network?.isL2 ? "l2-badge" : "l1-badge"}`}>
                {wallet.network?.isL2 ? "Layer 2 zkSync" : "Layer 1"}
              </span>
            </div>
          </div>

          <div className="wallet-actions">
            {!wallet.network?.isL2 && (
              <button className="btn btn-secondary" onClick={onSwitchNetwork}>
                <RefreshCw size={16} />
                Switch to zkSync
              </button>
            )}
            <button className="btn btn-outline" onClick={onDisconnect}>
              <LogOut size={16} />
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
