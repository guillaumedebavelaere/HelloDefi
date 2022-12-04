// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "../../contracts/ILendingPoolAAVE2.sol";

contract MockLendingPoolAAVE2 is ILendingPoolAAVE2 {
    function deposit(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external override {
        // nothing to do, it is just a mock
    }

    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external override returns (uint256) {
        // nothing to do, it is just a mock
        return 1;
    }
}
