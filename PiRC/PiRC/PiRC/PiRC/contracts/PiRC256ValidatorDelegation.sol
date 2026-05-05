// SPDX-License-Identifier: PiOS
pragma solidity ^0.8.28;
import "./PiRC_7Layers_Config.sol";

import "./PiRC228JusticeEngine.sol";

contract PiRC256ValidatorDelegation {
    PiRC228JusticeEngine public justiceEngine;

    mapping(address => uint256) public validatorStakes;
    mapping(address => mapping(address => uint256)) public delegations;

    event Delegated(address indexed delegator, address indexed validator, uint256 amount);
    event Slashed(address indexed validator, uint256 amount);

    constructor(address _justiceEngine) {
        justiceEngine = PiRC228JusticeEngine(_justiceEngine);
    }

    function delegate(address validator, uint256 amount) external {
        delegations[msg.sender][validator] += amount;
        validatorStakes[validator] += amount;
        emit Delegated(msg.sender, validator, amount);
    }

    function executeSlash(address validator, uint256 amount) external {
        require(justiceEngine.isApproved(msg.sender), "Only Justice Engine");
        require(validatorStakes[validator] >= amount, "Insufficient stake to slash");
        
        validatorStakes[validator] -= amount;
        emit Slashed(validator, amount);
    }
}
