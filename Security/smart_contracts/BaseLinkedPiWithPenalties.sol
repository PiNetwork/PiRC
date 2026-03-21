// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BaseLinkedPiWithPenalties {
    address public owner;

    // Pi Base per participant/developer
    uint256 public constant BASE_VALUE_USD = 314159; // USD reference
    mapping(address => uint256) public piBalance; // Pi Base units
    mapping(address => uint256) public verifiedTxCount; // Real transactions
    mapping(address => uint256) public reputationScore; // 0-100

    // Events
    event RewardUpdated(address indexed participant, uint256 newBalance, uint256 timestamp);
    event PiTransaction(address indexed participant, uint256 txAmount, uint256 timestamp);
    event RewardSuspended(address indexed participant, uint256 duration, uint256 timestamp);
    event AllocationReduced(address indexed participant, uint256 amount, uint256 timestamp);
    event Slashed(address indexed participant, uint256 amount, uint256 newBalance, uint256 timestamp);
    event PermanentBan(address indexed participant, uint256 timestamp);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can execute");
        _;
    }

    // Register participant/developer
    function registerParticipant(address participant, uint256 initialPi) public onlyOwner {
        piBalance[participant] = initialPi;
        verifiedTxCount[participant] = 0;
        reputationScore[participant] = 100;
        emit RewardUpdated(participant, initialPi, block.timestamp);
    }

    // Record a verified Pi transaction
    function recordTransaction(address participant, uint256 txAmount) public onlyOwner {
        require(txAmount > 0, "Transaction must be positive");
        verifiedTxCount[participant] += txAmount;
        emit PiTransaction(participant, txAmount, block.timestamp);
    }

    // Calculate current Pi value (dynamic incentives based on real transactions)
    function calculateValue(address participant, uint256 totalTxThreshold) public view returns (uint256) {
        uint256 multiplier = 1e18 + (verifiedTxCount[participant] * 1e18 / totalTxThreshold);
        return piBalance[participant] * multiplier / 1e18;
    }

    // Update reward based on new verified transactions
    function updateReward(address participant, uint256 totalTxThreshold) public onlyOwner {
        uint256 newValue = calculateValue(participant, totalTxThreshold);
        piBalance[participant] = newValue;
        emit RewardUpdated(participant, newValue, block.timestamp);
    }

    // 1️⃣ Reward Suspension
    function suspendReward(address participant, uint256 durationInDays) public onlyOwner {
        emit RewardSuspended(participant, durationInDays, block.timestamp);
        // Placeholder: actual suspension logic can tie to milestone releases
    }

    // 2️⃣ Allocation Reduction
    function reduceAllocation(address participant, uint256 amount) public onlyOwner {
        require(amount <= piBalance[participant], "Amount exceeds balance");
        piBalance[participant] -= amount;

        // Reduce reputation proportionally
        uint256 repReduction = amount * 100 / piBalance[participant];
        if(repReduction > reputationScore[participant]) {
            reputationScore[participant] = 0;
        } else {
            reputationScore[participant] -= repReduction;
        }

        emit AllocationReduced(participant, amount, block.timestamp);
    }

    // 3️⃣ Slashing
    function slash(address participant, uint256 percent) public onlyOwner {
        require(percent <= 100, "Percent cannot exceed 100");
        uint256 amount = piBalance[participant] * percent / 100;
        piBalance[participant] -= amount;

        // Reduce reputation
        if(percent >= 50) {
            reputationScore[participant] = 0;
        } else {
            uint256 repReduction = reputationScore[participant] * percent / 100;
            reputationScore[participant] -= repReduction;
        }

        emit Slashed(participant, amount, piBalance[participant], block.timestamp);
    }

    // 4️⃣ Permanent Ecosystem Ban
    function permanentBan(address participant) public onlyOwner {
        piBalance[participant] = 0;
        verifiedTxCount[participant] = 0;
        reputationScore[participant] = 0;
        emit PermanentBan(participant, block.timestamp);
    }

    // View participant status
    function getParticipantStatus(address participant) public view returns (uint256 balance, uint256 txCount, uint256 reputation) {
        return (piBalance[participant], verifiedTxCount[participant], reputationScore[participant]);
    }
}
