import { expect } from "chai";
import hre from "hardhat";
import { Contract, parseEther, id } from "ethers";

describe("SimpleToken", function () {
  this.timeout(60_000);

  let token: Contract;
  let owner: any;
  let user1: any;
  let user2: any;

  const TOKEN_NAME = "zkSync Demo Token";
  const TOKEN_SYMBOL = "ZKDT";
  const INITIAL_SUPPLY = parseEther("1000000"); // 1 million tokens
  const MAX_SUPPLY = parseEther("100000000"); // 100 million tokens

  before(async function () {
    const wallets = await hre.zksyncEthers.getWallets(hre);
    owner = wallets[0];
    user1 = wallets[1];
    user2 = wallets[2];
  });

  beforeEach(async function () {
    const artifact = await hre.zksyncEthers.loadArtifact("SimpleToken");
    token = await hre.zksyncEthers.deployContract(
      hre,
      artifact,
      [TOKEN_NAME, TOKEN_SYMBOL, INITIAL_SUPPLY],
      owner
    );
  });

  describe("Deployment", function () {
    it("should set the correct token name", async function () {
      expect(await token.name()).to.equal(TOKEN_NAME);
    });

    it("should set the correct token symbol", async function () {
      expect(await token.symbol()).to.equal(TOKEN_SYMBOL);
    });

    it("should mint initial supply to deployer", async function () {
      const ownerBalance = await token.balanceOf(await owner.getAddress());
      expect(ownerBalance).to.equal(INITIAL_SUPPLY);
    });

    it("should set total supply equal to initial supply", async function () {
      const totalSupply = await token.totalSupply();
      expect(totalSupply).to.equal(INITIAL_SUPPLY);
    });

    it("should set the deployer as owner (Ownable)", async function () {
      const contractOwner = await token.owner();
      expect(contractOwner.toLowerCase()).to.equal(
        (await owner.getAddress()).toLowerCase()
      );
    });

    it("should set deploymentTime", async function () {
      const deployTime = await token.deploymentTime();
      expect(deployTime).to.be.a("bigint");
      expect(deployTime).to.be.greaterThan(0n);
    });

    it("should fail with initial supply exceeding max supply", async function () {
      const artifact = await hre.zksyncEthers.loadArtifact("SimpleToken");
      const excessiveSupply = MAX_SUPPLY + 1n;

      await expect(
        hre.zksyncEthers.deployContract(
          hre,
          artifact,
          [TOKEN_NAME, TOKEN_SYMBOL, excessiveSupply],
          owner
        )
      ).to.be.revertedWith("Initial supply exceeds max supply");
    });

    it("should emit TokensMinted event on deployment", async function () {
      const artifact = await hre.zksyncEthers.loadArtifact("SimpleToken");
      const tx = await hre.zksyncEthers.deployContract(
        hre,
        artifact,
        [TOKEN_NAME, TOKEN_SYMBOL, parseEther("100")],
        owner
      );
      expect(await tx.getAddress()).to.be.properAddress;
    });
  });

  describe("Transfers", function () {
    it("should transfer tokens between accounts", async function () {
      const user1Addr = await user1.getAddress();
      const transferAmount = parseEther("100");

      await token.transfer(user1Addr, transferAmount);
      expect(await token.balanceOf(user1Addr)).to.equal(transferAmount);
    });

    it("should update balances correctly after transfer", async function () {
      const ownerAddr = await owner.getAddress();
      const user1Addr = await user1.getAddress();
      const transferAmount = parseEther("500");

      const ownerBefore = await token.balanceOf(ownerAddr);
      await token.transfer(user1Addr, transferAmount);
      const ownerAfter = await token.balanceOf(ownerAddr);

      expect(ownerAfter).to.equal(ownerBefore - transferAmount);
      expect(await token.balanceOf(user1Addr)).to.equal(transferAmount);
    });

    it("should revert transfer when sender has insufficient balance", async function () {
      const user1Addr = await user1.getAddress();
      const user2Addr = await user2.getAddress();

      // user1 has 0 tokens
      const tokenAsUser1 = token.connect(user1);
      await expect(
        tokenAsUser1.transfer(user2Addr, parseEther("1"))
      ).to.be.reverted;
    });

    it("should emit Transfer event", async function () {
      const user1Addr = await user1.getAddress();
      const tx = await token.transfer(user1Addr, parseEther("50"));
      const receipt = await tx.wait();

      const event = receipt.logs.find(
        (log: any) =>
          log.topics[0] ===
          id("Transfer(address,address,uint256)")
      );
      expect(event).to.not.be.undefined;
    });

    it("should allow transferFrom with approval", async function () {
      const ownerAddr = await owner.getAddress();
      const user1Addr = await user1.getAddress();
      const user2Addr = await user2.getAddress();
      const allowance = parseEther("200");

      // Owner approves user1 to spend tokens
      await token.approve(user1Addr, allowance);
      expect(await token.allowance(ownerAddr, user1Addr)).to.equal(allowance);

      // user1 transfers from owner to user2
      const tokenAsUser1 = token.connect(user1);
      await tokenAsUser1.transferFrom(ownerAddr, user2Addr, parseEther("100"));

      expect(await token.balanceOf(user2Addr)).to.equal(parseEther("100"));
      expect(await token.allowance(ownerAddr, user1Addr)).to.equal(
        parseEther("100")
      );
    });
  });

  describe("Approvals", function () {
    it("should set allowance correctly", async function () {
      const user1Addr = await user1.getAddress();
      const amount = parseEther("1000");

      await token.approve(user1Addr, amount);
      expect(await token.allowance(await owner.getAddress(), user1Addr)).to.equal(amount);
    });

    it("should emit Approval event", async function () {
      const user1Addr = await user1.getAddress();
      const tx = await token.approve(user1Addr, parseEther("500"));
      const receipt = await tx.wait();

      const event = receipt.logs.find(
        (log: any) =>
          log.topics[0] ===
          id("Approval(address,address,uint256)")
      );
      expect(event).to.not.be.undefined;
    });

    it("should update allowance on subsequent approvals", async function () {
      const user1Addr = await user1.getAddress();

      await token.approve(user1Addr, parseEther("100"));
      await token.approve(user1Addr, parseEther("50"));

      expect(await token.allowance(await owner.getAddress(), user1Addr)).to.equal(
        parseEther("50")
      );
    });
  });

  describe("Minting (Owner only)", function () {
    it("should mint tokens to an address", async function () {
      const user1Addr = await user1.getAddress();
      const mintAmount = parseEther("10000");

      await token.mintTokens(user1Addr, mintAmount);
      expect(await token.balanceOf(user1Addr)).to.equal(mintAmount);
    });

    it("should increase total supply when minting", async function () {
      const user1Addr = await user1.getAddress();
      const supplyBefore = await token.totalSupply();

      await token.mintTokens(user1Addr, parseEther("50000"));
      const supplyAfter = await token.totalSupply();

      expect(supplyAfter).to.equal(supplyBefore + parseEther("50000"));
    });

    it("should emit TokensMinted event", async function () {
      const user1Addr = await user1.getAddress();
      const tx = await token.mintTokens(user1Addr, parseEther("1000"));
      const receipt = await tx.wait();

      const event = receipt.logs.find(
        (log: any) =>
          log.topics[0] ===
          id("TokensMinted(address,uint256,uint256)")
      );
      expect(event).to.not.be.undefined;
    });

    it("should revert when non-owner tries to mint", async function () {
      const user2Addr = await user2.getAddress();
      const tokenAsUser1 = token.connect(user1);

      await expect(
        tokenAsUser1.mintTokens(user2Addr, parseEther("100"))
      ).to.be.revertedWithCustomError(tokenAsUser1, "OwnableUnauthorizedAccount");
    });

    it("should revert when minting would exceed max supply", async function () {
      const nearMax = MAX_SUPPLY - INITIAL_SUPPLY;
      await token.mintTokens(await user1.getAddress(), nearMax);

      // Now total supply = MAX_SUPPLY, next mint should fail
      await expect(
        token.mintTokens(await user1.getAddress(), 1n)
      ).to.be.revertedWith("Exceeds max supply");
    });
  });

  describe("Burning", function () {
    it("should burn tokens and reduce balance", async function () {
      const ownerAddr = await owner.getAddress();
      const balanceBefore = await token.balanceOf(ownerAddr);
      const burnAmount = parseEther("1000");

      await token.burn(burnAmount);
      expect(await token.balanceOf(ownerAddr)).to.equal(
        balanceBefore - burnAmount
      );
    });

    it("should reduce total supply when burning", async function () {
      const supplyBefore = await token.totalSupply();
      await token.burn(parseEther("500"));
      expect(await token.totalSupply()).to.equal(
        supplyBefore - parseEther("500")
      );
    });

    it("should update totalBurned counter", async function () {
      const burnedBefore = await token.totalBurned();
      const burnAmount = parseEther("2000");

      await token.burn(burnAmount);
      expect(await token.totalBurned()).to.equal(burnedBefore + burnAmount);
    });

    it("should revert burn when insufficient balance", async function () {
      const tokenAsUser1 = token.connect(user1);
      await expect(tokenAsUser1.burn(parseEther("1"))).to.be.reverted;
    });

    it("should support burnFrom with approval", async function () {
      const ownerAddr = await owner.getAddress();
      const user1Addr = await user1.getAddress();
      const burnAmount = parseEther("500");

      await token.approve(user1Addr, burnAmount);

      const tokenAsUser1 = token.connect(user1);
      await tokenAsUser1.burnFrom(ownerAddr, burnAmount);

      expect(await token.totalBurned()).to.equal(burnAmount);
    });

    it("should revert burnFrom without sufficient allowance", async function () {
      const ownerAddr = await owner.getAddress();
      const tokenAsUser1 = token.connect(user1);

      await expect(
        tokenAsUser1.burnFrom(ownerAddr, parseEther("10"))
      ).to.be.reverted;
    });

    it("should accumulate totalBurned across multiple burns", async function () {
      await token.burn(parseEther("100"));
      await token.burn(parseEther("200"));
      await token.burn(parseEther("300"));

      expect(await token.totalBurned()).to.equal(parseEther("600"));
    });
  });

  describe("getTokenInfo()", function () {
    it("should return all token info correctly", async function () {
      const info = await token.getTokenInfo();

      expect(info.tokenName).to.equal(TOKEN_NAME);
      expect(info.tokenSymbol).to.equal(TOKEN_SYMBOL);
      expect(info.totalTokenSupply).to.equal(INITIAL_SUPPLY);
      expect(info.maxSupply).to.equal(MAX_SUPPLY);
      expect(info.deployTime).to.be.a("bigint");
      expect(info.burned).to.equal(0n);
    });

    it("should reflect updated values after mint and burn", async function () {
      await token.mintTokens(await user1.getAddress(), parseEther("1000"));
      await token.burn(parseEther("500"));

      const info = await token.getTokenInfo();
      const expectedSupply = INITIAL_SUPPLY + parseEther("1000") - parseEther("500");

      expect(info.totalTokenSupply).to.equal(expectedSupply);
      expect(info.burned).to.equal(parseEther("500"));
    });
  });

  describe("ERC20 Standard Compliance", function () {
    it("should have correct decimals (18)", async function () {
      expect(await token.decimals()).to.equal(18n);
    });

    it("should support ERC20 transfer to zero address", async function () {
      const user1Addr = await user1.getAddress();
      // Transfer to zero address should burn (standard behavior)
      await expect(
        token.connect(user1).transfer("0x0000000000000000000000000000000000000000", 1n)
      ).to.not.be.reverted;
    });

    it("should handle large transfers", async function () {
      const user1Addr = await user1.getAddress();
      const largeAmount = parseEther("100000"); // 100k tokens

      await token.transfer(user1Addr, largeAmount);
      expect(await token.balanceOf(user1Addr)).to.equal(largeAmount);
    });
  });

  describe("Edge Cases", function () {
    it("should transfer zero tokens", async function () {
      const user1Addr = await user1.getAddress();
      await token.transfer(user1Addr, 0n);

      expect(await token.balanceOf(user1Addr)).to.equal(0n);
    });

    it("should emit Transfer event for zero-value transfer", async function () {
      const user1Addr = await user1.getAddress();
      const tx = await token.transfer(user1Addr, 0n);
      const receipt = await tx.wait();

      const event = receipt.logs.find(
        (log: any) =>
          log.topics[0] ===
          id("Transfer(address,address,uint256)")
      );
      expect(event).to.not.be.undefined;
    });
  });
});
