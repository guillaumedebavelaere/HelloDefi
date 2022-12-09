import { expectRevert } from '@openzeppelin/test-helpers';
import { FeesCollectorInstance } from "../types/FeesCollector"
import { expect } from 'chai';
import chai from "chai";
import BN from "bn.js";
import CBN from "chai-bn";
const MockERC20 = artifacts.require("MockERC20");
const FeesCollector= artifacts.require("FeesCollector");

contract("FeesCollector", function (accounts) {
  before(() => {
    chai.use(CBN(BN));
  });

    it("should deploy with no errors", async function () {
      await FeesCollector.deployed();
      return assert.isTrue(true);
    });
  
    describe("withdraw", async () => {
      let feesCollector: FeesCollectorInstance;
      const [owner, account1, account2] = accounts;

      let asset;
      let assetAddress;
  
      beforeEach(async () => {
        feesCollector = await FeesCollector.new(
            {from: owner}
        );
        asset = await MockERC20.new(web3.utils.toWei("100000", 'ether'), { from: owner });
        assetAddress = asset.address;
      });
  
      it("should revert if the user is not the owner", async () => {
        await expectRevert(
            feesCollector.withdraw(
                assetAddress, 
                web3.utils.toWei("100000", 'ether'),
                { from: account1 }
            ), 
            "Ownable: caller is not the owner"
        );
      });

      it("should revert if the amount is == 0", async () => {
        await expectRevert(
            feesCollector.withdraw(
                assetAddress, 
                web3.utils.toWei("0", 'ether'),
                { from: owner }
            ), 
            "_amount must be > 0!"
        );
      });

      it("should transfer the asset to the owner wallet", async () => {
        //First we have to transfer asset to the contract
        await asset.approve(owner, web3.utils.toWei("100000", 'ether'), { from: owner });
        await asset.transferFrom(owner, feesCollector.address, web3.utils.toWei("100000", 'ether'), { from: owner });

        const ownerBalanceBeforeWithdraw = await asset.balanceOf(owner)
        expect(ownerBalanceBeforeWithdraw).to.be.a.bignumber.equal(web3.utils.toWei("0", "ether"));
        const feesCollectorBalanceBeforeWithDraw = await asset.balanceOf(feesCollector.address);
        expect(feesCollectorBalanceBeforeWithDraw).to.be.a.bignumber.equal(web3.utils.toWei("100000", "ether"));

        await feesCollector.withdraw(
          assetAddress, 
          web3.utils.toWei("100000", 'ether'),
          { from: owner }
      );

      const ownerBalanceAfterWithdraw = await asset.balanceOf(owner)
      expect(ownerBalanceAfterWithdraw).to.be.a.bignumber.equal(web3.utils.toWei("100000", "ether"));
      const feesCollectorBalanceAfterWithdraw = await asset.balanceOf(feesCollector.address);
      expect(feesCollectorBalanceAfterWithdraw).to.be.a.bignumber.equal(web3.utils.toWei("0", "ether"));

      });
    });
  });
  