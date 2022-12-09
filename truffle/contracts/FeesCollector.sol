// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @dev FeesCollector is the smart contract to collect the fees from user's HelloDefiAAVE2 deposits and withdraws
 */
contract FeesCollector is Ownable {
    using SafeERC20 for IERC20;

    function withdraw(address _asset, uint256 _amount) external onlyOwner {
        require(_amount > 0, "_amount must be > 0!");

        //Transfer funds from this smart contract to the user
        IERC20(_asset).safeTransfer(msg.sender, _amount);
    }
}
