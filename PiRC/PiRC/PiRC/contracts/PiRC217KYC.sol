// SPDX-License-Identifier: PiOS
pragma solidity ^0.8.28;
import "./PiRC_7Layers_Config.sol";

import "./PiRC209DIDRegistry.sol";
import "./PiRC207RegistryLayer.sol";

contract PiRC217KYC {
    PiRC209DIDRegistry public didRegistry;
    PiRC207RegistryLayer public registry;

    mapping(address => bool) public isVerified;
    mapping(address => uint256) public verificationTimestamp;

    event UserVerified(address user, bool status);

    constructor(address _didRegistry, address _registry) {
        didRegistry = PiRC209DIDRegistry(_didRegistry);
        registry = PiRC207RegistryLayer(_registry);
    }

    function verifyUser(address user) external {
        require(didRegistry.getDID(user).isActive, "DID not active");
        require(registry.checkParityInvariant(), "Parity violation");
        isVerified[user] = true;
        verificationTimestamp[user] = block.timestamp;
        emit UserVerified(user, true);
    }

    function isKYCVerified(address user) external view returns (bool) {
        return isVerified[user];
    }
}
