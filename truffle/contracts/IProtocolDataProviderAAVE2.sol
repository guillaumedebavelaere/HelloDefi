// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

/**
 * @dev AAVE2 interface to get the aToken balance from the underlying assset
 */
interface IProtocolDataProviderAAVE2 {

    /**
     * @dev Returns the user's reserve data for asset.    
     */
    function getUserReserveData(address asset, address user)
        external
        view
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
        );
}
