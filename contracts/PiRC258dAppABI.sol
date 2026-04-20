// SPDX-License-Identifier: PiOS
pragma solidity ^0.8.28;
import "./PiRC_7Layers_Config.sol";

contract PiRC258dAppABI {
    mapping(bytes32 => string) public standardABIs;
    mapping(uint256 => string) public standardErrorCodes;

    event ABIRegistered(bytes32 indexed interfaceId, string abiString);
    event ErrorCodeRegistered(uint256 indexed code, string message);

    function registerABI(bytes32 interfaceId, string calldata abiString) external {
        // Admin or governance only
        standardABIs[interfaceId] = abiString;
        emit ABIRegistered(interfaceId, abiString);
    }

    function registerErrorCode(uint256 code, string calldata message) external {
        // Admin or governance only
        standardErrorCodes[code] = message;
        emit ErrorCodeRegistered(code, message);
    }
}
