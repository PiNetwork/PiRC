pragma solidity ^0.8.0;
import "./PiRC_7Layers_Config.sol";

contract RewardController {

    uint public feePool;

    function depositFees() public payable {
        feePool += msg.value;
    }

    function distribute(address[] memory users, uint[] memory weights) public {

        uint totalWeight;

        for(uint i = 0; i < weights.length; i++){
            totalWeight += weights[i];
        }

        for(uint i = 0; i < users.length; i++){
            uint reward = (feePool * weights[i]) / totalWeight;
        }

    }
}
