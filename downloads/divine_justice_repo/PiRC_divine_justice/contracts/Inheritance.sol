// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Inheritance {
    struct Heir {
        address wallet;
        uint256 share;
    }
    Heir[] public heirs;

    constructor(address[] memory wallets, uint256[] memory shares) payable {
        require(wallets.length == shares.length, "Mismatch");
        for (uint i = 0; i < wallets.length; i++) {
            heirs.push(Heir(wallets[i], shares[i]));
        }
    }

    function distribute() public {
        for (uint i = 0; i < heirs.length; i++) {
            payable(heirs[i].wallet).transfer(heirs[i].share);
        }
    }

    receive() external payable {}
}
