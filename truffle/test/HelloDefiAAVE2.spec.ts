import chai from "chai";
import BN from "bn.js";
import CBN from "chai-bn";
import { expect } from 'chai';
import { expectRevert, expectEvent } from '@openzeppelin/test-helpers';
import { HelloDefiAAVE2Instance } from "../types/HelloDefiAAVE2";
import { ILendingPoolAAVE2Instance } from "../types/ILendingPoolAAVE2";
import web3 from 'web3';

const HelloDefiAAVE2 = artifacts.require("HelloDefiAAVE2");
const MockERC20 = artifacts.require("MockERC20");

const MockLendingPoolAAVE2 = artifacts.require("MockLendingPoolAAVE2");

contract("HelloDefiAAVE2", function (accounts) {
  const [owner, account1] = accounts;
  let instance: HelloDefiAAVE2Instance;
  let aaveLendingPool: ILendingPoolAAVE2Instance;
  before(() => {
    chai.use(CBN(BN));
  });
  describe("initialize", async () => {
    beforeEach(async () => {
      instance = await HelloDefiAAVE2.new({ from: owner });
      aaveLendingPool = await MockLendingPoolAAVE2.new({ from: owner });
      await instance.initialize(aaveLendingPool.address, owner);
    });

    it("should set the owner correctly", async () => {
      const instanceOwner = await instance.owner();
      expect(instanceOwner).to.be.equal(owner);
    });

    context("initialize a second time", async () => {
      it("should revert", async () => {
        await expectRevert(instance.initialize(aaveLendingPool.address, account1),
          "contract is already initialized"
        );
      });
    });
  });

  describe("deposit", async () => {
    let asset;
    let assetAddress;
    beforeEach(async () => {
      instance = await HelloDefiAAVE2.new({ from: owner });
      aaveLendingPool = await MockLendingPoolAAVE2.new({ from: owner });
      await instance.initialize(aaveLendingPool.address, owner);
      asset = await MockERC20.new(web3.utils.toWei("100000", 'ether'), { from: owner });
      assetAddress = asset.address;
    });

    it("should revert if not called by the owner", async () => {
      await expectRevert(instance.deposit(assetAddress, new BN(10), { from: account1 }),
        "caller is not the owner")
    });

    it("should revert if the amount asked is 0", async () => {
      await expectRevert(instance.deposit(assetAddress, new BN(0), { from: owner }),
        "amount must be > 0!")
    });

    it("should revert if the smart contract has no allowance to spend the user's asset", async () => {
      expect(await asset.balanceOf(owner)).to.be.a.bignumber.equal(web3.utils.toWei("100000", 'ether'));

      await expectRevert(instance.deposit(assetAddress, web3.utils.toWei("100000", 'ether'), { from: owner }),
        "insufficient allowance"
      );
    });

    context("when the smart contract has allowance", async () => {
      beforeEach(async () => {
        expect(await asset.balanceOf(owner)).to.be.a.bignumber.equal(web3.utils.toWei("100000", 'ether'));
        await asset.approve(instance.address, web3.utils.toWei("50", 'ether'), { from: owner });
      });

      it("should revert if the amount is greater than the allowance", async () => {

        await expectRevert(instance.deposit(assetAddress, web3.utils.toWei("100000", 'ether'), { from: owner }),
          "insufficient allowance"
        );
      });

      it("should transfer asset from the user to the smart contract", async () => {
        const initialSmartContractBalance = await asset.balanceOf(instance.address);
        expect(initialSmartContractBalance).to.be.a.bignumber.equal(new BN("0"));

        await instance.deposit(assetAddress, web3.utils.toWei("50", 'ether'), { from: owner });

        const smartContractBalance = await asset.balanceOf(instance.address);
        expect(smartContractBalance).to.be.a.bignumber.equal(web3.utils.toWei("50", 'ether'));

        const assetBalance = await instance.balances(assetAddress, { from: owner });
        expect(assetBalance).to.be.a.bignumber.equal(web3.utils.toWei("50", 'ether'));
      });
    });
  });

  describe.only("withdraw", async () => {
    let asset;
    let assetAddress;
    beforeEach(async () => {
      instance = await HelloDefiAAVE2.new({ from: owner });
      aaveLendingPool = await MockLendingPoolAAVE2.new({ from: owner });
      await instance.initialize(aaveLendingPool.address, owner);
      asset = await MockERC20.new(web3.utils.toWei("100000", 'ether'), { from: owner });
      assetAddress = asset.address;

      // the user deposits 50 tokens into the smart contract
      await asset.approve(instance.address, web3.utils.toWei("50", 'ether'), { from: owner });
      await instance.deposit(assetAddress, web3.utils.toWei("50", 'ether'), { from: owner });
      expect(await asset.balanceOf(owner)).to.be.bignumber.equal(web3.utils.toWei("99950", 'ether'));
      expect(await asset.balanceOf(instance.address)).to.be.bignumber.equal(web3.utils.toWei("50", 'ether'));
      expect(await instance.balances(assetAddress)).to.be.bignumber.equal(web3.utils.toWei("50", 'ether'));
    });

    it("should revert if the user is not the owner", async () => {
        await expectRevert(instance.withdraw(assetAddress, web3.utils.toWei("100000", 'ether'), {from: account1}),
        "caller is not the owner"
        );
    });

    it("should revert if amount asked is 0", async () => {
      await expectRevert(instance.withdraw(assetAddress, web3.utils.toWei("0", 'ether'), {from: owner}),
        "_amount must be > 0!"
        );
    });

    it("should revert if amount asked > smart contract balance", async () => {
      await expectRevert(instance.withdraw(assetAddress, web3.utils.toWei("60", 'ether'), { from: owner }),
        "Insufficiant balance"
      );
    });

    it("should transfer the smart contract amount balance to the user", async () => {
      await instance.withdraw(assetAddress, web3.utils.toWei("50", 'ether'), { from: owner });

      expect(await asset.balanceOf(owner)).to.be.bignumber.equal(web3.utils.toWei("100000", 'ether'));
      expect(await asset.balanceOf(instance.address)).to.be.bignumber.equal(web3.utils.toWei("0", 'ether'));
      expect(await instance.balances(assetAddress)).to.be.bignumber.equal(web3.utils.toWei("0", 'ether'));
    });

  });
});
