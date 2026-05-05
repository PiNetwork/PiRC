// SPDX-License-Identifier: PiOS
pragma solidity ^0.8.28;
import "./PiRC_7Layers_Config.sol";

import "./PiRC209DIDRegistry.sol";

contract PiRC250SmartAccount {
    PiRC209DIDRegistry public didRegistry;
    address public owner;

    event TransactionExecuted(address indexed target, uint256 value, bytes data);

    constructor(address _owner, address _didRegistry) {
        owner = _owner;
        didRegistry = PiRC209DIDRegistry(_didRegistry);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    function executeTransaction(address target, uint256 value, bytes calldata data) external onlyOwner {
        require(didRegistry.getDID(address(this)).isActive, "Corporate DID inactive");
        
        (bool success, ) = target.call{value: value}(data);
        require(success, "Transaction failed");
        
        emit TransactionExecuted(target, value, data);
    }
}
