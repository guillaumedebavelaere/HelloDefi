// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./ILendingPoolAAVE2.sol";
import "./HelloDefiAAVE2.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

/**
 * @title HelloDefiAAVE2Factory
 * @dev This smart contract creates and keep track of the HelloDefiAAVE2 smart contract using the clone pattern in order to save gas.
 */
contract HelloDefiAAVE2Factory {
    address immutable helloDefiAAVE2TemplateAddress;
    address immutable aaveILendingPoolAddress;

    // mapping to keep track of the user smart contracts: user's adress => HelloDefiAAVE2 smart contract.
    mapping(address => address) public userContracts;

    event CloneCreated(address _owner, address _clone);

    constructor(address _aaveILendingPoolAddress) {
        helloDefiAAVE2TemplateAddress = address(new HelloDefiAAVE2());
        aaveILendingPoolAddress = _aaveILendingPoolAddress;
    }

    // Create a clone of HelloDefiAAVE2 contract
    function createClone() external {
        address clone = Clones.clone(helloDefiAAVE2TemplateAddress);
        HelloDefiAAVE2(clone).initialize(aaveILendingPoolAddress, msg.sender);
        userContracts[msg.sender] = clone;
        emit CloneCreated(msg.sender, clone);
    }
}
