import { HardhatUserConfig } from "hardhat/config";

import "@matterlabs/hardhat-zksync-deploy";
import "@matterlabs/hardhat-zksync-solc";
import "@matterlabs/hardhat-zksync-verify";
import "@matterlabs/hardhat-zksync-ethers";
import "@matterlabs/hardhat-zksync-node";
import "@nomicfoundation/hardhat-chai-matchers";

import dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  zksolc: {
    version: "1.5.0",
    compilerSource: "binary",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: "zkSyncTestnet",
  networks: {
    zkSyncTestnet: {
      url: process.env.ZKSYNC_TESTNET_URL || "https://sepolia.era.zksync.dev",
      ethNetwork: process.env.ETHEREUM_L1_URL || "https://rpc.sepolia.org",
      zksync: true,
      verifyURL: "https://explorer.zksync.io/contract_verify",
    },
    zkSyncMainnet: {
      url: "https://mainnet.era.zksync.io",
      ethNetwork: "https://rpc.ankr.com/eth",
      zksync: true,
      verifyURL: "https://zksync2-mainnet-explorer.zksync.io/contract_verify",
    },
    localNode: {
      url: "http://127.0.0.1:8011",
      ethNetwork: "http://127.0.0.1:8011",
      zksync: true,
    },
    hardhat: {
      zksync: true,
    },
  },
  solidity: {
    version: "0.8.20",
  },
};

export default config;
