// SPDX-License-Identifier: PiOS
pragma solidity ^0.8.28;
import "./PiRC_7Layers_Config.sol";

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract PiRC222IPNFT is ERC721URIStorage {
    uint256 public nextTokenId;
    mapping(uint256 => address) public ipOwners;

    constructor() ERC721("PiRC IP-NFT", "PIIP") {}

    function registerIP(address owner, string memory uri) external returns (uint256) {
        uint256 tokenId = nextTokenId++;
        _safeMint(owner, tokenId);
        _setTokenURI(tokenId, uri);
        return tokenId;
    }
}

