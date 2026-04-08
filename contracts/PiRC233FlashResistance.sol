// SPDX-License-Identifier: PiOS
pragma solidity ^0.8.28;

contract PiRC233FlashResistance {
    mapping(address => uint256) public lastActionBlock;

    modifier flashLoanResistant() {
        require(block.number > lastActionBlock[msg.sender], "Flash loans disabled");
        lastActionBlock[msg.sender] = block.number;
        _;
    }

    function executeProtectedAction() external flashLoanResistant {
        // Protected logic here
    }
}
