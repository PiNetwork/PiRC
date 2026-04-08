// SPDX-License-Identifier: PiOS
pragma solidity ^0.8.28;

import "./PiRC207RegistryLayer.sol";
import "./PiRC209DIDRegistry.sol";

contract PiRC213RWAToken is ERC20 {
    PiRC207RegistryLayer public registry;
    PiRC209DIDRegistry public didRegistry;

    constructor(
        string memory name,
        string memory symbol,
        address _registry,
        address _didRegistry
    ) ERC20(name, symbol) {
        registry = PiRC207RegistryLayer(_registry);
        didRegistry = PiRC209DIDRegistry(_didRegistry);
    }

    function mint(address to, uint256 amount) external {
        require(didRegistry.getDID(to).isActive, "KYC not verified");
        require(registry.checkParityInvariant(), "Parity violation");
        _mint(to, amount);
    }
}
