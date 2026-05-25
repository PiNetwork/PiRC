// SPDX-License-Identifier: PiOS
pragma solidity ^0.8.28;
import "./PiRC_7Layers_Config.sol";

import "./PiRC231Lending.sol";
import "./PiRC228JusticeEngine.sol";

contract PiRC232Liquidation {
    PiRC231Lending public lendingProtocol;
    PiRC228JusticeEngine public justiceEngine;

    event Liquidated(address indexed user, address indexed liquidator, uint256 amount);

    constructor(address _lending, address _justice) {
        lendingProtocol = PiRC231Lending(_lending);
        justiceEngine = PiRC228JusticeEngine(_justice);
    }

    function liquidate(address user) external {
        uint256 userDebt = lendingProtocol.debt(user);
        uint256 userCollateral = lendingProtocol.collateral(user);
        
        require(userCollateral < userDebt * 2, "Position is healthy");
        require(justiceEngine.isApproved(user), "Justice Engine block");

        emit Liquidated(user, msg.sender, userDebt);
    }
}
