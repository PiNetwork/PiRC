// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PalaceTimeLock {
    function unlockPalace(uint256 birthTimestamp) public view {
        // Strictly unlocks only after the 18th anniversary
        require(block.timestamp >= birthTimestamp + 18 * 365 days, "Heir is not 18 yet");
    }
}
