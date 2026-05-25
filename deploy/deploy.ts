import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { Wallet } from "zksync-ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { formatEther, parseEther } from "ethers";
import * as dotenv from "dotenv";

// Polyfill BigInt serialization for deployment-saver compatibility
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

dotenv.config();

// An example of a deploy script that will deploy and verify contracts on zkSync Era.
export default async function (hre: HardhatRuntimeEnvironment) {
  console.log("==================================================================");
  console.log("   🚀 zkSync Era dApp - Contract Deployment Script");
  console.log("==================================================================\n");

  // Initialize the deployer wallet
  const privateKey = process.env.WALLET_PRIVATE_KEY || "";
  if (!privateKey || privateKey === "0x0000000000000000000000000000000000000000000000000000000000000000") {
    console.warn("⚠️  WALLET_PRIVATE_KEY not set. Using deployer from hre.\n");
  }

  // Wallet without provider - Deployer will connect it to HRE's providers
  const wallet = privateKey && privateKey !== "0x0000000000000000000000000000000000000000000000000000000000000000"
    ? new Wallet(privateKey)
    : undefined;

  const deployer = new Deployer(hre, wallet);

  const deployerAddress = await deployer.zkWallet.getAddress();
  console.log(`📡 Network: ${hre.network.name}`);
  console.log(`👛 Deployer: ${deployerAddress}`);
  
  const balance = await deployer.zkWallet.getBalance();
  console.log(`💰 Balance: ${formatEther(balance)} ETH\n`);

  // ===========================================================================
  // 1. Deploy Greeter Contract
  // ===========================================================================
  console.log("──────────────────────────────────────────────────────────────────");
  console.log("  1️⃣  Deploying Greeter.sol...");
  console.log("──────────────────────────────────────────────────────────────────");

  const greeterArtifact = await deployer.loadArtifact("Greeter");
  const greeter = await deployer.deploy(greeterArtifact, [
    "Hello, zkSync Era! 🚀",
  ]);

  const greeterAddress = await greeter.getAddress();
  console.log(`   ✅ Greeter deployed to: ${greeterAddress}\n`);

  // ===========================================================================
  // 2. Deploy SimpleToken Contract
  // ===========================================================================
  console.log("──────────────────────────────────────────────────────────────────");
  console.log("  2️⃣  Deploying SimpleToken.sol...");
  console.log("──────────────────────────────────────────────────────────────────");

  const tokenArtifact = await deployer.loadArtifact("SimpleToken");
  const initialSupply = parseEther("1000000"); // 1 million tokens
  const token = await deployer.deploy(tokenArtifact, [
    "zkSync Demo Token",
    "ZKDT",
    initialSupply,
  ]);

  const tokenAddress = await token.getAddress();
  console.log(`   ✅ SimpleToken deployed to: ${tokenAddress}`);
  console.log(`   🪙  Initial supply: 1,000,000 ZKDT minted to deployer\n`);

  // ===========================================================================
  // 3. Deploy Paymaster Contract
  // ===========================================================================
  console.log("──────────────────────────────────────────────────────────────────");
  console.log("  3️⃣  Deploying Paymaster.sol...");
  console.log("──────────────────────────────────────────────────────────────────");

  const paymasterArtifact = await deployer.loadArtifact("Paymaster");
  const paymaster = await deployer.deploy(paymasterArtifact, [
    tokenAddress,
  ]);

  const paymasterAddress = await paymaster.getAddress();
  console.log(`   ✅ Paymaster deployed to: ${paymasterAddress}`);
  console.log(`   💳  Accepts: ZKDT tokens for gas payments\n`);

  // ===========================================================================
  // 4. Deploy SimpleNFT Contract (ERC-721)
  // ===========================================================================
  console.log("──────────────────────────────────────────────────────────────────");
  console.log("  4️⃣  Deploying SimpleNFT.sol (ERC-721)...");
  console.log("──────────────────────────────────────────────────────────────────");

  const nftArtifact = await deployer.loadArtifact("SimpleNFT");
  const nft = await deployer.deploy(nftArtifact, [
    "zkSync Era NFT Collection",
    "ZKNFT",
    "ipfs://QmDemoBaseURI/", // Replace with actual IPFS/Arweave base URI
  ]);

  const nftAddress = await nft.getAddress();
  console.log(`   ✅ SimpleNFT deployed to: ${nftAddress}`);
  console.log(`   🖼️  Collection: zkSync Era NFT Collection (ZKNFT)\n`);

  // ===========================================================================
  // Deployment Summary
  // ===========================================================================
  console.log("==================================================================");
  console.log("  📋 DEPLOYMENT SUMMARY");
  console.log("==================================================================");
  console.log(`  Network:          ${hre.network.name}`);
  console.log(`  Deployer:         ${deployerAddress}`);
  console.log(`  Greeter:           ${greeterAddress}`);
  console.log(`  SimpleToken:       ${tokenAddress}`);
  console.log(`  Paymaster:         ${paymasterAddress}`);
  console.log(`  SimpleNFT:         ${nftAddress}`);
  console.log("==================================================================\n");

  // Verify all contracts on zkSync Explorer
  console.log("🔍 Verifying contracts on zkSync Explorer...\n");

  const verifyContract = async (address: string, contract: string, constructorArgs: any[]) => {
    try {
      await hre.run("verify:verify", {
        address,
        contract,
        constructorArguments: constructorArgs,
      });
      console.log(`   ✅ ${contract} verified`);
    } catch (e: any) {
      console.log(`   ⚠️  ${contract} verification: ${e.message}`);
    }
  };

  await verifyContract(greeterAddress, "contracts/Greeter.sol:Greeter", [
    "Hello, zkSync Era! 🚀",
  ]);

  await verifyContract(tokenAddress, "contracts/SimpleToken.sol:SimpleToken", [
    "zkSync Demo Token",
    "ZKDT",
    initialSupply,
  ]);

  await verifyContract(paymasterAddress, "contracts/Paymaster.sol:Paymaster", [
    tokenAddress,
  ]);

  await verifyContract(nftAddress, "contracts/SimpleNFT.sol:SimpleNFT", [
    "zkSync Era NFT Collection",
    "ZKNFT",
    "ipfs://QmDemoBaseURI/",
  ]);

  console.log("\n🎉 All contracts deployed and verified successfully!");
  console.log("   Update your frontend/.env file with these contract addresses.\n");
}
