// SPDX-License-Identifier: PiOS
pragma solidity ^0.8.28;

/**
 * @title PiRC-212 Sovereign Governance & Decentralized Proposal Execution
 * @notice On-chain governance system anchored to PiRC-207 Registry Layer
 */

import "./PiRC207RegistryLayer.sol";
import "./PiRC209DIDRegistry.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PiRC212Governance is ReentrancyGuard {
    PiRC207RegistryLayer public registry;
    PiRC209DIDRegistry public didRegistry;

    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
        bool canceled;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    uint256 public proposalCount;
    uint256 public constant QUORUM = 5 * 10**25; // 5% of total supply example

    event ProposalCreated(uint256 id, address proposer, string title);
    event Voted(uint256 proposalId, address voter, bool support);
    event ProposalExecuted(uint256 proposalId);

    constructor(address _registry, address _didRegistry) {
        registry = PiRC207RegistryLayer(_registry);
        didRegistry = PiRC209DIDRegistry(_didRegistry);
    }

    function createProposal(string memory title, string memory description, uint256 votingDays) external returns (uint256) {
        uint256 proposalId = proposalCount++;
        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            title: title,
            description: description,
            startTime: block.timestamp,
            endTime: block.timestamp + (votingDays * 1 days),
            forVotes: 0,
            againstVotes: 0,
            executed: false,
            canceled: false
        });

        emit ProposalCreated(proposalId, msg.sender, title);
        return proposalId;
    }

    function vote(uint256 proposalId, bool support) external nonReentrant {
        Proposal storage p = proposals[proposalId];
        require(block.timestamp < p.endTime, "Voting ended");
        require(!hasVoted[proposalId][msg.sender], "Already voted");

        // Weight = 7-Layer tokens + DID reputation (simplified)
        uint256 votingPower = registry.getVotingPower(msg.sender);

        if (support) {
            p.forVotes += votingPower;
        } else {
            p.againstVotes += votingPower;
        }

        hasVoted[proposalId][msg.sender] = true;
        emit Voted(proposalId, msg.sender, support);
    }

    function executeProposal(uint256 proposalId) external nonReentrant {
        Proposal storage p = proposals[proposalId];
        require(block.timestamp > p.endTime, "Voting not ended");
        require(!p.executed, "Already executed");
        require(p.forVotes > p.againstVotes && p.forVotes >= QUORUM, "Quorum or majority not met");

        // Justice Engine check (Economic Parity)
        require(registry.checkParityInvariant(), "Parity violation");

        p.executed = true;
        emit ProposalExecuted(proposalId);

        // Here you can call any executable action (upgrade, parameter change, etc.)
    }
}
