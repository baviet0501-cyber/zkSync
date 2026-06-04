export interface NetworkInfo {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  symbol: string;
  isL2: boolean;
}

export interface ContractAddresses {
  greeter: string;
  simpleToken: string;
  paymaster: string;
  simpleNFT: string;
}

export interface GreeterData {
  greeting: string;
  owner: string;
  lastUpdater: string;
  lastUpdated: number;
  chainId: number;
}

export interface TokenData {
  name: string;
  symbol: string;
  totalSupply: string;
  balance: string;
  decimals: number;
}

export type NFTStatus = "pending" | "confirmed" | "failed";
export type NFTMetadataSource = "contract" | "local" | "fallback";

export interface NFTToken {
  tokenId: string;
  name: string;
  description: string;
  image: string;
  owner: string;
  creator: string;
  tokenURI: string;
  status: NFTStatus;
  metadataSource: NFTMetadataSource;
  txHash?: string;
  mintedAt?: number;
}

export interface NFTCollectionInfo {
  name: string;
  symbol: string;
  maxSupply: string;
  currentSupply: string;
  totalMinted: string;
  deploymentTime: string;
  lastMintedAt: string;
  userTokens: NFTToken[];
}

export interface TransactionResult {
  hash: string;
  status: "pending" | "confirmed" | "failed";
  blockNumber?: number;
  explorerUrl?: string;
}

export interface WalletState {
  address: string | null;
  network: NetworkInfo | null;
  balance: string;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export const ZKSYNC_TESTNET: NetworkInfo = {
  name: "zkSync Era Testnet",
  chainId: 300,
  rpcUrl: "https://sepolia.era.zksync.dev",
  explorerUrl: "https://sepolia.explorer.zksync.io",
  symbol: "ETH",
  isL2: true,
};

export const ZKSYNC_MAINNET: NetworkInfo = {
  name: "zkSync Era Mainnet",
  chainId: 324,
  rpcUrl: "https://mainnet.era.zksync.io",
  explorerUrl: "https://explorer.zksync.io",
  symbol: "ETH",
  isL2: true,
};

// Default contract addresses - UPDATE these after deployment
export const DEFAULT_CONTRACT_ADDRESSES: ContractAddresses = {
  greeter: "0x0000000000000000000000000000000000000000",
  simpleToken: "0x0000000000000000000000000000000000000000",
  paymaster: "0x0000000000000000000000000000000000000000",
  simpleNFT: "0x0000000000000000000000000000000000000000",
};
