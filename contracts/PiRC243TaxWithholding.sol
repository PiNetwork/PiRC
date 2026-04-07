// SPDX-License-Identifier: PiOS
pragma solidity ^0.8.28;

contract PiRC243TaxWithholding {
    mapping(uint256 => uint256) public jurisdictionTaxRates; // Jurisdiction ID => Tax Rate (in basis points)
    mapping(uint256 => address) public jurisdictionVaults;

    event TaxWithheld(address indexed from, uint256 jurisdictionId, uint256 amount);

    function setJurisdictionTax(uint256 jurisdictionId, uint256 rate, address vault) external {
        // Admin only
        jurisdictionTaxRates[jurisdictionId] = rate;
        jurisdictionVaults[jurisdictionId] = vault;
    }

    function calculateAndWithhold(address sender, uint256 amount, uint256 jurisdictionId) external returns (uint256 netAmount) {
        uint256 rate = jurisdictionTaxRates[jurisdictionId];
        if (rate == 0) return amount;

        uint256 taxAmount = (amount * rate) / 10000;
        netAmount = amount - taxAmount;

        // Route taxAmount to jurisdictionVaults[jurisdictionId]
        emit TaxWithheld(sender, jurisdictionId, taxAmount);
        return netAmount;
    }
}
