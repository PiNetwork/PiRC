// SPDX-License-Identifier: PiOS
pragma solidity ^0.8.28;

/**
 * @dev Interface to verify that the Auditor has a valid Sovereign DID.
 */
interface IPiRC209 {
    struct DID {
        bool isActive;
        string documentURI;
    }
    function getDID(address user) external view returns (DID memory);
}

/**
 * @dev Interface to fetch the current on-chain supply of specific 7-Layer tokens.
 */
interface IPiRC207 {
    function getLayerSupply(uint256 layerId) external view returns (uint256);
}

contract PiRC225ProofOfReserves {
    IPiRC209 public didRegistry;
    IPiRC207 public parityRegistry;

    struct Attestation {
        uint256 reserveAmount;
        uint256 timestamp;
        address auditor;
        string proofURI; // Link to external audit document or IPFS report
    }

    // Mapping from Layer ID (from PiRC-207) to its latest Proof of Reserve attestation
    mapping(uint256 => Attestation) public latestAttestations;
    
    // Authorized auditors verified via PiRC-209
    mapping(address => bool) public authorizedAuditors;

    event ReserveAttested(uint256 indexed layerId, uint256 amount, address auditor);
    event AuditorStatusChanged(address auditor, bool status);

    modifier onlyAuditor() {
        require(authorizedAuditors[msg.sender], "Caller is not an authorized auditor");
        require(didRegistry.getDID(msg.sender).isActive, "Auditor DID is inactive");
        _;
    }

    constructor(address _didRegistry, address _parityRegistry) {
        didRegistry = IPiRC209(_didRegistry);
        parityRegistry = IPiRC207(_parityRegistry);
    }

    /**
     * @notice Submit a new Proof of Reserve attestation for a specific asset layer.
     * @param _layerId The 7-Layer ID being audited.
     * @param _amount The physical amount verified in custody.
     * @param _proofURI Metadata link to the full audit report.
     */
    function submitAttestation(
        uint256 _layerId, 
        uint256 _amount, 
        string calldata _proofURI
    ) external onlyAuditor {
        latestAttestations[_layerId] = Attestation({
            reserveAmount: _amount,
            timestamp: block.timestamp,
            auditor: msg.sender,
            proofURI: _proofURI
        });

        emit ReserveAttested(_layerId, _amount, msg.sender);
    }

    /**
     * @notice Checks if the on-chain supply exceeds the reported physical reserves.
     * @param _layerId The layer to check.
     * @return bool True if the system is fully collateralized (On-chain <= Physical).
     */
    function isFullyCollateralized(uint256 _layerId) public view returns (bool) {
        uint256 onChainSupply = parityRegistry.getLayerSupply(_layerId);
        uint256 physicalReserve = latestAttestations[_layerId].reserveAmount;
        
        return onChainSupply <= physicalReserve;
    }

    /**
     * @notice Update auditor authorization (Admin functionality).
     */
    function setAuditorStatus(address _auditor, bool _status) external {
        // In a full implementation, this would be governed by PiRC-212 Governance
        authorizedAuditors[_auditor] = _status;
        emit AuditorStatusChanged(_auditor, _status);
    }

    /**
     * @notice Get the gap between physical reserves and on-chain supply.
     */
    function getCollateralGap(uint256 _layerId) external view returns (int256) {
        uint256 onChainSupply = parityRegistry.getLayerSupply(_layerId);
        uint256 physicalReserve = latestAttestations[_layerId].reserveAmount;
        
        return int256(physicalReserve) - int256(onChainSupply);
    }
}
