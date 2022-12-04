// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "../../contracts/PriceFeedConsumer.sol";

contract MockPriceFeedConsumer is IPriceFeedConsumer {
    uint256 private _answer;

    constructor(uint256 answer) {
        _answer = answer;
    }

    function getLatestPrice(address _asset) virtual public override view returns (uint256) {
        return _answer;
    }

    function setAnswer(uint256 answer) external {
        _answer = answer;
    }
}
