// SPDX-License-Identifier: PiOS
pragma solidity ^0.8.28;

import "./PiRC207RegistryLayer.sol";

contract PiRC254CircuitBreaker {
    PiRC207RegistryLayer public registry;
    bool public isGlobalPauseActive;
    address public emergencyAdmin;

    event GlobalPauseTriggered(string reason);
    event GlobalPauseLifted();

    constructor(address _registry, address _admin) {
        registry = PiRC207RegistryLayer(_registry);
        emergencyAdmin = _admin;
    }

    modifier whenNotPaused() {
        require(!isGlobalPauseActive, "System is paused");
        _;
    }

    function triggerCircuitBreaker() external {
        // Can be triggered by admin or automatically if parity fails
        require(msg.sender == emergencyAdmin || !registry.checkParityInvariant(), "Unauthorized or Parity intact");
        isGlobalPauseActive = true;
        emit GlobalPauseTriggered("Parity Failure or Admin Trigger");
    }

    function liftCircuitBreaker() external {
        require(msg.sender == emergencyAdmin, "Only admin");
        require(registry.checkParityInvariant(), "Parity must be restored first");
        isGlobalPauseActive = false;
        emit GlobalPauseLifted();
    }
}
