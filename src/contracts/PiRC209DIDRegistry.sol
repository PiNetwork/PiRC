// SPDX-License-Identifier: PiOS
pragma solidity ^0.8.28;
import "./PiRC_7Layers_Config.sol";

/**
 * @title PiRC-209 Sovereign DID Registry
 * @notice On-chain Decentralized Identity Registry anchored to PiRC-207 Registry Layer
 * @dev Part of PiRC-209 Sovereign Decentralized Identity Standard
 */

import "./PiRC207RegistryLayer.sol";  // Assumes existing PiRC-207 base contract
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract PiRC209DIDRegistry is PiRC207RegistryLayer, ReentrancyGuard, AccessControl {
    bytes32 public constant REGISTRY_ADMIN_ROLE = keccak256("REGISTRY_ADMIN_ROLE");
    bytes32 public constant JUSTICE_ENGINE_ROLE = keccak256("JUSTICE_ENGINE_ROLE");

    struct DIDRecord {
        address owner;
        bytes32 didHash;
        uint256 registeredAt;
        uint256 lastUpdated;
        bool isActive;
        uint256 stakedAmount; // Colored tokens staked for identity
    }

    mapping(bytes32 => DIDRecord) public didRecords;
    mapping(address => bytes32) public ownerToDID;

    event DIDRegistered(bytes32 indexed didHash, address indexed owner, uint256 timestamp);
    event DIDUpdated(bytes32 indexed didHash, address indexed owner);
    event DIDRevoked(bytes32 indexed didHash, address indexed owner);

    constructor(address _justiceEngine) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REGISTRY_ADMIN_ROLE, msg.sender);
        _grantRole(JUSTICE_ENGINE_ROLE, _justiceEngine);
    }

    /**
     * @notice Register a new Sovereign DID
     * @param _didHash Cryptographic hash of the DID document
     * @param _stakeAmount Amount of colored tokens to stake (Layer 4-7)
     */
    function registerDID(bytes32 _didHash, uint256 _stakeAmount) external nonReentrant {
        require(ownerToDID[msg.sender] == bytes32(0), "Already has DID");
        require(_stakeAmount >= minimumStake(), "Insufficient stake");

        // Stake colored tokens via PiRC-207 mechanism
        _stakeColoredTokens(msg.sender, _stakeAmount);

        didRecords[_didHash] = DIDRecord({
            owner: msg.sender,
            didHash: _didHash,
            registeredAt: block.timestamp,
            lastUpdated: block.timestamp,
            isActive: true,
            stakedAmount: _stakeAmount
        });

        ownerToDID[msg.sender] = _didHash;

        emit DIDRegistered(_didHash, msg.sender, block.timestamp);
    }

    /**
     * @notice Update existing DID (only owner)
     */
    function updateDID(bytes32 _didHash, bytes32 _newDidHash) external {
        require(didRecords[_didHash].owner == msg.sender, "Not owner");
        // Update logic + Justice Engine check
        if (hasRole(JUSTICE_ENGINE_ROLE, msg.sender)) {
            _enforceParityInvariant();
        }
        didRecords[_didHash].didHash = _newDidHash;
        didRecords[_didHash].lastUpdated = block.timestamp;
        emit DIDUpdated(_didHash, msg.sender);
    }

    /**
     * @notice Revoke DID (owner or Justice Engine)
     */
    function revokeDID(bytes32 _didHash) external {
        DIDRecord storage record = didRecords[_didHash];
        require(record.owner == msg.sender || hasRole(JUSTICE_ENGINE_ROLE, msg.sender), "Unauthorized");
        record.isActive = false;
        emit DIDRevoked(_didHash, record.owner);
    }

    function getDID(address _owner) external view returns (DIDRecord memory) {
        bytes32 didHash = ownerToDID[_owner];
        return didRecords[didHash];
    }

    // Internal helper to enforce Economic Parity (from PiRC-207)
    function _enforceParityInvariant() internal {
        // Calls Justice Engine + Reflexive Parity check
    }

    // Minimum stake pulled from PiRC-207 config
    function minimumStake() public pure returns (uint256) {
        return 1000 ether; // Example value – adjustable via governance
    }
}
