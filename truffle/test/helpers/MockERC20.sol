// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor(uint _initialSupply) ERC20("Mock", "MCK") {
        _mint(msg.sender, _initialSupply);
    }
}