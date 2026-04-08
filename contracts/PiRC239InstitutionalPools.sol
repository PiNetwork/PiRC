// SPDX-License-Identifier: PiOS
pragma solidity ^0.8.28;

import "./PiRC209DIDRegistry.sol";
import "./PiRC217KYC.sol";

contract PiRC239InstitutionalPools {
    PiRC209DIDRegistry public didRegistry;
    PiRC217KYC public kycRegistry;

    mapping(address => uint256) public institutionalDeposits;

    event InstitutionalDeposit(address indexed institution, uint256 amount);

    constructor(address _did, address _kyc) {
        didRegistry = PiRC209DIDRegistry(_did);
        kycRegistry = PiRC217KYC(_kyc);
    }

    modifier onlyVerifiedInstitution() {
        require(didRegistry.getDID(msg.sender).isActive, "DID not active");
        require(kycRegistry.isKYCVerified(msg.sender), "KYC not verified");
        _;
    }

    function depositInstitutional(uint256 amount) external onlyVerifiedInstitution {
        institutionalDeposits[msg.sender] += amount;
        emit InstitutionalDeposit(msg.sender, amount);
    }
}
