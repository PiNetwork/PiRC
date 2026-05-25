// SPDX-License-Identifier: PiOS
pragma solidity ^0.8.28;
import "./PiRC_7Layers_Config.sol";

import "./PiRC214Oracle.sol";

contract PiRC234SyntheticRWA {
    PiRC214Oracle public oracle;
    mapping(address => uint256) public syntheticBalance;

    event SyntheticMinted(address indexed user, uint256 amount, string asset);

    constructor(address _oracle) {
        oracle = PiRC214Oracle(_oracle);
    }

    function mintSynthetic(string memory asset, uint256 collateralAmount) external {
        uint256 assetPrice = oracle.getPrice(asset);
        require(assetPrice > 0, "Invalid oracle price");
        
        uint256 syntheticAmount = (collateralAmount * 1e18) / assetPrice;
        syntheticBalance[msg.sender] += syntheticAmount;
        
        emit SyntheticMinted(msg.sender, syntheticAmount, asset);
    }
}
