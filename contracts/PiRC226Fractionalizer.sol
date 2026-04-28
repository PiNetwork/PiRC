// SPDX-License-Identifier: PiOS
pragma solidity ^0.8.28;
import "./PiRC_7Layers_Config.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @dev Interface for PiRC-207 to verify the 7-Layer Parity Invariant.
 */
interface IPiRC207 {
    function checkParityInvariant() external view returns (bool);
    function registerNewFractionalLayer(uint256 nftId, uint256 totalShares) external;
}

contract PiRC226Fractionalizer is ERC20, ReentrancyGuard {
    IPiRC207 public parityRegistry;
    
    address public immutable assetAddress;
    uint256 public immutable nftId;
    address public immutable originalOwner;
    
    bool public isFractionalized;
    uint256 public totalSharesIssued;

    event AssetsFractionalized(uint256 indexed nftId, uint256 totalShares);
    event AssetRedeemed(address indexed redeemer);

    constructor(
        string memory _name,
        string memory _symbol,
        address _assetAddress,
        uint256 _nftId,
        address _parityRegistry
    ) ERC20(_name, _symbol) {
        assetAddress = _assetAddress;
        nftId = _nftId;
        parityRegistry = IPiRC207(_parityRegistry);
        originalOwner = msg.sender;
    }

    /**
     * @notice Locks the NFT and mints fractional shares to the owner.
     * @param _totalShares The number of shares to create (e.g., 1,000,000 for 1M parts).
     */
    function fractionalize(uint256 _totalShares) external nonReentrant {
        require(msg.sender == originalOwner, "Only asset owner can fractionalize");
        require(!isFractionalized, "Already fractionalized");
        require(_totalShares > 0, "Shares must be greater than zero");

        // Step 1: Transfer the NFT to this contract (Locking the asset)
        IERC721(assetAddress).transferFrom(msg.sender, address(this), nftId);

        // Step 2: Ensure Economic Parity is maintained before minting
        require(parityRegistry.checkParityInvariant(), "Parity violation: cannot fractionalize");

        // Step 3: Register the new fractional layer in the PiRC-207 Registry
        parityRegistry.registerNewFractionalLayer(nftId, _totalShares);

        // Step 4: Mint the shares to the original owner
        _mint(msg.sender, _totalShares);
        
        totalSharesIssued = _totalShares;
        isFractionalized = true;

        emit AssetsFractionalized(nftId, _totalShares);
    }

    /**
     * @notice Allows a user who holds 100% of the shares to burn them and reclaim the NFT.
     */
    function redeem() external nonReentrant {
        require(isFractionalized, "Not yet fractionalized");
        require(balanceOf(msg.sender) == totalSharesIssued, "Must hold 100% of shares to redeem");

        // Step 1: Burn all shares
        _burn(msg.sender, totalSharesIssued);
        
        isFractionalized = false;

        // Step 2: Transfer the NFT back to the redeemer
        IERC721(assetAddress).transferFrom(address(this), msg.sender, nftId);

        emit AssetRedeemed(msg.sender);
    }

    /**
     * @dev Internal check to prevent share transfers if Parity is broken.
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual {
        require(parityRegistry.checkParityInvariant(), "Global Economic Parity broken: Transfers halted");
    }
}
