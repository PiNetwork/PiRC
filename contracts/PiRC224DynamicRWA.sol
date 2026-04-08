// SPDX-License-Identifier: PiOS
pragma solidity ^0.8.28;

contract PiRC224DynamicRWA {
    struct AssetMetadata {
        uint256 appraisalValue;
        uint256 lastUpdate;
    }
    mapping(uint256 => AssetMetadata) public assets;

    function updateMetadata(uint256 tokenId, uint256 newValue) external {
        assets[tokenId] = AssetMetadata(newValue, block.timestamp);
    }
}
