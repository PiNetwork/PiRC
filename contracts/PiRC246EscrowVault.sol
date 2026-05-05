// SPDX-License-Identifier: PiOS
pragma solidity ^0.8.28;
import "./PiRC_7Layers_Config.sol";

import "./PiRC228JusticeEngine.sol";

contract PiRC246EscrowVault {
    PiRC228JusticeEngine public justiceEngine;

    struct Escrow {
        address buyer;
        address seller;
        uint256 amount;
        uint256 releaseTime;
        bool isCompleted;
    }

    mapping(uint256 => Escrow) public escrows;
    uint256 public escrowCounter;

    event EscrowCreated(uint256 indexed id, address buyer, address seller, uint256 amount);
    event EscrowReleased(uint256 indexed id);

    constructor(address _justiceEngine) {
        justiceEngine = PiRC228JusticeEngine(_justiceEngine);
    }

    function createEscrow(address seller, uint256 releaseTime) external payable {
        uint256 id = escrowCounter++;
        escrows[id] = Escrow(msg.sender, seller, msg.value, releaseTime, false);
        emit EscrowCreated(id, msg.sender, seller, msg.value);
    }

    function releaseEscrow(uint256 id) external {
        Escrow storage escrow = escrows[id];
        require(!escrow.isCompleted, "Already completed");
        require(block.timestamp >= escrow.releaseTime || msg.sender == escrow.buyer, "Cannot release yet");

        escrow.isCompleted = true;
        payable(escrow.seller).transfer(escrow.amount);
        emit EscrowReleased(id);
    }
}
