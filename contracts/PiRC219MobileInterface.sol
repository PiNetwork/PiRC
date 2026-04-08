// SPDX-License-Identifier: PiOS
pragma solidity ^0.8.28;

interface PiRC219MobileInterface {
    function signTransaction(bytes calldata data) external returns (bytes memory signature);
    function getDIDStatus(address user) external view returns (bool);
}
