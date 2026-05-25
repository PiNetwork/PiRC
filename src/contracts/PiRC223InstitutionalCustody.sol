// SPDX-License-Identifier: PiOS
pragma solidity ^0.8.28;
import "./PiRC_7Layers_Config.sol";

/**
 * @dev Interface for PiRC-209 DID Registry to verify institutional identity.
 */
interface IPiRC209 {
    struct DID {
        bool isActive;
        string documentURI;
    }
    function getDID(address user) external view returns (DID memory);
}

/**
 * @dev Interface for PiRC-207 to ensure Economic Parity is maintained during transfers.
 */
interface IPiRC207 {
    function checkParityInvariant() external view returns (bool);
}

contract PiRC223InstitutionalCustody {
    IPiRC209 public didRegistry;
    IPiRC207 public parityRegistry;

    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 approvalCount;
    }

    address[] public signers;
    mapping(address => bool) public isSigner;
    uint256 public threshold;
    
    Transaction[] public transactions;
    mapping(uint256 => mapping(address => bool)) public isApproved;

    event TransactionProposed(uint256 indexed txId, address indexed proposer, address to, uint256 value);
    event TransactionApproved(uint256 indexed txId, address indexed signer);
    event TransactionExecuted(uint256 indexed txId);

    modifier onlyVerifiedSigner() {
        require(isSigner[msg.sender], "Not an authorized signer");
        require(didRegistry.getDID(msg.sender).isActive, "Signer DID is not active");
        _;
    }

    constructor(address _didRegistry, address _parityRegistry, address[] memory _initialSigners, uint256 _threshold) {
        require(_initialSigners.length >= _threshold, "Threshold exceeds signer count");
        require(_threshold > 0, "Threshold must be greater than 0");

        didRegistry = IPiRC209(_didRegistry);
        parityRegistry = IPiRC207(_parityRegistry);

        for (uint256 i = 0; i < _initialSigners.length; i++) {
            address signer = _initialSigners[i];
            require(signer != address(0), "Invalid signer address");
            require(!isSigner[signer], "Duplicate signer");

            isSigner[signer] = true;
            signers.push(signer);
        }
        threshold = _threshold;
    }

    /**
     * @notice Propose a new institutional transaction.
     */
    function proposeTransaction(address _to, uint256 _value, bytes calldata _data) external onlyVerifiedSigner {
        uint256 txId = transactions.length;
        transactions.push(Transaction({
            to: _to,
            value: _value,
            data: _data,
            executed: false,
            approvalCount: 0
        }));

        emit TransactionProposed(txId, msg.sender, _to, _value);
    }

    /**
     * @notice Approve a pending transaction.
     */
    function approveTransaction(uint256 _txId) external onlyVerifiedSigner {
        Transaction storage transaction = transactions[_txId];
        require(!transaction.executed, "Transaction already executed");
        require(!isApproved[_txId][msg.sender], "Transaction already approved by this signer");

        transaction.approvalCount += 1;
        isApproved[_txId][msg.sender] = true;

        emit TransactionApproved(_txId, msg.sender);
    }

    /**
     * @notice Execute the transaction once the threshold is met.
     */
    function executeTransaction(uint256 _txId) external onlyVerifiedSigner {
        Transaction storage transaction = transactions[_txId];
        require(!transaction.executed, "Transaction already executed");
        require(transaction.approvalCount >= threshold, "Threshold not met");
        
        // Critical: Check Economic Parity before moving institutional funds
        require(parityRegistry.checkParityInvariant(), "Parity violation: execution halted");

        transaction.executed = true;
        (bool success, ) = transaction.to.call{value: transaction.value}(transaction.data);
        require(success, "Transaction execution failed");

        emit TransactionExecuted(_txId);
    }

    receive() external payable {}
}

