// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProfitAllocation {
    address public owner;
    uint256 public totalProfit;

    mapping(address => uint256) public liquidityAllocation;
    mapping(address => uint256) public developerAllocation;
    mapping(address => uint256) public reserveAllocation;

    // Event to log each distribution
    event ProfitDistributed(
        uint256 totalProfit,
        uint256 liquidity,
        uint256 developers,
        uint256 reserve,
        uint256 timestamp
    );

    constructor() {
        owner = msg.sender;
    }

    function distributeProfit(uint256 profit) public {
        require(msg.sender == owner, "Only owner can distribute");
        totalProfit += profit;

        uint256 liquidity = (profit * 65) / 100;
        uint256 developers = (profit * 20) / 100;
        uint256 reserve = (profit * 15) / 100;

        // Example: assign to owner addresses (placeholder)
        liquidityAllocation[owner] += liquidity;
        developerAllocation[owner] += developers;
        reserveAllocation[owner] += reserve;

        // Emit event for transparency
        emit ProfitDistributed(profit, liquidity, developers, reserve, block.timestamp);
    }
}
