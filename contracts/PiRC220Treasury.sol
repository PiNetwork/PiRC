// SPDX-License-Identifier: PiOS
pragma solidity ^0.8.28;
import "./PiRC_7Layers_Config.sol";

import "./PiRC212Governance.sol";

contract PiRC220Treasury {
    PiRC212Governance public governance;

    mapping(address => uint256) public allocatedFunds;

    event FundsAllocated(address recipient, uint256 amount);
    event FundsReleased(address recipient, uint256 amount);

    constructor(address _governance) {
        governance = PiRC212Governance(_governance);
    }

    function allocateFunds(address recipient, uint256 amount) external {
        require(governance.proposals(0).executed, "Governance approval required");
        allocatedFunds[recipient] = amount;
        emit FundsAllocated(recipient, amount);
    }

    function releaseFunds(address recipient) external {
        uint256 amount = allocatedFunds[recipient];
        require(amount > 0, "No funds allocated");
        allocatedFunds[recipient] = 0;
        emit FundsReleased(recipient, amount);
    }
}
