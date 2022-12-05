import { expect } from 'chai';
import { expectEvent } from '@openzeppelin/test-helpers';
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
    const _aaveILendingPoolAddress = "0x4bd5643ac6f66a5237E18bfA7d47cF22f1c9F210"; // fake address, not used
    const _aaveProtocolDataProviderAddress = "0x4bd5643ac6f66a5237E18bfA7d47cF22f1c9F210"; // fake address, not used
    const _priceFeedAddress = "0x4bd5643ac6f66a5237E18bfA7d47cF22f1c9F210"; // fake address, not used
    const _feesManagerAddress = "0x4bd5643ac6f66a5237E18bfA7d47cF22f1c9F210"; // fake address, not used

    beforeEach(async () => {
      factory = await HelloDefiAAVE2Factory.new(
        _aaveILendingPoolAddress, 
        _aaveProtocolDataProviderAddress, 
        _priceFeedAddress, 
        _feesManagerAddress, 
        { from: owner }
      );
    });

    it("should create new HelloDefiAAVE2 smart contracts", async () => {
      await factory.createClone({ from: owner });
      await factory.createClone({ from: account1 });
      await factory.createClone({ from: account2 });

      const ownerCloneAddress = await factory.userContracts(owner);
      const accountCloneAddress = await factory.userContracts(account1);
      const account2CloneAddress = await factory.userContracts(account2);

      const ownerSc = await HelloDefiAAVE2.at(ownerCloneAddress);
      const account1Sc = await HelloDefiAAVE2.at(accountCloneAddress);
      const account2Sc = await HelloDefiAAVE2.at(account2CloneAddress);

      expect(ownerSc).not.to.be.null;
      expect(account1Sc).not.to.be.null;
      expect(account2Sc).not.to.be.null;
    });

    it("should emit a CloneCreated event", async () => {
      let receiptOwner = await factory.createClone({ from: owner });
      let receiptAccount1 = await factory.createClone({ from: account1 });
      let receiptAccount2 = await factory.createClone({ from: account2 });

      const ownerCloneAddress = await factory.userContracts(owner);
      const accountCloneAddress = await factory.userContracts(account1);
      const account2CloneAddress = await factory.userContracts(account2);

      expectEvent(receiptOwner, "CloneCreated", { _owner: owner, _clone: ownerCloneAddress });
      expectEvent(receiptAccount1, "CloneCreated", { _owner: account1, _clone: accountCloneAddress });
      expectEvent(receiptAccount2, "CloneCreated", { _owner: account2, _clone: account2CloneAddress });
    });

  });
});
