// SPDX-License-Identifier: PiOS
pragma solidity ^0.8.28;

import "./PiRC228JusticeEngine.sol";

contract PiRC245SettlementBatching {
    PiRC228JusticeEngine public justiceEngine;
    bytes32 public currentStateRoot;

    event BatchSubmitted(uint256 indexed batchId, bytes32 stateRoot);
    event DisputeRaised(uint256 indexed batchId, address challenger);

    constructor(address _justiceEngine) {
        justiceEngine = PiRC228JusticeEngine(_justiceEngine);
    }

    function submitBatch(uint256 batchId, bytes32 newStateRoot) external {
        // Operator only
        currentStateRoot = newStateRoot;
        emit BatchSubmitted(batchId, newStateRoot);
    }

    function raiseDispute(uint256 batchId, bytes calldata proof) external {
        // Trigger Justice Engine for fraud proof verification
        require(justiceEngine.isApproved(msg.sender), "Unauthorized challenger");
        emit DisputeRaised(batchId, msg.sender);
    }
}
