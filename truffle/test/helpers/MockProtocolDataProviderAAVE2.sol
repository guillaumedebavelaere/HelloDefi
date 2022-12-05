// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "../../contracts/IProtocolDataProviderAAVE2.sol";

contract MockProtocolDataProviderAAVE2 is IProtocolDataProviderAAVE2 {
    uint256 private _mockedBalance;

    constructor(uint256 _balance) {
        _mockedBalance = _balance;
    }

    function getUserReserveData(address asset, address user)
        external
        view
        override
        returns (
            uint256 currentATokenBalance,
            uint256 currentStableDebt,
            uint256 currentVariableDebt,
            uint256 principalStableDebt,
            uint256 scaledVariableDebt,
            uint256 stableBorrowRate,
            uint256 liquidityRate,
            uint40 stableRateLastUpdated,
            bool usageAsCollateralEnabled
        )
    {
        return (_mockedBalance, 0, 0, 0, 0, 0, 0, 0, false);
    }

    function setMockedBalance(uint256 _balance) external {
        _mockedBalance = _balance;
    }
}
