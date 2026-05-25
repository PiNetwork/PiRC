// SPDX-License-Identifier: PiOS
pragma solidity ^0.8.28;
import "./PiRC_7Layers_Config.sol";

import "./PiRC237AIOracle.sol";

contract PiRC238PredictiveRisk {
    PiRC237AIOracle public aiOracle;
    
    uint256 public constant BASE_COLLATERAL_RATIO = 15000; // 150%

    event CollateralRatioAdjusted(string asset, uint256 newRatio);

    constructor(address _aiOracle) {
        aiOracle = PiRC237AIOracle(_aiOracle);
    }

    function getDynamicCollateralRatio(string memory asset) public view returns (uint256) {
        (uint256 volatility, , , ) = aiOracle.aiFeeds(asset);
        
        // If volatility is high, increase collateral requirement
        if (volatility > 5000) { // arbitrary high volatility threshold
            return BASE_COLLATERAL_RATIO + 5000; // 200%
        }
        
        return BASE_COLLATERAL_RATIO;
    }
}
