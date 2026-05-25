// SPDX-License-Identifier: PiOS
pragma solidity ^0.8.28;
import "./PiRC_7Layers_Config.sol";

contract PiRC253GrantDistribution {
    struct Grant {
        address recipient;
        uint256 totalAmount;
        uint256 releasedAmount;
        uint256 milestoneCount;
        uint256 currentMilestone;
    }

    mapping(uint256 => Grant) public grants;
    uint256 public grantCounter;

    event GrantCreated(uint256 indexed grantId, address recipient, uint256 amount);
    event MilestoneUnlocked(uint256 indexed grantId, uint256 amount);

    function createGrant(address recipient, uint256 amount, uint256 milestones) external {
        // Governance only
        uint256 id = grantCounter++;
        grants[id] = Grant(recipient, amount, 0, milestones, 0);
        emit GrantCreated(id, recipient, amount);
    }

    function unlockMilestone(uint256 grantId) external {
        // Triggered by KPI Oracle or Governance
        Grant storage g = grants[grantId];
        require(g.currentMilestone < g.milestoneCount, "All milestones unlocked");
        
        uint256 releaseAmount = g.totalAmount / g.milestoneCount;
        g.releasedAmount += releaseAmount;
        g.currentMilestone++;
        
        // Transfer funds to recipient
        emit MilestoneUnlocked(grantId, releaseAmount);
    }
}
