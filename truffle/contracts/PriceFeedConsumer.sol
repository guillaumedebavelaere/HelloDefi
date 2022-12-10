// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/interfaces/IERC20Metadata.sol";

interface IPriceFeedConsumer {
    function getLatestPrice(address _asset) external view returns (uint256);
}

/**
 * For now it supports manual added asset because feed registry (https://docs.chain.link/data-feeds/feed-registry)
 * is not available on testnet.
 * TODO: handle multiple assets
 */
contract PriceFeedConsumer is IPriceFeedConsumer {
    AggregatorV3Interface internal priceFeedDai;
    AggregatorV3Interface internal priceFeedLink;

    constructor(address _aggregatorAddressDai, address _aggregatorAddressLink) {
        priceFeedDai = AggregatorV3Interface(_aggregatorAddressDai);
        priceFeedLink = AggregatorV3Interface(_aggregatorAddressLink);
    }

    /**
     * Returns the latest price
     */
    function getLatestPrice(address _asset) override public view returns (uint256) {
        AggregatorV3Interface priceFeed = priceFeedDai;
        if (_asset == address(0x75Ab5AB1Eef154C0352Fc31D2428Cef80C7F8B33)) {
            priceFeed = priceFeedDai;
        } else {
            priceFeed = priceFeedLink;
        }
        
        (
            ,
            int256 price,
            ,
            ,
        ) = priceFeed.latestRoundData();
        if (priceFeed.decimals() < IERC20Metadata(_asset).decimals()) {
            uint256 decimalsToAdd = 10**IERC20Metadata(_asset).decimals() / 10**priceFeed.decimals();
            return uint256(price) * decimalsToAdd;
        }
        return uint256(price);
    }
}
