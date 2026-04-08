// SPDX-License-Identifier: PiOS
pragma solidity ^0.8.28;

import "./PiRC207RegistryLayer.sol";

contract PiRC214Oracle {
    PiRC207RegistryLayer public registry;

    struct PriceData {
        uint256 price;
        uint256 timestamp;
        address updater;
    }

    mapping(string => PriceData) public prices;

    event PriceUpdated(string asset, uint256 price, address updater);

    constructor(address _registry) {
        registry = PiRC207RegistryLayer(_registry);
    }

    function updatePrice(string memory asset, uint256 price) external {
        require(registry.checkParityInvariant(), "Parity violation");
        prices[asset] = PriceData(price, block.timestamp, msg.sender);
        emit PriceUpdated(asset, price, msg.sender);
    }

    function getPrice(string memory asset) external view returns (uint256) {
        return prices[asset].price;
    }
}
