import React from "react";
import { Gauge, Link2, Lock, Network, Timer, WalletCards } from "lucide-react";

const stats = [
  { label: "L2 block time", value: "~1 sec", Icon: Timer },
  { label: "L1 finality", value: "~1 hour", Icon: Lock },
  { label: "Fee reduction", value: "80-90%", Icon: WalletCards },
  { label: "TPS theoretical", value: "20,000+", Icon: Gauge },
  { label: "Testnet chain", value: "300", Icon: Link2 },
  { label: "Mainnet chain", value: "324", Icon: Link2 },
];

const NetworkStats: React.FC = () => {
  return (
    <div className="card network-stats">
      <div className="card-header">
        <div className="card-icon">
          <Network size={18} />
        </div>
        <h3>Network Snapshot</h3>
      </div>
      <div className="card-body">
        <div className="stats-grid">
          {stats.map(({ label, value, Icon }) => (
            <div key={label} className="stat-item">
              <span className="stat-icon">
                <Icon size={17} />
              </span>
              <div className="stat-info">
                <span className="stat-label">{label}</span>
                <span className="stat-value">{value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NetworkStats;
