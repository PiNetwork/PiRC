import Decimal from 'decimal.js';

// Configure Decimal.js for ultra-high precision (e.g. 10 million decimals handling ideally, but practical for browser limit)
// For dashboard demo, we use a high precision standard.
Decimal.set({ precision: 1000, rounding: 4 });

export type AssetCategory = 'EARTH_MINERALS' | 'EARTH_ENERGY' | 'ARTIFACTS' | 'SPACE_METALS';

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  quantity: Decimal;
  unit: string;
  valuationPerUnit: Decimal;
  totalValue: Decimal;
  growthRate: Decimal; // expansion parameter
}

export const generateMockAssets = (): Asset[] => {
  return [
    {
      id: 'gold-1',
      name: 'Global Gold Reserves',
      category: 'EARTH_MINERALS',
      quantity: new Decimal('208874'), // Tonnes
      unit: 'Tonnes',
      valuationPerUnit: new Decimal('64300000'), // $ per tonne
      totalValue: new Decimal('208874').mul(new Decimal('64300000')),
      growthRate: new Decimal('1.000000015'),
    },
    {
      id: 'oil-1',
      name: 'Crude Oil Reserves',
      category: 'EARTH_ENERGY',
      quantity: new Decimal('1700000000000'), // Barrels
      unit: 'Barrels',
      valuationPerUnit: new Decimal('75'),
      totalValue: new Decimal('1700000000000').mul(new Decimal('75')),
      growthRate: new Decimal('0.999998'),
    },
    {
      id: 'space-psyche',
      name: 'Asteroid 16 Psyche',
      category: 'SPACE_METALS',
      quantity: new Decimal('10000000000000000000'), // Est kg
      unit: 'kg',
      valuationPerUnit: new Decimal('1000'), 
      totalValue: new Decimal('10000000000000000000').mul(new Decimal('1000')),
      growthRate: new Decimal('1.00000000005'),
    },
    {
      id: 'artifacts-pharaohs',
      name: 'Pharaonic Antiquities (Global)',
      category: 'ARTIFACTS',
      quantity: new Decimal('500000'), // Estimated major pieces
      unit: 'Pieces',
      valuationPerUnit: new Decimal('25000000'), // Avg value per piece
      totalValue: new Decimal('500000').mul(new Decimal('25000000')),
      growthRate: new Decimal('1.00002'), // Appreciation
    }
  ];
};

export const formatHugeNumber = (num: Decimal): string => {
  if (num.abs().gte(new Decimal('1e12'))) {
    return (num.div(new Decimal('1e12'))).toDP(4) + ' Trillion';
  }
  if (num.abs().gte(new Decimal('1e9'))) {
    return (num.div(new Decimal('1e9'))).toDP(4) + ' Billion';
  }
  if (num.abs().gte(new Decimal('1e6'))) {
    return (num.div(new Decimal('1e6'))).toDP(4) + ' Million';
  }
  return num.toDP(4).toString();
};
