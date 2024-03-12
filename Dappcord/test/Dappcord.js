const { expect } = require("chai");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("Dappcord", async function () {
  let dappcord;
  let deployer, user;
  let NAME = "Dappcord";
  let CHANNEL_NAME = "general";
  let CHANNEL_ID = 1;
  let SYMBOL = "DC";
  beforeEach(async () => {
    [deployer, user] = await ethers.getSigners();
    const DappCord = await ethers.getContractFactory("Dappcord");
    dappcord = await DappCord.deploy(NAME, SYMBOL);

    //  Create a channel
    const transaction = await dappcord
      .connect(deployer)
      .createChannel(CHANNEL_NAME, tokens(1));
    await transaction.wait();
  });
  describe("Deployment", () => {
    it("Sets the name", async () => {
      let result = await dappcord.name();
      expect(result).to.be.equal(NAME);
    });
    it("Sets the symbol", async () => {
      let result = await dappcord.symbol();
      expect(result).to.be.equal(SYMBOL);
    });
    it("Sets the owner", async () => {
      let result = await dappcord.owner();
      expect(result).to.be.equal(deployer.address);
    });
  });

  describe("Creating Channels", () => {
    it("Returns total channels", async () => {
      const result = await dappcord.totalChannels();
      expect(result).to.be.equal(1);
    });
    it("Returns channel attributes", async () => {
      const channel = await dappcord.getChannel(1);
      expect(channel.id).to.be.equal(CHANNEL_ID);
      expect(channel.name).to.be.equal(CHANNEL_NAME);
      expect(channel.cost).to.be.equal(tokens(1));
    });
  });

  describe("Joining Channels", () => {
    const ID = 1;
    const AMOUNT = ethers.utils.parseUnits("1", "ether");

    beforeEach(async () => {
      const transaction = await dappcord
        .connect(user)
        .mint(ID, { value: AMOUNT });
      await transaction.wait();
    });

    it("Joins the user", async () => {
      const result = await dappcord.hasJoined(ID, user.address);
      expect(result).to.be.equal(true);
    });

    it("Increases total supply", async () => {
      const result = await dappcord.totalSupply();
      expect(result).to.be.equal(ID);
    });

    it("Updates the contract balance", async () => {
      const result = await ethers.provider.getBalance(dappcord.address);
      expect(result).to.be.equal(AMOUNT);
    });
  });
  describe("Withdrawing", () => {
    const ID = 1;
    const AMOUNT = ethers.utils.parseUnits("10", "ether");
    let balanceBefore;

    beforeEach(async () => {
      balanceBefore = await ethers.provider.getBalance(deployer.address);

      let transaction = await dappcord
        .connect(user)
        .mint(ID, { value: AMOUNT });
      await transaction.wait();

      transaction = await dappcord.connect(deployer).withdraw();
      await transaction.wait();
    });

    it("Updates the owner balance", async () => {
      const balanceAfter = await ethers.provider.getBalance(deployer.address);
      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    });

    it("Updates the contract balance", async () => {
      const result = await ethers.provider.getBalance(dappcord.address);
      expect(result).to.equal(0);
    });
  });
});
