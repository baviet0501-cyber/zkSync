import React, { useState } from "react";

interface SectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const Section: React.FC<SectionProps> = ({
  title,
  icon,
  children,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`edu-section ${isOpen ? "open" : ""}`}>
      <button className="edu-section-header" onClick={() => setIsOpen(!isOpen)}>
        <span className="edu-section-icon">{icon}</span>
        <span className="edu-section-title">{title}</span>
        <span className={`edu-chevron ${isOpen ? "open" : ""}`}>▾</span>
      </button>
      {isOpen && <div className="edu-section-content">{children}</div>}
    </div>
  );
};

const EducationalPanel: React.FC = () => {
  return (
    <div className="card educational-panel">
      <div className="card-header">
        <div className="card-icon">📚</div>
        <h3>Layer 2 &amp; zkSync Education</h3>
      </div>
      <div className="card-body">
        <p className="edu-intro">
          Learn about Ethereum scaling solutions and how zkSync Era makes
          decentralized applications faster and cheaper.
        </p>

        <Section title="What is Layer 2?" icon="🏗️" defaultOpen={true}>
          <p>
            <strong>Layer 2 (L2)</strong> là các giải pháp mở rộng quy mô được
            xây dựng trên nền tảng của Layer 1 (Ethereum). Chúng xử lý giao dịch
            <strong> off-chain</strong> và chỉ đưa kết quả lên L1 để đảm bảo
            tính bảo mật.
          </p>
          <h4>Vấn đề của Layer 1:</h4>
          <ul>
            <li>
              <strong>Scalability:</strong> Ethereum L1 chỉ xử lý ~15-30 TPS
            </li>
            <li>
              <strong>High fees:</strong> Phí gas có thể lên tới hàng trăm USD
              khi mạng đông đúc
            </li>
            <li>
              <strong>Slow confirmation:</strong> Thời gian block ~12-15 giây
            </li>
          </ul>
          <h4>Giải pháp Layer 2:</h4>
          <div className="comparison-grid">
            <div className="comparison-item">
              <span className="comparison-icon">🔐</span>
              <strong>ZK-Rollups</strong>
              <span>Validity Proofs</span>
            </div>
            <div className="comparison-item">
              <span className="comparison-icon">🔮</span>
              <strong>Optimistic Rollups</strong>
              <span>Fraud Proofs</span>
            </div>
            <div className="comparison-item">
              <span className="comparison-icon">⚡</span>
              <strong>State Channels</strong>
              <span>Off-chain payments</span>
            </div>
            <div className="comparison-item">
              <span className="comparison-icon">🌿</span>
              <strong>Plasma</strong>
              <span>Child chains</span>
            </div>
          </div>
        </Section>

        <Section title="ZK-Rollup - Công nghệ cốt lõi" icon="🔄">
          <p>
            <strong>Zero-Knowledge Rollup (ZK-Rollup)</strong> là công nghệ
            scaling tiên tiến nhất hiện nay, được zkSync Era sử dụng.
          </p>
          <h4>Cách hoạt động:</h4>
          <ol>
            <li>
              <strong>Batching:</strong> Gom nhóm hàng nghìn giao dịch vào một
              batch
            </li>
            <li>
              <strong>Proving:</strong> Tạo ZK-SNARK proof chứng minh tính hợp
              lệ của tất cả giao dịch
            </li>
            <li>
              <strong>Verification:</strong> Gửi proof lên Ethereum L1,
              contract xác thực chỉ trong vài mili-giây
            </li>
            <li>
              <strong>Settlement:</strong> State được cập nhật trên L1 với
              finality gần như tức thì
            </li>
          </ol>
          <div className="benefits">
            <h4>Lợi ích:</h4>
            <div className="benefit-items">
              <div className="benefit">
                <span className="benefit-icon">✅</span>
                <span>Instant finality</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">✅</span>
                <span>L1-grade security</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">✅</span>
                <span>80-90% lower fees</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">✅</span>
                <span>2000+ TPS</span>
              </div>
            </div>
          </div>
        </Section>

        <Section title="zkSync Era Architecture" icon="🏛️">
          <h4>Các thành phần chính:</h4>
          <div className="arch-grid">
            <div className="arch-item">
              <strong>Sequencer</strong>
              <p>Nhận và sắp xếp giao dịch, tạo batches</p>
            </div>
            <div className="arch-item">
              <strong>Prover</strong>
              <p>Tạo ZK proofs từ execution traces</p>
            </div>
            <div className="arch-item">
              <strong>zkEVM</strong>
              <p>Máy ảo tương thích EVM với ZK circuits</p>
            </div>
            <div className="arch-item">
              <strong>L1 Contracts</strong>
              <p>Xác thực proofs, quản lý bridge</p>
            </div>
          </div>
          <p className="arch-note">
            zkSync Era là một trong những zkEVM đầu tiên trên mainnet, cho phép
            chạy Solidity bytecode mà không cần sửa đổi.
          </p>
        </Section>

        <Section title="Account Abstraction & Paymasters" icon="💳">
          <p>
            zkSync có <strong>Account Abstraction (AA)</strong> được xây dựng
            native, khác với Ethereum L1 cần ERC-4337 phức tạp.
          </p>
          <h4>Tính năng AA cho phép:</h4>
          <ul>
            <li>Pay gas fees bằng ERC20 tokens (qua Paymaster)</li>
            <li>Ví đa chữ ký (multisig) không cần contract phức tạp</li>
            <li>Giao dịch tự động (auto-payments)</li>
            <li>dApps có thể sponsor gas cho user</li>
          </ul>
          <div className="paymaster-demo">
            <h4>Ví dụ: Paymaster Flow</h4>
            <code className="flow-code">
              User → Giao dịch với token ERC20 → Paymaster → Trả gas bằng token
              → Giao dịch được thực thi
            </code>
          </div>
        </Section>

        <Section title="ZK Stack & The Future" icon="🔮">
          <p>
            <strong>ZK Stack</strong> là framework của Matter Labs để tạo ra
            các Hyperchains - L2 độc lập dùng chung ZK proofs.
          </p>
          <h4>Tương lai của zkSync:</h4>
          <div className="future-items">
            <div className="future-item">
              <strong>Hyperchains</strong>
              <p>Vô số L2 kết nối với nhau qua Hyperbridges</p>
            </div>
            <div className="future-item">
              <strong>Elastic Scaling</strong>
              <p>Mở rộng vô hạn mà không ảnh hưởng đến bảo mật</p>
            </div>
            <div className="future-item">
              <strong>Cross-L2 Composability</strong>
              <p>Gọi contract giữa các L2 khác nhau</p>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
};

export default EducationalPanel;
