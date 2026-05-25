// SPDX-License-Identifier: PiOS
pragma solidity ^0.8.28;
import "./PiRC_7Layers_Config.sol";

import "./PiRC207RegistryLayer.sol";

contract PiRC231Lending {
    PiRC207RegistryLayer public registry;
    mapping(address => uint256) public collateral;
    mapping(address => uint256) public debt;

    event Deposited(address indexed user, uint256 amount);
    event Borrowed(address indexed user, uint256 amount);

    constructor(address _registry) {
        registry = PiRC207RegistryLayer(_registry);
    }

    function deposit(uint256 amount) external {
        require(registry.checkParityInvariant(), "Parity violation");
        collateral[msg.sender] += amount;
        emit Deposited(msg.sender, amount);
    }

    function borrow(uint256 amount) external {
        require(registry.checkParityInvariant(), "Parity violation");
        require(collateral[msg.sender] >= amount * 2, "Insufficient collateral"); // 200% ratio
        debt[msg.sender] += amount;
        emit Borrowed(msg.sender, amount);
    }
}
