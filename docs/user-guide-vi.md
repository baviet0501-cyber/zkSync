# 📖 Hướng Dẫn Sử Dụng zkSync Era dApp (Tiếng Việt)

<div align="center">

**Hướng dẫn chi tiết từ A đến Z — Kết nối ví, tương tác smart contracts, mint NFT và tìm hiểu Layer 2**

</div>

---

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Cài đặt ban đầu](#-cài-đặt-ban-đầu)
- [Chạy ứng dụng](#-chạy-ứng-dụng)
- [Bước 1: Kết nối ví MetaMask](#-bước-1-kết-nối-ví-metamask-)
- [Bước 2: Chuyển sang mạng zkSync Era Testnet](#-bước-2-chuyển-sang-mạng-zksync-era-testnet-)
- [Bước 3: Tương tác với Greeter Contract](#-bước-3-tương-tác-với-greeter-contract-)
- [Bước 4: Quản lý Token ERC-20](#-bước-4-quản-lý-token-erc-20-)
- [Bước 5: Mint và xem NFT](#-bước-5-mint-và-xem-nft-)
- [Bước 6: Tab Learn — Học về Layer 2](#-bước-6-tab-learn--học-về-layer-2-)
- [Transaction Toast & Explorer](#-transaction-toast--explorer)
- [Mạng Testnet — Lấy Test ETH](#-mạng-testnet--lấy-test-eth)
- [Xử lý sự cố](#-xử-lý-sự-cố-thường-gặp)
- [Giao diện chi tiết](#-giao-diện-chi-tiết)
- [Tính năng bổ sung](#-tính-năng-bổ-sung)
- [Bảo mật](#-bảo-mật)
- [Tips & Tricks](#-tips--tricks)

---

## 🌐 Giới thiệu

**zkSync Era dApp** là một ứng dụng phi tập trung (decentralized application) được xây dựng trên **zkSync Era** — giải pháp mở rộng Layer 2 cho Ethereum sử dụng công nghệ **ZK-Rollup**. Ứng dụng cho phép bạn:

- 🔌 Kết nối ví MetaMask và tương tác với blockchain
- 💬 Đọc và cập nhật tin nhắn (Greeting) trên hợp đồng thông minh
- 🪙 Quản lý token ERC-20: xem số dư, chuyển token
- 🖼️ Mint và sưu tập NFT (ERC-721) với phí gas cực thấp
- 📚 Tìm hiểu về Layer 2, ZK-Rollup và Account Abstraction

---

## 🛠️ Cài đặt ban đầu

### Yêu cầu

| Phần mềm | Mô tả |
|----------|-------|
| **MetaMask** | Cài đặt từ [metamask.io](https://metamask.io) |
| **Test ETH** | Lấy từ zkSync Era faucet (Testnet) — hướng dẫn ở phần sau |
| **Node.js** | v18+ cho development |

### Cấu hình MetaMask (thủ công)

Để thêm zkSync Era Testnet vào MetaMask:

| Thông số | Giá trị |
|----------|---------|
| **Network Name** | zkSync Era Testnet |
| **RPC URL** | `https://testnet.era.zksync.dev` |
| **Chain ID** | `300` (0x12C) |
| **Currency Symbol** | ETH |
| **Block Explorer** | `https://goerli.explorer.zksync.io` |

> 💡 **Mẹo:** Ứng dụng sẽ tự động thêm mạng này khi bạn nhấn "Switch to zkSync Testnet", bạn không cần làm thủ công.

---

## 🚀 Chạy ứng dụng

```bash
# Từ thư mục gốc của dự án
cd frontend && npm run dev
```

Mở trình duyệt tại **http://localhost:5173**.

---

## 🦊 Bước 1: Kết nối ví MetaMask

### Giao diện kết nối

Khi ứng dụng mở, bạn sẽ thấy màn hình chính với các tab ở đầu trang:

| Tab | Mô tả |
|-----|-------|
| **🚀 dApp** | Trang chính — kết nối ví, tương tác Greeter & Token |
| **🖼️ NFTs** | Mint và xem bộ sưu tập NFT |
| **📚 Learn** | Kiến thức về Layer 2 và zkSync |

Ở cột trái, card **👛 Wallet Connection** hiển thị nút **"Connect MetaMask"**.

### Các bước kết nối

1. **Nhấn "🦊 Connect MetaMask"** — MetaMask sẽ mở popup yêu cầu cho phép kết nối
2. **Chọn tài khoản** bạn muốn sử dụng
3. **Nhấn "Next" → "Connect"** trong MetaMask

### Sau khi kết nối thành công ✅

Card Wallet Connection sẽ hiển thị:

| Thông tin | Ví dụ |
|-----------|-------|
| **Status** | Connected (dấu chấm xanh) |
| **Address** | `0x1234...5678` + nút 📋 copy |
| **Network** | zkSync Era Testnet |
| **Balance** | `0.1234 ETH` |
| **Type** | 🌐 Layer 2 (zkSync) |

### Xử lý lỗi khi kết nối ❌

| Lỗi | Giải pháp |
|-----|-----------|
| "MetaMask is not installed" | Cài MetaMask browser extension |
| "No accounts found" | Mở khóa MetaMask và tạo tài khoản |
| Lỗi khác | Kiểm tra console (F12) để biết chi tiết |

---

## 🔄 Bước 2: Chuyển sang mạng zkSync Era Testnet

Nếu ví của bạn đang ở mạng Ethereum L1 (Mainnet, Sepolia,...), card Wallet sẽ hiển thị nút **"🔄 Switch to zkSync Testnet"**.

1. **Nhấn nút "Switch to zkSync Testnet"**
2. MetaMask sẽ hiện popup xác nhận chuyển mạng
3. **Nhấn "Approve"** hoặc **"Switch network"**

> **Nếu mạng chưa tồn tại trong MetaMask:** Ứng dụng sẽ tự động thêm mới với thông tin RPC, Chain ID chính xác.

**Sau khi chuyển thành công:**
- Network hiển thị: **"zkSync Era Testnet"**
- Type: **🌐 Layer 2 (zkSync)**
- Màu chữ chuyển sang xanh lá

---

## 💬 Bước 3: Tương tác với Greeter Contract

Sau khi kết nối và contracts đã được deploy, tab **🚀 dApp** sẽ hiển thị hai sub-tab:

> **💬 Greeter** | **🪙 Token**

### Tab Greeter

Card **"💬 Greeter Contract"** hiển thị:

**Phần "Current Greeting":**
- Tin nhắn hiện tại được lưu trên blockchain
- **Owner:** Địa chỉ chủ sở hữu contract
- **Last updated:** Thời gian cập nhật gần nhất
- **Chain ID:** ID của mạng (300 = zkSync Testnet)

**Cập nhật Greeting:**

1. Nhập tin nhắn mới vào ô input (tối đa 256 ký tự)
2. Nhấn **"Update"**
3. MetaMask sẽ hiện popup xác nhận giao dịch — kiểm tra **Gas Fee** (rất thấp trên L2!)
4. Nhấn **"Confirm"** trong MetaMask

**Transaction Toast** (thông báo ở góc dưới phải):
- ⏳ "Transaction Pending" — đang chờ xác nhận
- ✅ "Transaction Confirmed!" — giao dịch thành công + link Explorer
- ❌ "Transaction Failed" — giao dịch thất bại + lỗi chi tiết

> ⏱️ Auto-dismiss sau 15 giây hoặc nhấn ✕ để đóng.

---

## 🪙 Bước 4: Quản lý Token ERC-20

Nhấn sub-tab **🪙 Token** để mở **Token Dashboard**.

### Xem thông tin token

- **Số dư:** Hiển thị lớn ở giữa card (ví dụ: `1,000.0 ZKDT`)
- **Tên token:** "zkSync Demo Token"
- **Total Supply:** Tổng cung token

### Chuyển token

1. Nhập **địa chỉ người nhận** (0x...)
2. Nhập **số lượng token** cần gửi
3. Kiểm tra số dư hiện tại (hiển thị bên dưới)
4. Nhấn **"🚀 Send Tokens"**
5. Xác nhận giao dịch trong MetaMask

> 💡 **Mẹo:** Phí gas trên zkSync Era chỉ bằng **10-20%** so với Ethereum L1!

---

## 🖼️ Bước 5: Mint và xem NFT

Nhấn tab **🖼️ NFTs** ở đầu trang.

### Trước khi kết nối ví

Hiển thị thông báo "Connect Wallet" + nút kết nối.

### Sau khi kết nối (NFT contract đã deploy)

Giao diện NFT gồm 2 cột:

#### Cột trái — NFT Panel

**📊 Collection Info:**
- Tên bộ sưu tập (ví dụ: "zkSync Era NFT Collection")
- **Supply Bar:** Thanh tiến trình hiển thị số lượng đã mint / tổng supply (tối đa 10,000)
  - Ví dụ: `42 / 10,000` — thanh gradient tím-xanh
- Thời gian deploy

**✨ Mint NFT:**

1. Chọn số lượng muốn mint: Nhấn **−** hoặc **+** (từ 1 đến 5 NFTs)
2. Nhấn **"✨ Mint NFT"** (hoặc "Mint 3 NFTs" tùy số lượng)
3. Xác nhận từng giao dịch trong MetaMask
4. NFTs mới sẽ tự động xuất hiện trong gallery sau khi mint

> 💡 **Be the first!** Nếu chưa ai mint, bạn sẽ nhận được **Genesis NFTs** đầu tiên!

**🖼️ Gallery NFTs của bạn:**
- Grid hiển thị tất cả NFTs bạn sở hữu
- Mỗi NFT có:
  - **Hình ảnh:** SVG gradient độc nhất (màu sắc dựa trên token ID)
  - **Tên:** `#<tokenId>` (ví dụ: `#1`, `#42`)
  - **Creator:** Địa chỉ người tạo

**Nhấp vào một NFT card** → Mở modal chi tiết:
- Hình ảnh lớn
- Token ID
- Owner (bạn)
- Creator
- Blockchain: zkSync Era
- Mô tả
- **🔗 View on Explorer** — Xem trên block explorer

#### Cột phải

- **⛽ Gas on zkSync:** So sánh phí mint NFT trên Ethereum L1 ($10-$100+) vs zkSync L2 (&lt; $0.01)
- **📊 Network Stats:** Các thông số kỹ thuật

---

## 📚 Bước 6: Tab Learn — Học về Layer 2

Tab **📚 Learn** cung cấp kiến thức nền tảng về blockchain scaling. Các mục có thể mở rộng (accordion):

| Mục | Mô tả |
|-----|-------|
| **🏗️ What is Layer 2?** | Giải thích về L2 scaling solutions (ZK-Rollups, Optimistic, State Channels, Plasma) |
| **🔄 ZK-Rollup — Công nghệ cốt lõi** | Cách hoạt động: Batching → Proving → Verification → Settlement |
| **🏛️ zkSync Era Architecture** | Sequencer, Prover, zkEVM, L1 Contracts |
| **💳 Account Abstraction & Paymasters** | Native AA trên zkSync, pay gas bằng ERC20 |
| **🔮 ZK Stack & The Future** | Hyperchains, Elastic Scaling, Cross-L2 Composability |

Cột phải có thêm **📖 Additional Resources** với links đến tài liệu chính thức.

---

## 📊 Transaction Toast & Explorer

Khi thực hiện bất kỳ giao dịch nào (update greeting, send token, mint NFT), một **Transaction Toast** xuất hiện ở góc dưới phải.

### Các trạng thái

| Trạng thái | Icon | Mô tả |
|------------|------|-------|
| **Pending** | ⏳ | Giao dịch đang chờ xác nhận (thường ~1-2 giây trên zkSync) |
| **Confirmed** | ✅ | Giao dịch thành công! |
| **Failed** | ❌ | Giao dịch thất bại (hiển thị lỗi) |

Trong toast confirmed, bạn có thể nhấn **"🔍 View on zkSync Explorer ↗"** để xem giao dịch trên block explorer.

---

## 🧪 Mạng Testnet — Lấy Test ETH

### Cách lấy test ETH cho zkSync Era Testnet

| Cách | Mô tả |
|------|-------|
| **zkSync Portal Faucet** | https://goerli.portal.zksync.io/faucet |
| **Bridge từ Sepolia** | Dùng [zkSync Bridge](https://goerli.portal.zksync.io/bridge) để bridge ETH từ Sepolia lên zkSync Era Testnet |
| **Third-party faucets** | Tìm "zkSync Era Sepolia faucet" trên Google |

---

## ⚠️ Xử lý sự cố thường gặp

| Vấn đề | Nguyên nhân | Giải pháp |
|--------|-------------|-----------|
| MetaMask không kết nối | Chưa cài MetaMask / ví bị khóa | Cài MetaMask, mở khóa ví |
| "Wrong network" | Đang ở Ethereum L1 | Nhấn "Switch to zkSync Testnet" |
| Contract interaction fails | Contract chưa deploy / sai địa chỉ | Deploy contract, kiểm tra `.env` |
| Số dư = 0 | Chưa có ETH trên zkSync | Dùng faucet hoặc bridge |
| NFT không hiển thị | Chưa refresh | Nhấn nút 🔄 trong NFT panel |
| Lỗi "User denied transaction" | Bạn từ chối trong MetaMask | Thử lại và nhấn Confirm |
| Phí gas báo cao | Đang nhầm mạng L1 | Kiểm tra network trong MetaMask |

---

## 🖥️ Giao diện chi tiết

### Màn hình chính (dApp tab)

```
┌──────────────────────────────────────────────────────────────────┐
│ 🚀 dApp  🖼️ NFTs  📚 Learn                    [0x1234...5678] │
├──────────────────────────────────────────────────────────────────┤
│ ┌──────────────────┐  ┌────────────────────────────────────────┐ │
│ │ 👛 Wallet        │  │ 📚 Layer 2 & zkSync Education          │ │
│ │ Connection       │  │                                        │ │
│ │ [Connected]      │  │ 🏗️ What is Layer 2?    ▾            │ │
│ │ Address: ...     │  │ 🔄 ZK-Rollup            ▾            │ │
│ │ Balance: 0.5 ETH │  │ 🏛️ Architecture         ▾            │ │
│ │ Network: zkSync  │  │ 💳 AA & Paymasters      ▾            │ │
│ │ [Disconnect]     │  │ 🔮 ZK Stack & Future    ▾            │ │
│ ├──────────────────┤  └────────────────────────────────────────┘ │
│ │ 💬 | 🪙         │                                            │
│ │ 💬 Greeter       │                                            │
│ │ "Hello World!"   │                                            │
│ │ [Input] [Update] │                                            │
│ ├──────────────────┤                                            │
│ │ 📊 Network Stats │                                            │
│ └──────────────────┘                                            │
└──────────────────────────────────────────────────────────────────┘
```

### Màn hình NFT

```
┌──────────────────────────────────────────────────────────────────┐
│ 🚀 dApp  🖼️ NFTs  📚 Learn                    [0x1234...5678] │
├──────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────┐  ┌─────────────────────────┐ │
│ │ 🖼️ NFT Gallery     ERC-721     │  │ ⛽ Gas on zkSync       │ │
│ │                                 │  │ Mint on L1: $10-100+   │ │
│ │ SimpleNFT (ZKNFT)              │  │ Mint on L2: < $0.01    │ │
│ │ ▓▓▓▓▓▓▓▓░░░░ 42 / 10000       │  │                        │ │
│ │                                 │  │ 📊 Network Stats       │ │
│ │ ✨ Mint Area                     │  │ L2 Block Time: ~1 sec │ │
│ │ [−] 3 [+]  [✨ Mint 3 NFTs]    │  │ Fee Reduction: 80-90%  │ │
│ │                                 │  │ TPS: 20,000+           │ │
│ │ Your NFTs (3)                    │  └─────────────────────────┘ │
│ │ ┌─────┐ ┌─────┐ ┌─────┐       │                              │
│ │ │ #1  │ │ #2  │ │ #3  │       │                              │
│ │ │0x.. │ │0x.. │ │0x.. │       │                              │
│ │ └─────┘ └─────┘ └─────┘       │                              │
│ └─────────────────────────────────┘                              │
└──────────────────────────────────────────────────────────────────┘
```

---

## ✨ Tính năng bổ sung

| Tính năng | Mô tả |
|-----------|-------|
| **📋 Copy address** | Nhấp icon 📋 bên cạnh địa chỉ ví để copy |
| **⏱️ Auto-dismiss** | Transaction toast tự động biến mất sau 15 giây |
| **📱 Responsive** | UI tự động điều chỉnh trên mobile (< 640px) |
| **🔄 Refresh NFTs** | Nút làm mới trong NFT panel |

---

## 🔐 Bảo mật

- **Private keys:** Ứng dụng không bao giờ yêu cầu private key của bạn
- **Giao dịch:** Tất cả giao dịch đều qua MetaMask — bạn phải xác nhận từng giao dịch
- **Read-only:** Xem greeting, balance, NFTs không cần pay gas
- **Testnet:** Chỉ sử dụng tài khoản test, không dùng tài khoản thật

---

## 💡 Tips & Tricks

1. **Tiết kiệm gas:** Mint nhiều NFT cùng lúc bằng cách chọn số lượng 5 thay vì mint từng cái
2. **Theo dõi giao dịch:** Dùng link Explorer trong transaction toast để kiểm tra chi tiết
3. **Làm mới dữ liệu:** Nhấn nút 🔄 trong NFT panel để refresh NFTs
4. **Học nhanh:** Mở tab Learn và đọc các section — nội dung có cả tiếng Việt
5. **Kiểm tra mạng:** Luôn kiểm tra badge "Layer 2" trong Wallet Connection

---

## 📂 Cấu trúc mã nguồn liên quan

| File | Chức năng |
|------|-----------|
| `frontend/src/hooks/useZkSync.ts` | Hook chính quản lý state, kết nối ví, tương tác contracts |
| `frontend/src/utils/contract.ts` | ABIs, utility functions, tạo hình ảnh NFT demo |
| `frontend/src/types/index.ts` | TypeScript interfaces, network constants |
| `frontend/src/components/WalletConnect.tsx` | Component kết nối ví MetaMask |
| `frontend/src/components/GreeterPanel.tsx` | Component tương tác Greeter contract |
| `frontend/src/components/TokenPanel.tsx` | Component quản lý token ERC-20 |
| `frontend/src/components/NFTPanel.tsx` | Component mint và gallery NFT |
| `frontend/src/components/NetworkStats.tsx` | Component hiển thị thông số mạng |
| `frontend/src/components/EducationalPanel.tsx` | Nội dung giáo dục Layer 2 (có tiếng Việt) |
| `frontend/src/components/TransactionToast.tsx` | Component thông báo giao dịch |
| `frontend/src/App.tsx` | Layout chính, routing tabs |
| `frontend/src/index.css` | Toàn bộ styles với dark theme |
| `frontend/.env.example` | Template biến môi trường (contract addresses) |

---

<div align="center">
  <strong>Happy building on zkSync Era! 🚀</strong>
  <br/>
  <a href="https://zksync.io">zksync.io</a>
</div>
