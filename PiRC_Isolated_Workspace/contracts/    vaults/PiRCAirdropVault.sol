// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "./PiRC_7Layers_Config.sol";

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
}

/*
PiRCAirdropVault

Wave-based community distribution vault for PiRC.

Features:
- 6 distribution waves
- Fixed unlock timestamps
- Per-wallet social platform claim mask
- Operator-controlled airdrops
- Excess withdrawal after final wave
*/

contract PiRCAirdropVault {

    IERC20 public immutable PIRC;
    address public operator;

    uint256 private constant DEC = 1e18;

    // Example issue timestamp
    uint256 public constant ISSUE_TS = 1763865465;

    // Unlock schedule
    uint256 public constant W1 = ISSUE_TS + 14 days;
    uint256 public constant W2 = W1 + 90 days;
    uint256 public constant W3 = W2 + 90 days;
    uint256 public constant W4 = W3 + 90 days;
    uint256 public constant W5 = W4 + 90 days;
    uint256 public constant W6 = W5 + 90 days;

    uint256 public constant AFTER_ALL_WAVES = W6 + 90 days;

    // Distribution caps
    uint256 public constant CAP1 = 500_000 * DEC;
    uint256 public constant CAP2 = 350_000 * DEC;
    uint256 public constant CAP3 = 250_000 * DEC;
    uint256 public constant CAP4 = 180_000 * DEC;
    uint256 public constant CAP5 = 120_000 * DEC;
    uint256 public constant CAP6 = 100_000 * DEC;

    uint256 public constant TOTAL_ALLOCATION =
        CAP1 + CAP2 + CAP3 + CAP4 + CAP5 + CAP6;

    uint256 public totalDistributed;

    // Social platform claim mask
    // 1=Instagram, 2=X, 4=Telegram, 8=Facebook, 16=YouTube
    mapping(address => uint8) public socialMask;

    event OperatorUpdated(address oldOperator, address newOperator);
    event Airdropped(address indexed to, uint256 amount, uint8 platformBit);
    event WithdrawnExcess(address indexed to, uint256 amount);

    modifier onlyOperator() {
        require(msg.sender == operator, "NOT_OPERATOR");
        _;
    }

    constructor(address _pircToken, address _operator) {
        require(_pircToken != address(0), "TOKEN_ZERO");
        require(_operator != address(0), "OPERATOR_ZERO");

        PIRC = IERC20(_pircToken);
        operator = _operator;

        emit OperatorUpdated(address(0), operator);
    }

    function setOperator(address newOperator) external onlyOperator {
        require(newOperator != address(0), "OPERATOR_ZERO");

        address old = operator;
        operator = newOperator;

        emit OperatorUpdated(old, newOperator);
    }

    /* ========= WAVE LOGIC ========= */

    function currentWave() public view returns (int8) {

        uint256 t = block.timestamp;

        if (t < W1) return -1;
        if (t < W2) return 0;
        if (t < W3) return 1;
        if (t < W4) return 2;
        if (t < W5) return 3;
        if (t < W6) return 4;

        return 5;
    }

    function unlockedTotal() public view returns (uint256) {

        int8 w = currentWave();

        if (w < 0) return 0;

        uint256 sum = CAP1;

        if (w >= 1) sum += CAP2;
        if (w >= 2) sum += CAP3;
        if (w >= 3) sum += CAP4;
        if (w >= 4) sum += CAP5;
        if (w >= 5) sum += CAP6;

        return sum;
    }

    function remainingUnlocked() public view returns (uint256) {

        uint256 unlocked = unlockedTotal();

        if (totalDistributed >= unlocked) return 0;

        return unlocked - totalDistributed;
    }

    /* ========= CLAIM ACTION ========= */

    function airdrop(
        address to,
        uint256 amount,
        uint8 platformBit
    ) external onlyOperator {

        require(to != address(0), "TO_ZERO");
        require(amount > 0, "AMOUNT_ZERO");

        require(_validPlatform(platformBit), "BAD_PLATFORM");

        uint8 mask = socialMask[to];

        require((mask & platformBit) == 0, "ALREADY_CLAIMED");

        require(remainingUnlocked() >= amount, "WAVE_CAP");

        require(PIRC.balanceOf(address(this)) >= amount, "VAULT_LOW");

        socialMask[to] = mask | platformBit;

        totalDistributed += amount;

        require(PIRC.transfer(to, amount), "TRANSFER_FAIL");

        emit Airdropped(to, amount, platformBit);
    }

    /* ========= WITHDRAW EXCESS ========= */

    function withdrawExcess(address to, uint256 amount)
        external
        onlyOperator
    {

        require(block.timestamp >= AFTER_ALL_WAVES, "TOO_EARLY");

        uint256 bal = PIRC.balanceOf(address(this));

        uint256 mustKeep = TOTAL_ALLOCATION - totalDistributed;

        require(bal > mustKeep, "NO_EXCESS");

        uint256 excess = bal - mustKeep;

        require(amount <= excess, "TOO_MUCH");

        require(PIRC.transfer(to, amount), "TRANSFER_FAIL");

        emit WithdrawnExcess(to, amount);
    }

    /* ========= HELPERS ========= */

    function _validPlatform(uint8 b) internal pure returns (bool) {
        return (b == 1 || b == 2 || b == 4 || b == 8 || b == 16);
    }

}
