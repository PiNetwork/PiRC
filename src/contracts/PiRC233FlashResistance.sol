// SPDX-License-Identifier: PiOS
pragma solidity ^0.8.28;
import "./PiRC_7Layers_Config.sol";

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
