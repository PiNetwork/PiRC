// SPDX-License-Identifier: PiOS
pragma solidity ^0.8.28;

contract PiRC236InterestRates {
    uint256 public constant OPTIMAL_UTILIZATION = 8000; // 80%
    uint256 public constant BASE_RATE = 200; // 2%
    uint256 public constant SLOPE_1 = 400; // 4%
    uint256 public constant SLOPE_2 = 7500; // 75%

    function calculateInterestRate(uint256 totalBorrowed, uint256 totalLiquidity) external pure returns (uint256) {
        if (totalLiquidity == 0) return BASE_RATE;
        
        uint256 utilization = (totalBorrowed * 10000) / totalLiquidity;
        
        if (utilization <= OPTIMAL_UTILIZATION) {
            return BASE_RATE + ((utilization * SLOPE_1) / OPTIMAL_UTILIZATION);
        } else {
            uint256 excessUtilization = utilization - OPTIMAL_UTILIZATION;
            return BASE_RATE + SLOPE_1 + ((excessUtilization * SLOPE_2) / (10000 - OPTIMAL_UTILIZATION));
        }
    }
}
