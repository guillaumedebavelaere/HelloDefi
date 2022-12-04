// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/interfaces/IERC20Metadata.sol";

interface IPriceFeedConsumer {
    function getLatestPrice(address _asset) external view returns (uint256);
}

/**
 * For now it supports only one asset feed price
 * TODO: handle multiple assets
 */
contract PriceFeedConsumer is IPriceFeedConsumer {
    AggregatorV3Interface internal priceFeed;

    constructor(address AggregatorAddress) {
        priceFeed = AggregatorV3Interface(AggregatorAddress);
    }

    /**
     * Returns the latest price
     */
    function getLatestPrice(address _asset) override public view returns (uint256) {
        (
            uint80 roundID,
            int256 price,
            uint256 startedAt,
            uint256 timeStamp,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();
        if (priceFeed.decimals() < IERC20Metadata(_asset).decimals()) {
            uint8 decimalsToAdd = IERC20Metadata(_asset).decimals() / priceFeed.decimals();
            return uint256(price) * uint256(decimalsToAdd);
        }
        return uint256(price);
    }
}
