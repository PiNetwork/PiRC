// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PiRC-101 Sovereign Vault
 * @author EslaM-X Protocol Architect
 * @notice Implements 10M:1 Credit Expansion with Quadratic Liquidity Guardrails.
 */
contract PiRC101Vault {
    // --- Constants ---
    uint256 public constant QWF_MAX = 10_000_000; // 10 Million Multiplier
    uint256 public constant EXIT_CAP_PPM = 1000; // 0.1% Daily Exit Limit

    // --- State Variables ---
    struct GlobalState {
        uint256 totalReserves; // External Pi Locked
        uint256 totalREF;      // Total Internal Credits Minted
        uint256 lastExitTimestamp;
        uint256 dailyExitAmount;
    }

    GlobalState public systemState;
    mapping(address => mapping(uint8 => uint256)) public userBalances;

    // --- Events ---
    event CreditExpanded(address indexed user, uint256 piDeposited, uint256 refMinted, uint256 phi);

    /**
     * @notice Deposits External Pi and Mints Internal REF Credits
     * @param _amount Amount of Pi to lock
     * @param _class Target utility class (0: Retail, 1: GCV, etc.)
     */
    function depositAndMint(uint256 _amount, uint8 _class) external {
        require(_amount > 0, "Amount must be greater than zero");
        
        // Fetch Mock Oracle Data (In production, use Decentralized Oracle)
        uint256 piPrice = 314000; // $0.314 in 6 decimals
        uint256 currentLiquidity = 10_000_000 * 1e6; // $10M Market Depth

        // Calculate Phi (Liquidity Throttling Coefficient)
        uint256 phi = calculatePhi(currentLiquidity, systemState.totalREF);
        require(phi > 0, "Insolvency Risk: Minting Paused");

        // Expansion Logic: Pi -> USD Value -> 10M Credit Expansion
        uint256 capturedValue = (_amount * piPrice) / 1e6;
        uint256 mintAmount = (capturedValue * QWF_MAX * phi) / 1e18;

        // Update State
        systemState.totalReserves += _amount;
        systemState.totalREF += mintAmount;
        userBalances[msg.sender][_class] += mintAmount;

        emit CreditExpanded(msg.sender, _amount, mintAmount, phi);
    }

    function calculatePhi(uint256 _depth, uint256 _supply) public pure returns (uint256) {
        if (_supply == 0) return 1e18; // 1.0 (Full Expansion)
        uint256 ratio = (_depth * 1e18) / _supply;
        if (ratio >= 1.5e18) return 1e18; 
        return (ratio * ratio) / 2.25e18; // Quadratic Throttling
    }
}
