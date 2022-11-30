// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./ILendingPoolAAVE2.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

/**
 * @title HelloDefiAAVE2
 * @dev This smart contract interacts with AAVE protocol v2
 */
contract HelloDefiAAVE2 {
    ILendingPoolAAVE2 private _aaveLendingPool;

    // mapping to keep track of the user's balance: user's adress => (asset address => asset qty).
    mapping(address => mapping(address => uint256)) public balances;

    constructor(address aaveILendingPoolAddress) {
        _aaveLendingPool = ILendingPoolAAVE2(aaveILendingPoolAddress);
    }

    /**
     * @dev Deposits an `amount` of underlying asset into AAVE in behalf of the user, receiving in return overlying aTokens in the smart contract.
     * - E.g. User deposits 100 USDC to the SC and the SC will deposit into AAVE 100 USDC to get in return 100 aUSDC (received into the SC).
     * Before calling this function, it requires the user to approve this smart contract to spend his asset.
     * @param _asset The address of the underlying asset to deposit.
     * @param _amount The amount to be deposited.
     **/
    function deposit(address _asset, uint256 _amount) external {
        // Transfers the asset from user's wallet to this smart contract
        if (!IERC20(_asset).transferFrom(msg.sender, address(this), _amount)) {
            revert("Error transfer from user to smart contract");
        }

        // Approval to allow aave to spend the user's asset
        if (!IERC20(_asset).approve(address(_aaveLendingPool), _amount)) {
            revert("Error smart contract approval");
        }

        // keep track of the user's balance
        balances[msg.sender][_asset] += _amount;
        // This smart contract deposits to AAVE in behalf of the user
        _aaveLendingPool.deposit(_asset, _amount, address(this), 0);
    }

    function withdraw(
        address _asset,
        address _to,
        uint256 _amount
    ) external {
        // This smart contract withdraw from AAVE in behalf of the user
        _aaveLendingPool.withdraw(_asset, _amount, address(this));

        // Approval to allow aave to send the user's asset
        if (!IERC20(_asset).approve(address(this), _amount)) {
            revert("Error user approval");
        }
        // keep track of the user's balance
        balances[msg.sender][_asset] -= _amount;

        //Transfers the asset from this smart contract to user's wallet
        if (!IERC20(_asset).transferFrom(address(this), _to, _amount)) {
            revert("Error transfer from smart contract to user");
        }
    }
}
