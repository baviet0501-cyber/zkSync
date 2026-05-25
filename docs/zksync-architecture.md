# Kiến Trúc và Cơ Chế Hoạt Động của zkSync

## 1. Giới Thiệu

**zkSync Era** là giải pháp **ZK-Rollup** do **Matter Labs** phát triển, sử dụng **ZK-SNARK proofs** để mở rộng Ethereum. Đây là một trong những zkEVM đầu tiên hoạt động trên mainnet, cho phép chạy các smart contract Solidity trên môi trường ZK-Rollup.

### Lợi ích chính:
- 🔹 **Phí gas thấp hơn 80-90%** so với Ethereum L1
- 🔹 **Giao dịch nhanh** (~1 giây block time)
- 🔹 **Bảo mật tương đương Ethereum L1**
- 🔹 **EVM-compatible** - chạy Solidity/Vyper không cần sửa đổi
- 🔹 **Account Abstraction** native

## 2. Kiến Trúc Hệ Thống

```
                    ┌─────────────────────────────┐
                    │     Ethereum L1 (Mainnet)     │
                    │  ┌─────────────────────────┐  │
                    │  │   L1 Smart Contracts    │  │
                    │  │  - Bridge Contract      │  │
                    │  │  - Verifier Contract    │  │
                    │  │  - Governance Contract  │  │
                    │  └─────────────────────────┘  │
                    └──────────────┬──────────────┘
                                   │
                          Validity Proofs
                               +
                         State Diff Data
                                   │
                    ┌──────────────▼──────────────┐
                    │     zkSync Era (L2)          │
                    │  ┌─────────────────────────┐  │
                    │  │   zkSync Node           │  │
                    │  │  - Mempool              │  │
                    │  │  - Sequencer            │  │
                    │  │  - State Keeper         │  │
                    │  └─────────────────────────┘  │
                    │  ┌─────────────────────────┐  │
                    │  │   Prover                │  │
                    │  │  - ZK Circuit Generator │  │
                    │  │  - Proof Aggregator     │  │
                    │  └─────────────────────────┘  │
                    │  ┌─────────────────────────┐  │
                    │  │   zkEVM                │  │
                    │  │  - Execute EVM bytecode │  │
                    │  │  - Generate traces      │  │
                    │  └─────────────────────────┘  │
                    └──────────────────────────────┘
```

### 2.1. Các Thành Phần Chính

#### a) Sequencer (Trình tự hóa)
- Nhận giao dịch từ người dùng
- Sắp xếp giao dịch theo thứ tự
- Tạo batch giao dịch
- Cập nhật trạng thái L2

#### b) Prover (Trình chứng minh)
- Nhận batch từ sequencer
- Tạo **Zero-Knowledge Proof** (ZK-SNARK)
- Chứng minh tính hợp lệ của tất cả giao dịch trong batch
- Sử dụng GPU/ASIC để tăng tốc

#### c) zkEVM
- **Máy ảo tương thích EVM** nhưng có ZK-friendly opcodes
- Chuyển đổi Solidity bytecode thành ZK circuits
- Hỗ trợ phần lớn các tính năng của Ethereum L1

#### d) L1 Smart Contracts
- **Bridge Contract**: Quản lý deposit/withdraw giữa L1 và L2
- **Verifier Contract**: Xác thực ZK proofs
- **Governance Contract**: Quản lý nâng cấp giao thức

## 3. Quy Trình Xử Lý Giao Dịch

### Bước 1: Người dùng gửi giao dịch
```
Người dùng → Gửi giao dịch L2 (qua RPC endpoint)
```

### Bước 2: Sequencer xử lý
```
Sequencer → Nhận giao dịch vào mempool
           → Sắp xếp theo thứ tự
           → Tạo batch (hàng nghìn giao dịch)
           → Cập nhật state root mới
```

### Bước 3: Prover tạo Proof
```
Prover → Nhận batch từ sequencer
       → Thực thi zkEVM trên batch
       → Tạo execution trace
       → Sinh ZK-SNARK proof
       → Gửi proof + state diff lên L1
```

### Bước 4: L1 xác thực
```
L1 Contract → Nhận proof + state diff
            → Xác thực ZK proof
            → Cập nhật state root
            → Batch được finalized
```

## 4. Tính Năng Đặc Biệt của zkSync Era

### 4.1. Account Abstraction (AA) Native

zkSync có Account Abstraction được xây dựng native, khác với Ethereum L1 cần ERC-4337:

```solidity
// zkSync cho phép:
// 1. Pay gas bằng ERC20 tokens
// 2. Ví đa chữ ký (multisig) không cần smart contract phức tạp
// 3. Giao dịch tự động (auto-payments, recurring payments)
// 4. Sponsoring gas phí cho user (dApps trả gas hộ)
```

### 4.2. Paymasters

Paymaster là smart contract đặc biệt cho phép:
- Người dùng trả gas bằng **bất kỳ token ERC20 nào**
- DApp **sponsor gas** cho người dùng mới
- Mô hình subscription: trả phí hàng tháng, miễn phí giao dịch

### 4.3. ZK Stack (Hyperchains)

zkSync đang phát triển **ZK Stack** - một framework để tạo:
- **Hyperchains**: Các L2 độc lập dùng chung ZK proofs
- **Hyperbridges**: Cầu nối trustless giữa các Hyperchains
- **Siêu khả năng mở rộng**: Vô số L2 kết nối với nhau

## 5. So Sánh zkSync vs Các Giải Pháp Khác

| Tính năng | zkSync Era | Arbitrum | Optimism | StarkNet |
|-----------|-----------|----------|----------|----------|
| **Loại** | ZK-Rollup | Optimistic | Optimistic | ZK-Rollup |
| **EVM Compatible** | ✅ (zkEVM) | ✅ (EVM) | ✅ (EVM) | ❌ (Cairo VM) |
| **Finality** | ~1 giờ* | ~7 ngày | ~7 ngày | ~1 giờ* |
| **Account Abstraction** | ✅ Native | ❌ | ❌ | ✅ |
| **Phí gas** | ~$0.05 | ~$0.10 | ~$0.08 | ~$0.02 |
| **TPS** | ~2,000 | ~4,000 | ~2,000 | ~1,000 |

\* *Thời gian finality trên L1. Giao dịch L2 final gần như tức thì (< 1 giây).*

## 6. Cầu Nối (Bridge) L1 ↔ L2

### Deposit (L1 → L2):
1. User gửi ETH/token đến Bridge Contract trên L1
2. Bridge lock tài sản trên L1
3. zkSync mint tài sản tương ứng trên L2
4. Mất ~10-15 phút (chờ confirm L1)

### Withdraw (L2 → L1):
1. User đốt (burn) tài sản trên L2
2. Gửi proof lên L1 Bridge Contract
3. L1 giải phóng tài sản
4. Mất ~1 giờ (chờ finalize ZK proof trên L1)

## 7. Thông Tin Kỹ Thuật

### Chain IDs:
- **Mainnet**: Chain ID 324
- **Testnet (Sepolia)**: Chain ID 300
- **Testnet (Goerli)**: Chain ID 280 (deprecated)

### RPC Endpoints:
- **Mainnet**: `https://mainnet.era.zksync.io`
- **Testnet**: `https://testnet.era.zksync.dev`

### Block Explorers:
- **Mainnet**: https://explorer.zksync.io
- **Testnet**: https://goerli.explorer.zksync.io

## 8. Tài Liệu Tham Khảo

- [zkSync Era Documentation](https://docs.zksync.io/)
- [zkSync GitHub](https://github.com/matter-labs/zksync-era)
- [zkSync Whitepaper](https://arxiv.org/pdf/2107.10881)
- [ZK Stack](https://zksync.io/zkstack)
- [Matter Labs Blog](https://blog.matter-labs.io/)
