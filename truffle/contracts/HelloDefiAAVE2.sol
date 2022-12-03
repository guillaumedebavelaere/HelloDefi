// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./ILendingPoolAAVE2.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @title HelloDefiAAVE2
 * @dev This smart contract interacts with AAVE protocol v2.
 * @dev It is created as a clone from the HelloDefiAAVE2Factory.
 */
contract HelloDefiAAVE2 is Ownable, Initializable {
    ILendingPoolAAVE2 private _aaveLendingPool;

    // mapping to keep track of the user's balance: asset address => asset qty
    mapping(address => uint256) public balances;

    /**
     * @dev As HelloDefiAAVE2 is used as a Clone, there is no constructor.
     * @dev Call this function to initialize the clone instead.
     */
    function initialize(address aaveILendingPoolAddress, address _user)
        external
        initializer
    {
        _aaveLendingPool = ILendingPoolAAVE2(aaveILendingPoolAddress);
        _transferOwnership(_user);
    }

    /**
     * @dev Deposits an `amount` of underlying asset into AAVE in behalf of the user, receiving in return overlying aTokens in the smart contract.
     * - E.g. User deposits 100 USDC to the SC and the SC will deposit into AAVE 100 USDC to get in return 100 aUSDC (received into the SC).
     * Before calling this function, it requires the user to approve this smart contract to spend his asset.
     * @param _asset The address of the underlying asset to deposit.
     * @param _amount The amount to be deposited.
     **/
    function deposit(address _asset, uint256 _amount) external onlyOwner {
        require(_amount > 0, "_amount must be > 0!");

        // Transfers the asset from user's wallet to this smart contract
        IERC20(_asset).transferFrom(msg.sender, address(this), _amount);

        // Approval to allow aave to spend the user's asset
        IERC20(_asset).approve(address(_aaveLendingPool), _amount);

        // keep track of the asset balance
        balances[_asset] += _amount;

        // This smart contract deposits to AAVE in behalf of the user
        _aaveLendingPool.deposit(_asset, _amount, address(this), 0);
    }

    /**
     * @dev Withdraws an `amount` of underlying _asset from the AAVE reserve, burning the equivalent aTokens owned by the smart contract
     * E.g. Smart contract has 100 aUSDC, calls withdraw() and receives 100 USDC, burning the 100 aUSDC. 100 USDC are then returned to the user (msg.sender)
     * @param _asset The address of the underlying asset to withdraw
     * @param _amount The underlying amount to be withdrawn
     **/
    function withdraw(address _asset, uint256 _amount) external onlyOwner {
        require(_amount > 0, "_amount must be > 0!");
        require(_amount <= balances[_asset], "Insufficiant balance");

        // This smart contract withdraw from AAVE in behalf of the user
        _aaveLendingPool.withdraw(_asset, _amount, address(this));

        // Approval to allow aave to spend this smart contract asset
        IERC20(_asset).approve(address(this), _amount);
            
        // keep track of the asset's balance
        balances[_asset] -= _amount;

        //Transfers the asset from this smart contract to user's wallet
        IERC20(_asset).transferFrom(address(this), msg.sender, _amount);
    }
}
