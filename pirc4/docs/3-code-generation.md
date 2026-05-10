# Pi Visual Builder — Code Generation Specification

## React/TypeScript Output

### Generated App Structure
```
dist/pibrowser/
├── index.html              # Pi Browser entry point
├── manifest.json           # Pi app metadata
├── assets/
│   ├── index.js            # Bundled React app (Vite)
│   ├── index.css           # Compiled styles
│   └── images/
└── pi-sdk/
    └── pi.js               # Pi SDK bundle
```

### Screen Generation Example

**Visual Design → React/TS Code:**

```tsx
// screens/ProductDetail.tsx
import React, { useState, useEffect } from 'react';
import { PiColumn, PiRow, PiText, PiImage, PiCard, PiPayButton, ReputationBadge, EscrowStatus } from '@pi/components';
import { usePiAuth, usePiPayment, usePiReputation } from '@pi/sdk';

interface ProductDetailProps {
  productId: string;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ productId }) => {
  const [product, setProduct] = useState<any>(null);
  const [escrowId, setEscrowId] = useState<string | null>(null);
  const { pioneer } = usePiAuth();
  const { createEscrow } = usePiPayment();
  const { getReputation } = usePiReputation();
  const [sellerRep, setSellerRep] = useState<any>(null);

  useEffect(() => {
    // Generated from onScreenLoad logic block
    fetch(`/api/products/${productId}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        getReputation(data.seller).then(setSellerRep);
      });
  }, [productId]);

  const handleBuy = async () => {
    // Generated from onTap → pi.createEscrow logic block
    if (sellerRep && sellerRep.score >= 200) {
      const result = await createEscrow({
        buyer: pioneer.address,
        seller: product.seller,
        amount: product.price,
        token: 'PI',
      });
      setEscrowId(result.escrowId);
    }
  };

  if (!product) return <PiText>Loading...</PiText>;

  return (
    <PiColumn padding={16} gap={12}>
      <PiImage src={product.image} width="100%" height={250} radius={12} fit="cover" />
      <PiRow gap={12} align="center">
        <PiColumn gap={4} flex={1}>
          <PiText style="headline">{product.name}</PiText>
          <PiText style="subtitle">{product.price} Pi</PiText>
        </PiColumn>
        {sellerRep && <ReputationBadge score={sellerRep.score} tier={sellerRep.tier} />}
      </PiRow>
      <PiCard elevation={1} padding={12}>
        <PiText style="body">{product.description}</PiText>
      </PiCard>
      <PiPayButton
        amount={product.price}
        recipient={product.seller}
        escrow={true}
        onPress={handleBuy}
      />
      {escrowId && <EscrowStatus escrowId={escrowId} />}
    </PiColumn>
  );
};
```

### HTML/CSS Mode Output

For simple pages, the builder generates pure HTML/CSS:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Pi Shop</title>
  <link rel="stylesheet" href="styles.css">
  <script src="pi-sdk/pi.js"></script>
</head>
<body>
  <div class="pi-column" style="padding: 16px; gap: 12px;">
    <h1 class="pi-headline">Welcome, Pioneer!</h1>
    <p class="pi-body">Browse trusted merchants on Pi Network</p>
    <button class="pi-button pi-button--primary" onclick="Pi.pay({ amount: 10, recipient: seller })">
      Buy Now — 10 Pi
    </button>
  </div>
</body>
</html>
```

```css
/* styles.css — Pi Design System */
:root {
  --pi-primary: #6B46F5;
  --pi-secondary: #9F7AEA;
  --pi-success: #48BB78;
  --pi-error: #F56565;
  --pi-bg: #FFFFFF;
  --pi-surface: #F7FAFC;
  --pi-text: #1A202C;
  --pi-text-secondary: #718096;
  --pi-radius: 8px;
  --pi-spacing: 16px;
}

.pi-column { display: flex; flex-direction: column; }
.pi-row { display: flex; flex-direction: row; align-items: center; }
.pi-headline { font-size: 24px; font-weight: 600; color: var(--pi-text); }
.pi-body { font-size: 14px; color: var(--pi-text-secondary); }
.pi-button {
  padding: 12px 24px; border-radius: var(--pi-radius); border: none;
  font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.pi-button--primary { background: var(--pi-primary); color: white; }
.pi-button--primary:active { transform: scale(0.97); }
```

## Pi SDK (`@pi/sdk`)

### Authentication
```tsx
import { usePiAuth } from '@pi/sdk';

const { pioneer, login, logout, isAuthenticated } = usePiAuth();
// pioneer.address, pioneer.name, pioneer.avatar
```

### Payments
```tsx
import { usePiPayment } from '@pi/sdk';

const { pay, createEscrow, confirmReceipt } = usePiPayment();

// Direct payment
await pay({ amount: 10, recipient: sellerAddress });

// Escrow payment (PiDCTP)
const escrow = await createEscrow({
  buyer: pioneer.address,
  seller: sellerAddress,
  amount: 100,
  token: 'PI',
  deliveryDeadline: Date.now() + 86400000,
});

// Confirm receipt
await confirmReceipt({ escrowId: escrow.escrowId });
```

### Reputation
```tsx
import { usePiReputation } from '@pi/sdk';

const { getReputation, getEffectiveScore, awardBadge } = usePiReputation();

const rep = await getReputation(sellerAddress);
// rep.score, rep.tier, rep.badgeCount, rep.isVerifiedMerchant

const effective = await getEffectiveScore(sellerAddress);
// Adjusted for Sybil score
```

### Dispute
```tsx
import { usePiDispute } from '@pi/sdk';

const { openDispute, submitEvidence } = usePiDispute();

await openDispute({
  escrowId: '123',
  category: 'NotAsDescribed',
  evidence: evidenceHash,
});
```

### Merchant
```tsx
import { usePiMerchant } from '@pi/sdk';

const { verifyMerchant, getMerchantProfile } = usePiMerchant();

const merchant = await getMerchantProfile(address);
// merchant.level, merchant.status, merchant.category, merchant.avgRating
```

### Loyalty
```tsx
import { usePiLoyalty } from '@pi/sdk';

const { earnPoints, getProfile } = usePiLoyalty();

await earnPoints({ pioneer: pioneer.address, action: 'escrow_complete', amount: 15 });
const loyalty = await getProfile(pioneer.address);
// loyalty.points, loyalty.tier, loyalty.redeemablePoints
```

## Build Pipeline

```
Visual Design (.ui.json + .logic.json)
         │
         ▼
   AST Generator
         │
         ├──► React/TS Code (.tsx + .ts)
         │         │
         │         ▼
         │    Vite Bundler
         │         │
         │         ▼
         │    Pi Browser Package (dist/)
         │
         └──► HTML/CSS Code (.html + .css)
                   │
                   ▼
              Pi Browser Package (dist/)
```

### Vite Configuration
```ts
// vite.config.ts — Auto-generated
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/pibrowser',
    target: 'es2020',
    minify: true,
  },
  define: {
    'process.env.PI_NETWORK': '"mainnet"',
  },
});
```

### Pi Browser Manifest
```json
{
  "name": "My Pi Shop",
  "version": "1.0.0",
  "author": "pioneer_address",
  "description": "Trusted commerce on Pi Network",
  "permissions": ["pi.auth", "pi.pay", "pi.escrow", "pi.reputation"],
  "entry": "index.html",
  "icon": "assets/icon.png",
  "category": "commerce",
  "minPiBrowserVersion": "2.0"
}
```
