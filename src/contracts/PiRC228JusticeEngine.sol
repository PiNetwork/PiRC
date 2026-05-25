// SPDX-License-Identifier: PiOS
pragma solidity ^0.8.28;
import "./PiRC_7Layers_Config.sol";

contract PiRC228JusticeEngine {
    mapping(address => bool) public isArbitrator;
    mapping(address => bool) public frozenAssets;
    
    event AssetFrozen(address indexed target, address indexed arbitrator);
    event AssetReleased(address indexed target, address indexed arbitrator);

    modifier onlyArbitrator() {
        require(isArbitrator[msg.sender], "Not an authorized arbitrator");
        _;
    }

    constructor(address[] memory _initialArbitrators) {
        for (uint i = 0; i < _initialArbitrators.length; i++) {
            isArbitrator[_initialArbitrators[i]] = true;
        }
    }

    function lockDisputedAsset(address target) external onlyArbitrator {
        frozenAssets[target] = true;
        emit AssetFrozen(target, msg.sender);
    }

    function resolveAndRelease(address target) external onlyArbitrator {
        frozenAssets[target] = false;
        emit AssetReleased(target, msg.sender);
    }
}
