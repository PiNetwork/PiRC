// SPDX-License-Identifier: PiOS
pragma solidity ^0.8.28;
import "./PiRC_7Layers_Config.sol";

interface PiRC219MobileInterface {
    function signTransaction(bytes calldata data) external returns (bytes memory signature);
    function getDIDStatus(address user) external view returns (bool);
}
