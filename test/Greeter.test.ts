import { expect } from "chai";
import hre from "hardhat";
import { id } from "ethers";
import { Contract } from "zksync-ethers";

describe("Greeter", function () {
  // Increase timeout for local node operations
  this.timeout(60_000);

  let greeter: Contract;
  let wallet: any;
  let otherWallet: any;
  const initialGreeting = "Hello, zkSync Era! 🚀";

  before(async function () {
    // Get wallets from the local node
    const wallets = await hre.zksyncEthers.getWallets(hre);
    wallet = wallets[0];
    otherWallet = wallets[1];
  });

  beforeEach(async function () {
    // Deploy a fresh Greeter contract before each test
    const artifact = await hre.zksyncEthers.loadArtifact("Greeter");
    greeter = await hre.zksyncEthers.deployContract(
      hre,
      artifact,
      [initialGreeting],
      wallet
    );
  });

  describe("Deployment", function () {
    it("should deploy with the correct initial greeting", async function () {
      const greeting = await greeter.greet();
      expect(greeting).to.equal(initialGreeting);
    });

    it("should set the deployer as the owner", async function () {
      const owner = await greeter.owner();
      expect(owner.toLowerCase()).to.equal(
        (await wallet.getAddress()).toLowerCase()
      );
    });

    it("should set the deployer as the initial last updater", async function () {
      const updater = await greeter.lastUpdater();
      expect(updater.toLowerCase()).to.equal(
        (await wallet.getAddress()).toLowerCase()
      );
    });

    it("should set lastUpdated on deployment", async function () {
      const lastUpdated = await greeter.lastUpdated();
      expect(lastUpdated).to.be.a("bigint");
      expect(lastUpdated).to.be.greaterThan(0n);
    });

    it("should deploy to a valid contract address", async function () {
      const artifact = await hre.zksyncEthers.loadArtifact("Greeter");
      const tx = await hre.zksyncEthers.deployContract(
        hre,
        artifact,
        ["Test Event"],
        wallet
      );

      // Verify the contract address is valid
      expect(await tx.getAddress()).to.be.properAddress;
    });
  });

  describe("greet()", function () {
    it("should return the current greeting", async function () {
      expect(await greeter.greet()).to.equal(initialGreeting);
    });

    it("should return updated greeting after setGreeting", async function () {
      const newGreeting = "Hello, World!";
      await greeter.setGreeting(newGreeting);
      expect(await greeter.greet()).to.equal(newGreeting);
    });

    it("should return a string", async function () {
      const greeting = await greeter.greet();
      expect(greeting).to.be.a("string");
    });
  });

  describe("setGreeting()", function () {
    it("should update the greeting when called by any connected wallet", async function () {
      const newGreeting = "zkSync is awesome!";
      const greeterAsOther = greeter.connect(otherWallet);
      await greeterAsOther.setGreeting(newGreeting);

      expect(await greeter.greet()).to.equal(newGreeting);
      expect((await greeter.lastUpdater()).toLowerCase()).to.equal(
        (await otherWallet.getAddress()).toLowerCase()
      );
    });

    it("should emit GreetingChanged event", async function () {
      const newGreeting = "New greeting!";
      const tx = await greeter.setGreeting(newGreeting);
      const receipt = await tx.wait();

      // Find the GreetingChanged event
      const event = receipt.logs.find(
        (log: any) =>
          log.topics[0] ===
          id("GreetingChanged(address,string,uint256)")
      );
      expect(event).to.not.be.undefined;
    });

    it("should update lastUpdated timestamp", async function () {
      const oldTimestamp = await greeter.lastUpdated();
      // Wait 1 second to ensure timestamp changes
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await greeter.setGreeting("Updated greeting");
      const newTimestamp = await greeter.lastUpdated();

      expect(newTimestamp).to.be.greaterThan(oldTimestamp);
    });

    it("should allow non-owner wallets to update the greeting", async function () {
      const greeterAsOther = greeter.connect(otherWallet);
      await greeterAsOther.setGreeting("Community update");

      expect(await greeter.greet()).to.equal("Community update");
      expect((await greeter.lastUpdater()).toLowerCase()).to.equal(
        (await otherWallet.getAddress()).toLowerCase()
      );
    });

    it("should revert with empty greeting", async function () {
      await expect(greeter.setGreeting("")).to.be.revertedWith(
        "Greeting cannot be empty"
      );
    });

    it("should revert with greeting longer than 256 characters", async function () {
      const longGreeting = "a".repeat(257);
      await expect(greeter.setGreeting(longGreeting)).to.be.revertedWith(
        "Greeting too long (max 256 chars)"
      );
    });

    it("should accept greeting of exactly 256 characters", async function () {
      const maxGreeting = "a".repeat(256);
      await greeter.setGreeting(maxGreeting);
      expect(await greeter.greet()).to.equal(maxGreeting);
    });

    it("should accept greeting of exactly 1 character", async function () {
      await greeter.setGreeting("H");
      expect(await greeter.greet()).to.equal("H");
    });
  });

  describe("isOwner()", function () {
    it("should return true for the owner address", async function () {
      const ownerAddr = await wallet.getAddress();
      const result = await greeter.isOwner(ownerAddr);
      expect(result).to.be.true;
    });

    it("should return false for non-owner address", async function () {
      const otherAddr = await otherWallet.getAddress();
      const result = await greeter.isOwner(otherAddr);
      expect(result).to.be.false;
    });
  });

  describe("getInfo()", function () {
    it("should return all contract info correctly", async function () {
      const info = await greeter.getInfo();

      expect(info.ownerAddress.toLowerCase()).to.equal(
        (await wallet.getAddress()).toLowerCase()
      );
      expect(info.updaterAddress.toLowerCase()).to.equal(
        (await wallet.getAddress()).toLowerCase()
      );
      expect(info.currentGreeting).to.equal(initialGreeting);
      expect(info.updatedAt).to.be.a("bigint");
      expect(info.chainId).to.be.a("bigint");
    });

    it("should reflect updated greeting after setGreeting", async function () {
      const greeterAsOther = greeter.connect(otherWallet);
      await greeterAsOther.setGreeting("Updated for info test");
      const info = await greeter.getInfo();
      expect(info.currentGreeting).to.equal("Updated for info test");
      expect(info.updaterAddress.toLowerCase()).to.equal(
        (await otherWallet.getAddress()).toLowerCase()
      );
    });
  });

  describe("State", function () {
    it("should maintain state across multiple calls", async function () {
      expect(await greeter.greet()).to.equal(initialGreeting);

      await greeter.setGreeting("First update");
      expect(await greeter.greet()).to.equal("First update");

      await greeter.setGreeting("Second update");
      expect(await greeter.greet()).to.equal("Second update");

      expect(await greeter.isOwner(await wallet.getAddress())).to.be.true;
    });

    it("should have proper address", async function () {
      expect(await greeter.getAddress()).to.be.properAddress;
    });
  });
});
