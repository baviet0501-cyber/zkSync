# 🚀 zkSync Era dApp - Layer 2 Blockchain Application

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![zkSync Era](https://img.shields.io/badge/zkSync-Era-4B32C3)
![Solidity](https://img.shields.io/badge/Solidity-0.8.20-green)
![React](https://img.shields.io/badge/React-18-61DAFB)
![License](https://img.shields.io/badge/license-MIT-green)

**A comprehensive decentralized application built on zkSync Era, showcasing the power of Zero-Knowledge Rollups for Ethereum scaling.**

[🌐 zkSync.io](https://zksync.io) •
[📖 Documentation](https://docs.zksync.io) •
[📝 Whitepaper](https://arxiv.org/pdf/2107.10881) •
[💻 GitHub](https://github.com/matter-labs/zksync)

📖 **🇻🇳 Hướng dẫn tiếng Việt:** Xem [hướng dẫn chi tiết](docs/user-guide-vi.md) — từ A-Z bằng tiếng Việt.

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Smart Contracts](#-smart-contracts)
- [Frontend](#-frontend)
- [Deployment](#-deployment)
- [Educational Resources](#-educational-resources)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)
- [References](#-references)

---

## 🌟 Overview

**zkSync Era** là giải pháp **ZK-Rollup Layer 2** do Matter Labs phát triển, sử dụng **Zero-Knowledge Proofs (ZK-SNARK)** để mở rộng quy mô Ethereum mà vẫn đảm bảo bảo mật tương đương Layer 1.

Dự án này bao gồm:

1. **Smart Contracts** - Solidity contracts deployed on zkSync Era (testnet/mainnet)
2. **Frontend dApp** - React/Vite application tương tác với contracts qua zkSync SDK
3. **Educational Content** - Tài liệu chi tiết về Layer 2 và zkSync architecture

### 🎯 Mục đích

- 🧪 **Demo kỹ thuật**: Minh họa cách xây dựng và deploy dApp trên zkSync Era
- 📚 **Giáo dục**: Giải thích cơ chế Layer 2, ZK-Rollup, Account Abstraction
- 🔧 **Starter Template**: Có thể dùng làm template cho dApp thực tế

---

## ✨ Features

### Smart Contracts
| Contract | Description | zkSync Feature |
|----------|-------------|----------------|
| **Greeter.sol** | Lưu và cập nhật greeting message | EVM Compatibility |
| **SimpleToken.sol** | ERC20 token với mint/burn | Low fees on L2 |
| **Paymaster.sol** | Gas sponsorship contract | Account Abstraction |
| **SimpleNFT.sol** | ERC-721 NFT với mint/gallery | ZK-Rollup scaling |

### Frontend
- 🦊 **MetaMask Integration** - Connect wallet, switch network to zkSync
- 💬 **Greeter Interaction** - View and update greeting on-chain
- 🪙 **Token Dashboard** - View balance, transfer tokens
- 💳 **Paymaster Demo** - Pay gas fees with ERC20 tokens
- 🖼️ **NFT Gallery** - Mint và xem NFT (ERC-721) với phí gas siêu thấp
- 📚 **Educational Panel** - Interactive learning about Layer 2 & zkSync
- 📊 **Network Stats** - Real-time zkSync network information

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React/Vite)              │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ Wallet   │  │ Greeter  │  │ Educational       │  │
│  │ Connect  │  │ Panel    │  │ Panel             │  │
│  └────┬─────┘  └────┬─────┘  └───────────────────┘  │
│       │              │                                │
│  ┌────▼──────────────▼────────────────────────────┐  │
│  │         zkSync Ethers SDK                      │  │
│  │    (zksync-ethers + ethers.js)                 │  │
│  └───────────────────────┬────────────────────────┘  │
└──────────────────────────┼──────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────┐
│               zkSync Era (Layer 2)                   │
│  ┌────────────┐  ┌────────────┐  ┌───────────────┐  ┌──────────┐  │
│  │ Greeter    │  │SimpleToken │  │  Paymaster    │  │SimpleNFT │  │
│  │ Contract   │  │ Contract   │  │  Contract     │  │ Contract │  │
│  └────────────┘  └────────────┘  └───────────────┘  └──────────┘  │
│                                                       │
│  ┌────────────────────────────────────────────────┐  │
│  │         zkSync Era Network                     │  │
│  │  - Sequencer → Prover → L1 Verification        │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────┬───────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────┐
│               Ethereum Layer 1                        │
│           (Security & Settlement)                     │
└──────────────────────────────────────────────────────┘
```

---

## 🇻🇳 Hướng dẫn tiếng Việt

> 📖 **Xem đầy đủ:** [docs/user-guide-vi.md](docs/user-guide-vi.md) — hướng dẫn từ A-Z bao gồm ảnh chụp màn hình ASCII và mẹo chi tiết.

### 1. Kết nối ví MetaMask 🦊

1. Mở **http://localhost:5173** sau khi chạy `npm run frontend:dev`
2. Nhấn **"Connect MetaMask"** → Chọn tài khoản → **Next → Connect**
3. Card Wallet Connection hiển thị: `Connected ✅`, địa chỉ ví, số dư ETH, network

> **Lỗi thường gặp:** "MetaMask is not installed" → Cài MetaMask extension. "No accounts found" → Mở khóa ví.

### 2. Chuyển mạng zkSync Era Testnet 🔄

1. Nhấn **"🔄 Switch to zkSync Testnet"**
2. Xác nhận trong MetaMask (Approve/Switch network)
3. Mạng tự động được thêm nếu chưa tồn tại

### 3. Tương tác Greeter Contract 💬

- **Đọc greeting:** Tin nhắn hiện tại, owner, thời gian cập nhật, chain ID
- **Cập nhật:** Nhập tin nhắn (≤256 ký tự) → **Update** → Confirm trong MetaMask
- Sau giao dịch: **Transaction Toast** ⏳ Pending → ✅ Confirmed (kèm link Explorer)

### 4. Quản lý Token ERC-20 🪙

- Nhấn sub-tab **🪙 Token** → Xem số dư, tên token, total supply
- **Chuyển token:** Nhập địa chỉ người nhận + số lượng → **🚀 Send Tokens** → Confirm

> 💡 Phí gas trên zkSync Era chỉ **10-20%** so với Ethereum L1!

### 5. Mint và xem NFT 🖼️

1. Nhấn tab **🖼️ NFTs**
2. Chọn số lượng mint (1-5) bằng nút **−** / **+**
3. Nhấn **"✨ Mint NFT"** → Confirm từng giao dịch trong MetaMask
4. NFTs xuất hiện trong gallery — nhấp vào card để xem chi tiết + link Explorer

> ⛽ **Phí gas:** Mint NFT trên Ethereum L1: $10-$100+ → zkSync L2: **< $0.01**

### ⚠️ Xử lý sự cố

| Vấn đề | Giải pháp |
|--------|-----------|
| MetaMask không kết nối | Cài MetaMask, mở khóa ví |
| "Wrong network" | Nhấn "Switch to zkSync Testnet" |
| Contract interaction fails | Kiểm tra `.env` đã có đúng address chưa |
| Số dư = 0 | Dùng [faucet](https://goerli.portal.zksync.io/faucet) |
| NFT không hiển thị | Nhấn nút 🔄 refresh |
| "User denied transaction" | Thử lại + nhấn Confirm |

---

## 📋 Prerequisites

- **Node.js** v18+ (recommended: v20 LTS)
- **npm** or **yarn** or **pnpm**
- **MetaMask** browser extension
- Some test ETH on zkSync Era Testnet (get from faucet)

---

## 🚀 Quick Start

### 1. Clone & Install Dependencies

```bash
# Clone repository
git clone https://github.com/baviet0501-cyber/zkSync.git
cd zkSync

# Install root dependencies (Hardhat + plugins)
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# On Windows PowerShell / CMD, use:
copy .env.example .env

# Edit .env with your private key
# ⚠️ Use a test wallet only! Never use production keys.
```

Edit `.env`:
```env
ZKSYNC_TESTNET_URL=https://testnet.era.zksync.dev
ETHEREUM_L1_URL=https://rpc.sepolia.org
WALLET_PRIVATE_KEY=0x<your-test-wallet-private-key>
```

### 3. Compile Smart Contracts

```bash
npm run compile
```

### 4. Deploy to zkSync Era Testnet

```bash
npm run deploy:testnet
```

Save the deployed contract addresses from the console output.

### 5. Update Frontend Configuration

```bash
# Copy frontend env template
cp frontend/.env.example frontend/.env

# On Windows PowerShell / CMD, use:
copy frontend\.env.example frontend\.env
```

Edit `frontend/.env`:
```env
VITE_ZKSYNC_RPC_URL=https://testnet.era.zksync.dev
VITE_GREETER_ADDRESS=0x<deployed-greeter-address>
VITE_TOKEN_ADDRESS=0x<deployed-token-address>
VITE_PAYMASTER_ADDRESS=0x<deployed-paymaster-address>
VITE_NFT_ADDRESS=0x<deployed-nft-address>
```

If the frontend dev server is already running, stop it and run it again after changing `frontend/.env`. Vite only reads these environment variables when the dev server starts.

### 6. Start Frontend

```bash
npm run frontend:dev
```

Open **http://localhost:5173** in your browser.

### 7. Build Frontend for Production

```bash
npm run frontend:build
```

The repository does not include `node_modules/`, `frontend/node_modules/`, `frontend/dist/`, `cache-zk/`, or `artifacts-zk/`. They are generated locally by `npm install`, `npm run compile`, and `npm run frontend:build`.

### 8. Connect & Interact

1. Click "Connect MetaMask"
2. Switch to zkSync Era Testnet (auto-prompt)
3. Interact with all features in the **🚀 dApp** (Greeter & Token), **🖼️ NFTs** (mint & gallery), and **📚 Learn** (educational content) tabs

---

## 📁 Project Structure

```
zksync-dapp/
├── contracts/                    # Solidity smart contracts
│   ├── Greeter.sol              # Simple greeting contract
│   ├── SimpleToken.sol          # ERC20 token contract
│   ├── Paymaster.sol            # Account abstraction paymaster
│   └── SimpleNFT.sol            # ERC-721 NFT contract
│
├── deploy/                       # Deployment scripts
│   └── deploy.ts                # zkSync Era deploy script
│
├── docs/                         # Educational documentation
│   ├── layer2-overview.md       # Layer 2 solutions overview
│   ├── zksync-architecture.md   # zkSync deep dive
│   └── user-guide-vi.md         # Vietnamese user guide
│
├── frontend/                     # React/Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── WalletConnect.tsx
│   │   │   ├── GreeterPanel.tsx
│   │   │   ├── TokenPanel.tsx
│   │   │   ├── NFTPanel.tsx
│   │   │   ├── EducationalPanel.tsx
│   │   │   ├── NetworkStats.tsx
│   │   │   └── TransactionToast.tsx
│   │   ├── hooks/
│   │   │   └── useZkSync.ts
│   │   ├── utils/
│   │   │   └── contract.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── test/                         # Unit tests
│   ├── Greeter.test.ts           # Greeter contract tests
│   ├── SimpleToken.test.ts       # SimpleToken contract tests
│   └── SimpleNFT.test.ts         # SimpleNFT contract tests
├── scripts/                      # Utility scripts
│   ├── run-tests.sh              # Local test runner
│   └── run-tests-docker.sh       # Docker-based test runner
├── docker-compose.yml            # Docker compose for era-test-node
├── hardhat.config.ts             # Hardhat config for zkSync Era
├── package.json                  # Root package.json
├── tsconfig.json                 # Root TypeScript config
├── .env.example                  # Environment variables template
└── README.md                     # This file
```

---

## 📝 Smart Contracts

### Greeter.sol
```solidity
contract Greeter {
    function greet() public view returns (string memory);
    function setGreeting(string memory _greeting) public;
    function lastUpdater() public view returns (address);
    function isOwner(address _user) public view returns (bool);
    function getInfo() public view returns (address, address, string, uint256, uint256);
}
```
A simple contract demonstrating **EVM compatibility** - works identically on L1 and zkSync L2. Any connected wallet can update the greeting, and the contract records `lastUpdater` so the frontend can show the wallet that made the latest update.

### SimpleToken.sol
```solidity
contract SimpleToken is ERC20 {
    function mintTokens(address to, uint256 amount) public onlyOwner;
    function burn(uint256 amount) public override;
    function getTokenInfo() public view returns (...);
}
```
Standard ERC20 token demonstrating **lower transaction fees** on zkSync L2.

### Paymaster.sol
```solidity
contract Paymaster {
    function setGasPriceMultiplier(uint256 _multiplier) external onlyOwner;
    function getPaymasterInfo() external view returns (...);
}
```
Demonstrates **Account Abstraction** - allow users to pay gas fees in ERC20 tokens.

### SimpleNFT.sol
```solidity
contract SimpleNFT is ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Burnable, Ownable {
    function mintNFT(address to, string memory uri) public;
    function mintDefaultNFT(address to) public;
    function lastMintedAt() public view returns (uint256);
    function getTokensOfOwner(address owner) public view returns (uint256[] memory);
    function getCreator(uint256 tokenId) public view returns (address);
    function getCollectionInfo() public view returns (string, string, uint256, uint256, uint256, uint256, uint256);
    function tokenExists(uint256 tokenId) public view returns (bool);
    function setBaseURI(string memory _uri) public onlyOwner;
}
```
Any connected wallet can mint NFTs, while owner-only access is kept for collection-level settings such as `setBaseURI`. The frontend displays `Last minted` from `lastMintedAt` and updates it after successful mints.
**ERC-721** NFT collection with **Enumerable** tracking và **URIStorage** cho on-chain SVG metadata. Giới hạn **10,000 NFTs** với supply cap.

---

## 🎨 Frontend

Built with **React 18 + TypeScript + Vite**.

### Key Dependencies
| Package | Purpose |
|---------|---------|
| `zksync-ethers` | zkSync Era SDK for L2 interactions |
| `ethers` | Ethereum library (v6) |
| `react` | UI framework |
| `viem` | TypeScript interfaces for Ethereum |

### Screens

| Screen | Description |
|--------|-------------|
| **dApp Tab** | Connect wallet, interact with Greeter & Token contracts (với sub-tabs 💬 Greeter / 🪙 Token) |
| **NFTs Tab** | Mint NFT, view gallery, xem chi tiết từng NFT |
| **Learn Tab** | Educational content about Layer 2 and zkSync |

---

## 🚢 Deployment

### Deploy to Testnet

```bash
# Compile contracts
npm run compile

# Deploy to zkSync Era Testnet
npm run deploy:testnet
```

After deployment, copy the printed Greeter, SimpleToken, Paymaster, and SimpleNFT addresses into `frontend/.env`, then restart the frontend dev server.

### Deploy to Mainnet

1. Update `hardhat.config.ts` mainnet RPC
2. Ensure wallet has ETH on L1 and zkSync mainnet

```bash
npx hardhat deploy-zksync --script deploy.ts --network zkSyncMainnet
```

### Verify Contracts

Contracts are automatically verified on [zkSync Explorer](https://explorer.zksync.io) after deployment.

---

## 📚 Educational Resources

### Included in this project
- [Layer 2 Overview](docs/layer2-overview.md) - Comprehensive guide to all L2 solutions
- [zkSync Architecture](docs/zksync-architecture.md) - Deep dive into zkSync internals
- Interactive Educational Panel in the frontend

### External Resources
- [zkSync Era Documentation](https://docs.zksync.io/)
- [zkSync Whitepaper](https://arxiv.org/pdf/2107.10881)
- [Ethereum L2 Scaling](https://ethereum.org/en/developers/docs/scaling/)
- [ZK Rollup Deep Dive](https://vitalik.ca/general/2021/01/05/rollup.html)

---

## 🧪 Testing

### Smart Contract Tests

44+ unit tests covering all 4 contracts (Greeter, SimpleToken, Paymaster, SimpleNFT):

```bash
# Requirements: era-test-node (Linux/macOS/WSL) or Docker

# Run tests (local era-test-node)
npm run test:local

# Run tests (Docker)
bash scripts/run-tests-docker.sh

# Just run tests (if node already running)
npm test
```

| Test file | Tests | Coverage |
|-----------|-------|----------|
| `test/Greeter.test.ts` | 17 | Deployment, greet, setGreeting, isOwner, events, state |
| `test/SimpleToken.test.ts` | 25 | Transfers, approvals, mint/burn, supply cap, ERC20 compliance, edge cases |
| `test/SimpleNFT.test.ts` | 44 | Deployment, mintNFT/default, queries, burn, transfers, ERC-721 compliance, setBaseURI, edge cases |

### Manual Testing Flow

1. Deploy contracts to testnet
2. Connect MetaMask to zkSync Era Testnet
3. Get test ETH from [zkSync Faucet](https://goerli.portal.zksync.io/faucet)
4. Interact with all features in the dApp

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| MetaMask not connecting | Ensure MetaMask is installed and unlocked |
| "Wrong network" error | Click "Switch to zkSync Testnet" button |
| Contract interaction fails | Verify contract addresses in `frontend/.env` |
| Compilation errors | Run `npm run compile` first |
| Low balance | Get test ETH from zkSync faucet |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- [Matter Labs](https://matter-labs.io/) for creating zkSync
- [OpenZeppelin](https://openzeppelin.com/) for smart contract libraries
- [Ethereum Foundation](https://ethereum.org/) for L2 research

---

<div align="center">
  <strong>Built with ❤️ for the zkSync ecosystem</strong>
  <br/>
  <a href="https://zksync.io">zksync.io</a>
</div>
