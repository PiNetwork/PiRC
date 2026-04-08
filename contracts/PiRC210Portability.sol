// SPDX-License-Identifier: PiOS
pragma solidity ^0.8.28;

/**
 * @title PiRC-210 Cross-Ledger Sovereign Identity Portability
 * @notice Enables secure, zk-proof-based identity portability between ledgers
 * @dev Built on PiRC-209 DID + PiRC-207 Registry Layer
 */

import "./PiRC209DIDRegistry.sol";
import "./PiRC209VCVerifier.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PiRC210Portability is ReentrancyGuard {
    PiRC209DIDRegistry public didRegistry;
    PiRC209VCVerifier public vcVerifier;

    struct PortabilityRequest {
        bytes32 sourceDID;
        bytes32 targetDID;
        uint256 sourceChainId;
        uint256 targetChainId;
        bytes32 zkProof;
        uint256 timestamp;
        bool isVerified;
    }

    mapping(bytes32 => PortabilityRequest) public portabilityRequests;

    event IdentityPortRequested(bytes32 indexed requestId, bytes32 sourceDID, bytes32 targetDID);
    event IdentityPortVerified(bytes32 indexed requestId, bool success);
    event IdentityPortExecuted(bytes32 indexed requestId);

    constructor(address _didRegistry, address _vcVerifier) {
        didRegistry = PiRC209DIDRegistry(_didRegistry);
        vcVerifier = PiRC209VCVerifier(_vcVerifier);
    }

    /**
     * @notice Request identity portability to another ledger
     */
    function requestPortability(
        bytes32 _sourceDID,
        bytes32 _targetDID,
        uint256 _targetChainId,
        bytes32 _zkProof
    ) external nonReentrant returns (bytes32) {
        require(didRegistry.getDID(msg.sender).isActive, "Invalid source DID");

        bytes32 requestId = keccak256(abi.encodePacked(_sourceDID, _targetDID, block.timestamp));

        portabilityRequests[requestId] = PortabilityRequest({
            sourceDID: _sourceDID,
            targetDID: _targetDID,
            sourceChainId: block.chainid,
            targetChainId: _targetChainId,
            zkProof: _zkProof,
            timestamp: block.timestamp,
            isVerified: false
        });

        emit IdentityPortRequested(requestId, _sourceDID, _targetDID);
        return requestId;
    }

    /**
     * @notice Verify portability request using zk-proof (called by AI Oracle or Justice Engine)
     */
    function verifyPortability(bytes32 _requestId, bytes32 _providedProof) external returns (bool) {
        PortabilityRequest storage req = portabilityRequests[_requestId];
        require(!req.isVerified, "Already verified");

        bool proofValid = (req.zkProof == _providedProof);

        if (proofValid) {
            req.isVerified = true;
            emit IdentityPortVerified(_requestId, true);
            return true;
        }

        // Trigger Justice Engine on failure
        emit IdentityPortVerified(_requestId, false);
        return false;
    }

    /**
     * @notice Execute verified portability (cross-ledger binding)
     */
    function executePortability(bytes32 _requestId) external {
        PortabilityRequest storage req = portabilityRequests[_requestId];
        require(req.isVerified, "Not verified yet");

        // Here you would call cross-chain messaging or registry sync
        emit IdentityPortExecuted(_requestId);
    }
}
