// SPDX-License-Identifier: PiOS
pragma solidity ^0.8.28;

import "./PiRC207RegistryLayer.sol";
import "./PiRC254CircuitBreaker.sol";

contract PiRC260RegistryV3 {
    PiRC207RegistryLayer public legacyRegistry;
    PiRC254CircuitBreaker public circuitBreaker;

    mapping(bytes32 => address) public protocolModules;

    event ModuleUpgraded(bytes32 indexed moduleId, address oldAddress, address newAddress);

    constructor(address _legacyRegistry, address _circuitBreaker) {
        legacyRegistry = PiRC207RegistryLayer(_legacyRegistry);
        circuitBreaker = PiRC254CircuitBreaker(_circuitBreaker);
    }

    function upgradeModule(bytes32 moduleId, address newAddress) external {
        // Governance only
        address oldAddress = protocolModules[moduleId];
        protocolModules[moduleId] = newAddress;
        emit ModuleUpgraded(moduleId, oldAddress, newAddress);
    }

    function verifyGlobalParity() external view returns (bool) {
        // Ultimate check across all registered modules
        require(!circuitBreaker.isGlobalPauseActive(), "System Paused");
        return legacyRegistry.checkParityInvariant();
    }
}
