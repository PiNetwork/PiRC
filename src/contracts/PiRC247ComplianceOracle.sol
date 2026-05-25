// SPDX-License-Identifier: PiOS
pragma solidity ^0.8.28;
import "./PiRC_7Layers_Config.sol";

contract PiRC247ComplianceOracle {
    address public authorizedComplianceNode;
    mapping(address => bool) public isBlacklisted;

    event AddressBlacklisted(address indexed account, string reason);
    event AddressCleared(address indexed account);

    constructor(address _node) {
        authorizedComplianceNode = _node;
    }

    modifier onlyComplianceNode() {
        require(msg.sender == authorizedComplianceNode, "Unauthorized");
        _;
    }

    function updateSanctionStatus(address account, bool status, string calldata reason) external onlyComplianceNode {
        isBlacklisted[account] = status;
        if (status) {
            emit AddressBlacklisted(account, reason);
        } else {
            emit AddressCleared(account);
        }
    }

    function checkCompliance(address account) external view returns (bool) {
        return !isBlacklisted[account];
    }
}
