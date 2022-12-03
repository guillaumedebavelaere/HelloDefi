import { expect } from 'chai';
import { HelloDefiAAVE2FactoryInstance } from "../types/HelloDefiAAVE2Factory"
const HelloDefiAAVE2Factory = artifacts.require("HelloDefiAAVE2Factory");
const HelloDefiAAVE2 = artifacts.require("HelloDefiAAVE2");

contract("HelloDefiAAVE2Factory", function (accounts) {
  it("should deploy with no errors", async function () {
    await HelloDefiAAVE2Factory.deployed();
    return assert.isTrue(true);
  });

  describe("create HelloDefiAAVE2 clones", async () => {
    let factory: HelloDefiAAVE2FactoryInstance;
    const [owner, account1, account2] = accounts;
    const _aaveILendingPoolAddress = "0x4bd5643ac6f66a5237E18bfA7d47cF22f1c9F210";
    beforeEach(async () => {
      factory = await HelloDefiAAVE2Factory.new(_aaveILendingPoolAddress, { from: owner });
      await factory.createClone({ from: owner });
      await factory.createClone({ from: account1 });
      await factory.createClone({ from: account2 });
    });

    it("should create new HelloDefiAAVE2 smart contracts", async () => {
      const ownerCloneContract = await factory.userContracts(owner);
      const accountCloneContract = await factory.userContracts(account1);
      const account2CloneContract = await factory.userContracts(account2);
      

      const ownerSc = await HelloDefiAAVE2.at(ownerCloneContract);
      const account1Sc = await HelloDefiAAVE2.at(accountCloneContract);
      const account2Sc = await HelloDefiAAVE2.at(account2CloneContract);

      expect(ownerSc).not.to.be.null;
      expect(account1Sc).not.to.be.null;
      expect(account2Sc).not.to.be.null;
    });
  });
});
