// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PenaltiesAndSlashing {
    address public owner;

    // Track developer/project allocations
    mapping(address => uint256) public developerAllocation;

    // Track reputation score (0-100)
    mapping(address => uint256) public reputationScore;

    // Events for transparency
    event RewardSuspended(address indexed developer, uint256 duration, uint256 timestamp);
    event AllocationReduced(address indexed developer, uint256 amount, uint256 timestamp);
    event Slashed(address indexed developer, uint256 amount, uint256 newAllocation, uint256 timestamp);
    event PermanentBan(address indexed developer, uint256 timestamp);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can execute");
        _;
    }

    // Initialize developer allocation & reputation
    function registerDeveloper(address dev, uint256 allocation) public onlyOwner {
        developerAllocation[dev] = allocation;
        reputationScore[dev] = 100;
    }

    // Reward Suspension
    function suspendReward(address dev, uint256 durationInDays) public onlyOwner {
        emit RewardSuspended(dev, durationInDays, block.timestamp);
        // Implementation placeholder: actual suspension logic can be tied to milestone release
    }

    // Allocation Reduction
    function reduceAllocation(address dev, uint256 amount) public onlyOwner {
        require(amount <= developerAllocation[dev], "Amount exceeds allocation");
        developerAllocation[dev] -= amount;

        // Reduce reputation proportionally
        uint256 repReduction = amount * 100 / developerAllocation[dev]; 
        if(repReduction > reputationScore[dev]) {
            reputationScore[dev] = 0;
        } else {
            reputationScore[dev] -= repReduction;
        }

        emit AllocationReduced(dev, amount, block.timestamp);
    }

    // Slashing
    function slash(address dev, uint256 percent) public onlyOwner {
        require(percent <= 100, "Percent cannot exceed 100");
        uint256 amount = developerAllocation[dev] * percent / 100;
        developerAllocation[dev] -= amount;

        // Reduce reputation
        if(percent >= 50) {
            reputationScore[dev] = 0; // Major fraud or repeated violations
        } else {
            uint256 repReduction = reputationScore[dev] * percent / 100;
            reputationScore[dev] -= repReduction;
        }

        emit Slashed(dev, amount, developerAllocation[dev], block.timestamp);
    }

    // Permanent Ecosystem Ban
    function permanentBan(address dev) public onlyOwner {
        developerAllocation[dev] = 0;
        reputationScore[dev] = 0;

        emit PermanentBan(dev, block.timestamp);
    }

    // View developer status
    function getDeveloperStatus(address dev) public view returns (uint256 allocation, uint256 reputation) {
        return (developerAllocation[dev], reputationScore[dev]);
    }
}
