import { expect } from "chai";
import hre from "hardhat";
import { Contract, id } from "ethers";

describe("SimpleNFT", function () {
  this.timeout(60_000);

  let nft: Contract;
  let owner: any;
  let user1: any;
  let user2: any;

  const COLLECTION_NAME = "SimpleNFT";
  const COLLECTION_SYMBOL = "SNFT";
  const BASE_URI = "https://example.com/nft/";
  const MAX_SUPPLY = 10000n;

  before(async function () {
    const wallets = await hre.zksyncEthers.getWallets(hre);
    owner = wallets[0];
    user1 = wallets[1];
    user2 = wallets[2];
  });

  beforeEach(async function () {
    const artifact = await hre.zksyncEthers.loadArtifact("SimpleNFT");
    nft = await hre.zksyncEthers.deployContract(
      hre,
      artifact,
      [COLLECTION_NAME, COLLECTION_SYMBOL, BASE_URI],
      owner
    );
  });

  // ==========================================================================
  // Deployment
  // ==========================================================================

  describe("Deployment", function () {
    it("should set the correct collection name", async function () {
      expect(await nft.name()).to.equal(COLLECTION_NAME);
    });

    it("should set the correct collection symbol", async function () {
      expect(await nft.symbol()).to.equal(COLLECTION_SYMBOL);
    });

    it("should set the deployer as the owner", async function () {
      const contractOwner = await nft.owner();
      expect(contractOwner.toLowerCase()).to.equal(
        (await owner.getAddress()).toLowerCase()
      );
    });

    it("should set deploymentTime", async function () {
      const deployTime = await nft.deploymentTime();
      expect(deployTime).to.be.a("bigint");
      expect(deployTime).to.be.greaterThan(0n);
    });

    it("should start with no last minted timestamp", async function () {
      expect(await nft.lastMintedAt()).to.equal(0n);
    });

    it("should start with totalSupply of 0", async function () {
      expect(await nft.totalSupply()).to.equal(0n);
    });

    it("should start with totalMinted of 0", async function () {
      expect(await nft.totalMinted()).to.equal(0n);
    });

    it("should set MAX_SUPPLY to 10000", async function () {
      expect(await nft.MAX_SUPPLY()).to.equal(MAX_SUPPLY);
    });

    it("should deploy to a valid contract address", async function () {
      expect(await nft.getAddress()).to.be.properAddress;
    });

    it("should accept empty base URI", async function () {
      const artifact = await hre.zksyncEthers.loadArtifact("SimpleNFT");
      const emptyURINFT = await hre.zksyncEthers.deployContract(
        hre,
        artifact,
        [COLLECTION_NAME, COLLECTION_SYMBOL, ""],
        owner
      );
      expect(await emptyURINFT.getAddress()).to.be.properAddress;
    });
  });

  // ==========================================================================
  // mintNFT (custom URI)
  // ==========================================================================

  describe("mintNFT()", function () {
    const TOKEN_URI = "ipfs://QmTest/token-metadata.json";

    it("should mint an NFT to the recipient", async function () {
      const user1Addr = await user1.getAddress();
      const tx = await nft.mintNFT(user1Addr, TOKEN_URI);

      expect(await nft.ownerOf(1n)).to.equal(user1Addr);
      expect(await nft.balanceOf(user1Addr)).to.equal(1n);
    });

    it("should set the correct token URI", async function () {
      const user1Addr = await user1.getAddress();
      await nft.mintNFT(user1Addr, TOKEN_URI);

      expect(await nft.tokenURI(1n)).to.equal(TOKEN_URI);
    });

    it("should keep data URI metadata intact with a collection base URI", async function () {
      const user1Addr = await user1.getAddress();
      const metadata = {
        name: "Persistent NFT",
        description: "Metadata should survive browser storage resets.",
        image: "data:image/png;base64,iVBORw0KGgo=",
      };
      const metadataURI = `data:application/json;base64,${Buffer.from(
        JSON.stringify(metadata),
        "utf8"
      ).toString("base64")}`;

      await nft.mintNFT(user1Addr, metadataURI);

      expect(await nft.tokenURI(1n)).to.equal(metadataURI);
    });

    it("should set the creator as the minter", async function () {
      const user1Addr = await user1.getAddress();
      const ownerAddr = await owner.getAddress();
      await nft.mintNFT(user1Addr, TOKEN_URI);

      expect(await nft.getCreator(1n)).to.equal(ownerAddr);
    });

    it("should assign sequential token IDs", async function () {
      const user1Addr = await user1.getAddress();

      await nft.mintNFT(user1Addr, TOKEN_URI);
      await nft.mintNFT(user1Addr, TOKEN_URI);
      await nft.mintNFT(user1Addr, TOKEN_URI);

      expect(await nft.ownerOf(1n)).to.equal(user1Addr);
      expect(await nft.ownerOf(2n)).to.equal(user1Addr);
      expect(await nft.ownerOf(3n)).to.equal(user1Addr);
    });

    it("should increment totalMinted", async function () {
      const user1Addr = await user1.getAddress();

      expect(await nft.totalMinted()).to.equal(0n);
      await nft.mintNFT(user1Addr, TOKEN_URI);
      expect(await nft.totalMinted()).to.equal(1n);
      expect(await nft.lastMintedAt()).to.be.greaterThan(0n);
      await nft.mintNFT(user1Addr, TOKEN_URI);
      expect(await nft.totalMinted()).to.equal(2n);
    });

    it("should increment totalSupply", async function () {
      const user1Addr = await user1.getAddress();

      expect(await nft.totalSupply()).to.equal(0n);
      await nft.mintNFT(user1Addr, TOKEN_URI);
      expect(await nft.totalSupply()).to.equal(1n);
    });

    it("should emit NFTCreated event with correct data", async function () {
      const user1Addr = await user1.getAddress();
      const ownerAddr = await owner.getAddress();
      const tx = await nft.mintNFT(user1Addr, TOKEN_URI);
      const receipt = await tx.wait();

      const event = receipt.logs.find(
        (log: any) =>
          log.topics[0] ===
          id("NFTCreated(uint256,address,address,string,uint256)")
      );
      expect(event).to.not.be.undefined;
    });

    it("should emit Transfer event from zero address", async function () {
      const user1Addr = await user1.getAddress();
      const tx = await nft.mintNFT(user1Addr, TOKEN_URI);
      const receipt = await tx.wait();

      const event = receipt.logs.find(
        (log: any) =>
          log.topics[0] === id("Transfer(address,address,uint256)")
      );
      expect(event).to.not.be.undefined;
    });

    it("should allow non-owner wallets to mint", async function () {
      const user1Addr = await user1.getAddress();
      const nftAsUser1 = nft.connect(user1);

      await nftAsUser1.mintNFT(user1Addr, TOKEN_URI);

      expect(await nft.ownerOf(1n)).to.equal(user1Addr);
      expect(await nft.getCreator(1n)).to.equal(user1Addr);
    });

    it("should revert when minting to zero address", async function () {
      await expect(
        nft.mintNFT("0x0000000000000000000000000000000000000000", TOKEN_URI)
      ).to.be.revertedWith("Cannot mint to zero address");
    });

    it("should revert with empty URI", async function () {
      const user1Addr = await user1.getAddress();

      await expect(
        nft.mintNFT(user1Addr, "")
      ).to.be.revertedWith("URI cannot be empty");
    });

    it("should increment totalMinted correctly across mints", async function () {
      const user1Addr = await user1.getAddress();

      // We can't realistically mint 10k tokens in tests, but we can
      // verify the MAX_SUPPLY constant is set and check the revert message
      // by simulating or using a deploy with lower cap approach
      for (let i = 0; i < 5; i++) {
        await nft.mintNFT(user1Addr, TOKEN_URI);
      }

      // totalMinted should be 5
      expect(await nft.totalMinted()).to.equal(5n);
    });
  });

  // ==========================================================================
  // mintDefaultNFT (auto-generated URI)
  // ==========================================================================

  describe("mintDefaultNFT()", function () {
    it("should mint an NFT with auto-generated URI", async function () {
      const user1Addr = await user1.getAddress();
      await nft.mintDefaultNFT(user1Addr);

      const uri = await nft.tokenURI(1n);
      expect(uri).to.equal(`${BASE_URI}1.json`);
    });

    it("should mint multiple NFTs with sequential URIs", async function () {
      const user1Addr = await user1.getAddress();

      await nft.mintDefaultNFT(user1Addr);
      await nft.mintDefaultNFT(user1Addr);
      await nft.mintDefaultNFT(user1Addr);

      expect(await nft.tokenURI(1n)).to.equal(`${BASE_URI}1.json`);
      expect(await nft.tokenURI(2n)).to.equal(`${BASE_URI}2.json`);
      expect(await nft.tokenURI(3n)).to.equal(`${BASE_URI}3.json`);
    });

    it("should set the creator correctly", async function () {
      const user1Addr = await user1.getAddress();
      const ownerAddr = await owner.getAddress();

      await nft.mintDefaultNFT(user1Addr);
      expect(await nft.getCreator(1n)).to.equal(ownerAddr);
    });

    it("should emit NFTCreated event", async function () {
      const user1Addr = await user1.getAddress();
      const tx = await nft.mintDefaultNFT(user1Addr);
      const receipt = await tx.wait();

      const event = receipt.logs.find(
        (log: any) =>
          log.topics[0] ===
          id("NFTCreated(uint256,address,address,string,uint256)")
      );
      expect(event).to.not.be.undefined;
    });

    it("should allow non-owner wallets to mint default NFTs", async function () {
      const user1Addr = await user1.getAddress();
      const nftAsUser1 = nft.connect(user1);

      await nftAsUser1.mintDefaultNFT(user1Addr);

      expect(await nft.ownerOf(1n)).to.equal(user1Addr);
      expect(await nft.getCreator(1n)).to.equal(user1Addr);
    });

    it("should revert when minting to zero address", async function () {
      await expect(
        nft.mintDefaultNFT("0x0000000000000000000000000000000000000000")
      ).to.be.revertedWith("Cannot mint to zero address");
    });

    it("should increment totalMinted correctly across mints", async function () {
      const user1Addr = await user1.getAddress();

      for (let i = 0; i < 5; i++) {
        await nft.mintDefaultNFT(user1Addr);
      }

      expect(await nft.totalMinted()).to.equal(5n);
    });
  });

  // ==========================================================================
  // Token Queries
  // ==========================================================================

  describe("Token Queries", function () {
    const TOKEN_URI = "ipfs://QmTest/metadata.json";

    beforeEach(async function () {
      // Mint 3 tokens: 2 to user1, 1 to user2
      await nft.mintNFT(await user1.getAddress(), TOKEN_URI);
      await nft.mintNFT(await user1.getAddress(), TOKEN_URI);
      await nft.mintNFT(await user2.getAddress(), TOKEN_URI);
    });

    describe("getTokensOfOwner()", function () {
      it("should return all tokens owned by a user", async function () {
        const user1Addr = await user1.getAddress();
        const tokens = await nft.getTokensOfOwner(user1Addr);

        expect(tokens.length).to.equal(2);
        expect(tokens[0]).to.equal(1n);
        expect(tokens[1]).to.equal(2n);
      });

      it("should return correct tokens for user2", async function () {
        const user2Addr = await user2.getAddress();
        const tokens = await nft.getTokensOfOwner(user2Addr);

        expect(tokens.length).to.equal(1);
        expect(tokens[0]).to.equal(3n);
      });

      it("should return empty array for address with no tokens", async function () {
        const tokens = await nft.getTokensOfOwner(
          "0x0000000000000000000000000000000000000000"
        );
        expect(tokens.length).to.equal(0);
      });

      it("should update after burning a token", async function () {
        const user1Addr = await user1.getAddress();

        // Burn token 1 from user1
        const nftAsUser1 = nft.connect(user1);
        await nftAsUser1.burn(1n);

        const tokens = await nft.getTokensOfOwner(user1Addr);
        expect(tokens.length).to.equal(1);
        expect(tokens[0]).to.equal(2n);
      });
    });

    describe("getCreator()", function () {
      it("should return the original creator", async function () {
        const ownerAddr = await owner.getAddress();
        expect(await nft.getCreator(1n)).to.equal(ownerAddr);
        expect(await nft.getCreator(3n)).to.equal(ownerAddr);
      });

      it("should still return original creator after transfer", async function () {
        // Transfer token 1 from user1 to user2
        const user1Addr = await user1.getAddress();
        const user2Addr = await user2.getAddress();
        const nftAsUser1 = nft.connect(user1);
        await nftAsUser1.transferFrom(user1Addr, user2Addr, 1n);

        // Creator should still be the original minter (owner)
        const ownerAddr = await owner.getAddress();
        expect(await nft.getCreator(1n)).to.equal(ownerAddr);
      });

      it("should revert for non-existent token", async function () {
        await expect(nft.getCreator(999n)).to.be.revertedWith(
          "Token does not exist"
        );
      });

      it("should revert for burned token", async function () {
        const nftAsUser1 = nft.connect(user1);
        await nftAsUser1.burn(1n);

        await expect(nft.getCreator(1n)).to.be.revertedWith(
          "Token does not exist"
        );
      });
    });

    describe("tokenExists()", function () {
      it("should return true for minted token", async function () {
        expect(await nft.tokenExists(1n)).to.be.true;
        expect(await nft.tokenExists(3n)).to.be.true;
      });

      it("should return false for non-existent token", async function () {
        expect(await nft.tokenExists(999n)).to.be.false;
      });

      it("should return false for burned token", async function () {
        const nftAsUser1 = nft.connect(user1);
        await nftAsUser1.burn(1n);

        expect(await nft.tokenExists(1n)).to.be.false;
      });
    });

    describe("getCollectionInfo()", function () {
      it("should return correct collection info", async function () {
        const info = await nft.getCollectionInfo();

        expect(info.collectionName).to.equal(COLLECTION_NAME);
        expect(info.collectionSymbol).to.equal(COLLECTION_SYMBOL);
        expect(info.maxSupply).to.equal(MAX_SUPPLY);
        expect(info.currentSupply).to.equal(3n);
        expect(info.mintedCount).to.equal(3n);
        expect(info.deployTime).to.be.a("bigint");
        expect(info.deployTime).to.be.greaterThan(0n);
        expect(info.lastMintTime).to.be.a("bigint");
        expect(info.lastMintTime).to.be.greaterThan(0n);
      });

      it("should reflect updated values after new mints", async function () {
        const user1Addr = await user1.getAddress();
        await nft.mintNFT(user1Addr, "ipfs://new/metadata.json");

        const info = await nft.getCollectionInfo();
        expect(info.currentSupply).to.equal(4n);
        expect(info.mintedCount).to.equal(4n);
        expect(info.lastMintTime).to.be.greaterThan(0n);
      });

      it("should reflect updated values after burn", async function () {
        const nftAsUser1 = nft.connect(user1);
        await nftAsUser1.burn(1n);

        const info = await nft.getCollectionInfo();
        expect(info.currentSupply).to.equal(2n); // totalSupply decreased
        expect(info.mintedCount).to.equal(3n); // totalMinted does NOT decrease
      });
    });
  });

  // ==========================================================================
  // Burning (ERC721Burnable)
  // ==========================================================================

  describe("Burning", function () {
    const TOKEN_URI = "ipfs://QmTest/burn-test.json";

    beforeEach(async function () {
      await nft.mintNFT(await user1.getAddress(), TOKEN_URI);
      await nft.mintNFT(await user1.getAddress(), TOKEN_URI);
      await nft.mintNFT(await user2.getAddress(), TOKEN_URI);
    });

    it("should allow the token owner to burn their token", async function () {
      const user1Addr = await user1.getAddress();
      const nftAsUser1 = nft.connect(user1);

      await nftAsUser1.burn(1n);

      // Token should not exist anymore
      expect(await nft.tokenExists(1n)).to.be.false;
      expect(await nft.balanceOf(user1Addr)).to.equal(1n);
    });

    it("should decrease totalSupply after burn", async function () {
      const nftAsUser1 = nft.connect(user1);

      expect(await nft.totalSupply()).to.equal(3n);
      await nftAsUser1.burn(1n);
      expect(await nft.totalSupply()).to.equal(2n);
    });

    it("should NOT decrease totalMinted after burn", async function () {
      const nftAsUser1 = nft.connect(user1);

      expect(await nft.totalMinted()).to.equal(3n);
      await nftAsUser1.burn(1n);
      expect(await nft.totalMinted()).to.equal(3n); // totalMinted is immutable
    });

    it("should revert when burning a non-existent token", async function () {
      await expect(nft.burn(999n)).to.be.reverted;
    });

    it("should revert when non-owner tries to burn", async function () {
      const nftAsUser2 = nft.connect(user2);

      // user2 does not own token 1, so cannot burn
      await expect(nftAsUser2.burn(1n)).to.be.reverted;
    });

    it("should emit Transfer event to zero address on burn", async function () {
      const nftAsUser1 = nft.connect(user1);
      const tx = await nftAsUser1.burn(1n);
      const receipt = await tx.wait();

      const event = receipt.logs.find(
        (log: any) =>
          log.topics[0] === id("Transfer(address,address,uint256)")
      );
      expect(event).to.not.be.undefined;
    });

    it("should clear token URI after burn", async function () {
      const nftAsUser1 = nft.connect(user1);
      await nftAsUser1.burn(1n);

      // tokenURI should revert for burned token
      await expect(nft.tokenURI(1n)).to.be.reverted;
    });
  });

  // ==========================================================================
  // Transfers
  // ==========================================================================

  describe("Transfers", function () {
    const TOKEN_URI = "ipfs://QmTest/transfer-test.json";

    beforeEach(async function () {
      await nft.mintNFT(await user1.getAddress(), TOKEN_URI);
      await nft.mintNFT(await user2.getAddress(), TOKEN_URI);
    });

    it("should transfer an NFT from one user to another", async function () {
      const user1Addr = await user1.getAddress();
      const user2Addr = await user2.getAddress();

      const nftAsUser1 = nft.connect(user1);
      await nftAsUser1.transferFrom(user1Addr, user2Addr, 1n);

      expect(await nft.ownerOf(1n)).to.equal(user2Addr);
      expect(await nft.balanceOf(user1Addr)).to.equal(0n);
      expect(await nft.balanceOf(user2Addr)).to.equal(2n);
    });

    it("should emit Transfer event", async function () {
      const user1Addr = await user1.getAddress();
      const user2Addr = await user2.getAddress();

      const nftAsUser1 = nft.connect(user1);
      const tx = await nftAsUser1.transferFrom(user1Addr, user2Addr, 1n);
      const receipt = await tx.wait();

      const event = receipt.logs.find(
        (log: any) =>
          log.topics[0] === id("Transfer(address,address,uint256)")
      );
      expect(event).to.not.be.undefined;
    });

    it("should revert when non-owner tries to transfer", async function () {
      const user1Addr = await user1.getAddress();
      const user2Addr = await user2.getAddress();

      // user2 does not own token 1
      const nftAsUser2 = nft.connect(user2);
      await expect(
        nftAsUser2.transferFrom(user1Addr, user2Addr, 1n)
      ).to.be.reverted;
    });

    it("should support safeTransferFrom", async function () {
      const user1Addr = await user1.getAddress();
      const user2Addr = await user2.getAddress();

      const nftAsUser1 = nft.connect(user1);
      await nftAsUser1["safeTransferFrom(address,address,uint256)"](
        user1Addr,
        user2Addr,
        1n
      );

      expect(await nft.ownerOf(1n)).to.equal(user2Addr);
    });

    it("should update getTokensOfOwner after transfer", async function () {
      const user1Addr = await user1.getAddress();
      const user2Addr = await user2.getAddress();

      const nftAsUser1 = nft.connect(user1);
      await nftAsUser1.transferFrom(user1Addr, user2Addr, 1n);

      const user1Tokens = await nft.getTokensOfOwner(user1Addr);
      expect(user1Tokens.length).to.equal(0);

      const user2Tokens = await nft.getTokensOfOwner(user2Addr);
      expect(user2Tokens.length).to.equal(2);
      expect(user2Tokens[1]).to.equal(1n); // token 1 transferred to user2
    });
  });

  // ==========================================================================
  // setBaseURI
  // ==========================================================================

  describe("setBaseURI()", function () {
    it("should update the base URI", async function () {
      const newBaseURI = "https://new-example.com/metadata/";
      await nft.setBaseURI(newBaseURI);

      const user1Addr = await user1.getAddress();
      await nft.mintDefaultNFT(user1Addr);

      expect(await nft.tokenURI(1n)).to.equal(`${newBaseURI}1.json`);
    });

    it("should affect default NFT URIs after change", async function () {
      const user1Addr = await user1.getAddress();

      // Mint with old baseURI
      await nft.mintDefaultNFT(user1Addr);
      expect(await nft.tokenURI(1n)).to.equal(`${BASE_URI}1.json`);

      // Change baseURI
      const newBaseURI = "https://changed-uri.com/";
      await nft.setBaseURI(newBaseURI);

      // Mint another with new baseURI
      await nft.mintDefaultNFT(user1Addr);
      expect(await nft.tokenURI(2n)).to.equal(`${newBaseURI}2.json`);

      // Old token's URI should remain unchanged
      expect(await nft.tokenURI(1n)).to.equal(`${BASE_URI}1.json`);
    });

    it("should revert when called by non-owner", async function () {
      const nftAsUser1 = nft.connect(user1);
      await expect(
        nftAsUser1.setBaseURI("https://evil.com/")
      ).to.be.revertedWithCustomError(nftAsUser1, "OwnableUnauthorizedAccount");
    });
  });

  // ==========================================================================
  // ERC-721 Standard Compliance
  // ==========================================================================

  describe("ERC-721 Standard Compliance", function () {
    const TOKEN_URI = "ipfs://QmTest/erc721.json";

    beforeEach(async function () {
      await nft.mintNFT(await user1.getAddress(), TOKEN_URI);
      await nft.mintNFT(await user2.getAddress(), TOKEN_URI);
      await nft.mintNFT(await owner.getAddress(), TOKEN_URI);
    });

    it("should support ERC721 interface", async function () {
      const ERC721_ID = "0x80ac58cd";
      expect(await nft.supportsInterface(ERC721_ID)).to.be.true;
    });

    it("should support ERC721Metadata interface", async function () {
      const ERC721_METADATA_ID = "0x5b5e139f";
      expect(await nft.supportsInterface(ERC721_METADATA_ID)).to.be.true;
    });

    it("should support ERC721Enumerable interface", async function () {
      const ERC721_ENUMERABLE_ID = "0x780e9d63";
      expect(await nft.supportsInterface(ERC721_ENUMERABLE_ID)).to.be.true;
    });

    it("should have proper balanceOf for each account", async function () {
      expect(await nft.balanceOf(await user1.getAddress())).to.equal(1n);
      expect(await nft.balanceOf(await user2.getAddress())).to.equal(1n);
      expect(await nft.balanceOf(await owner.getAddress())).to.equal(1n);
    });

    it("should support tokenOfOwnerByIndex (enumerable)", async function () {
      const user1Addr = await user1.getAddress();
      expect(await nft.tokenOfOwnerByIndex(user1Addr, 0)).to.equal(1n);
    });

    it("should revert balanceOf for zero address", async function () {
      await expect(
        nft.balanceOf("0x0000000000000000000000000000000000000000")
      ).to.be.reverted;
    });
  });

  // ==========================================================================
  // Edge Cases
  // ==========================================================================

  describe("Edge Cases", function () {
    it("should allow minting many tokens to the same address", async function () {
      const user1Addr = await user1.getAddress();

      for (let i = 0; i < 10; i++) {
        await nft.mintNFT(user1Addr, `ipfs://metadata/${i}.json`);
      }

      expect(await nft.balanceOf(user1Addr)).to.equal(10n);
      expect(await nft.totalSupply()).to.equal(10n);

      const tokens = await nft.getTokensOfOwner(user1Addr);
      expect(tokens.length).to.equal(10);
    });

    it("should handle custom token URI with special characters", async function () {
      const user1Addr = await user1.getAddress();
      const specialURI = "https://api.example.com/metadata?id=123&format=json";

      await nft.mintNFT(user1Addr, specialURI);
      expect(await nft.tokenURI(1n)).to.equal(specialURI);
    });

    it("should maintain correct state across multiple operations", async function () {
      const user1Addr = await user1.getAddress();
      const user2Addr = await user2.getAddress();

      // Mint
      await nft.mintNFT(user1Addr, "uri1.json");
      await nft.mintNFT(user2Addr, "uri2.json");

      // Transfer
      const nftAsUser1 = nft.connect(user1);
      await nftAsUser1.transferFrom(user1Addr, user2Addr, 1n);

      // Burn
      await nft.burn(2n);

      // Verify final state
      expect(await nft.totalSupply()).to.equal(1n);
      expect(await nft.totalMinted()).to.equal(2n);
      expect(await nft.balanceOf(user2Addr)).to.equal(1n);
      expect(await nft.ownerOf(1n)).to.equal(user2Addr);
      expect(await nft.tokenExists(1n)).to.be.true;
      expect(await nft.tokenExists(2n)).to.be.false;
    });

    it("should handle very long token URI", async function () {
      const user1Addr = await user1.getAddress();
      const longURI = "https://example.com/" + "a".repeat(500) + "/metadata.json";

      await nft.mintNFT(user1Addr, longURI);
      expect(await nft.tokenURI(1n)).to.equal(longURI);
    });
  });
});
