# Pi Visual Builder — Example Apps

## Example 1: Pi Marketplace (E-Commerce)

A full marketplace app with escrow protection and merchant reputation.

### Screens
1. **Home** — Featured products, categories, search
2. **Product Detail** — Images, price, seller reputation, buy button
3. **Cart** — Items list, total, checkout with escrow
4. **Orders** — Active escrows, completed purchases
5. **Escrow Status** — Milestone tracker, confirm receipt, dispute
6. **Seller Dashboard** — My products, sales, reputation score

### Key Logic Blocks
```
onTap(buyButton) →
  if(sellerRep.score >= 200) →
    pi.createEscrow(buyer, seller, amount) →
      showToast("Escrow created! Funds protected.") →
      navigate(escrow_status)
  else →
    showAlert("Low Reputation", "Seller has low reputation. Continue?")

onTap(confirmReceipt) →
  pi.confirmReceipt(escrowId) →
    pi.earnLoyalty(pioneer, "escrow_complete", 15) →
    showToast("Confirmed! +15 loyalty points") →
    navigate(orders)

onTap(disputeButton) →
  pi.openDispute(escrowId, "NotAsDescribed", evidence) →
    showToast("Dispute opened. Jurors will review.") →
    navigate(dispute_status)
```

### Generated React Code
```tsx
import { PiColumn, PiRow, PiText, PiImage, PiCard, PiPayButton, ReputationBadge, EscrowStatus } from '@pi/components';
import { usePiAuth, usePiPayment, usePiReputation, usePiLoyalty } from '@pi/sdk';

export const ProductDetail = ({ productId }: { productId: string }) => {
  const { pioneer } = usePiAuth();
  const { createEscrow, confirmReceipt } = usePiPayment();
  const { getReputation } = usePiReputation();
  const { earnPoints } = usePiLoyalty();
  const [product, setProduct] = useState(null);
  const [sellerRep, setSellerRep] = useState(null);
  const [escrowId, setEscrowId] = useState(null);

  const handleBuy = async () => {
    if (sellerRep?.score >= 200) {
      const result = await createEscrow({
        buyer: pioneer.address, seller: product.seller, amount: product.price,
      });
      setEscrowId(result.escrowId);
    }
  };

  return (
    <PiColumn padding={16} gap={12}>
      <PiImage src={product.image} width="100%" height={250} radius={12} />
      <PiRow gap={12} align="center">
        <PiColumn gap={4} flex={1}>
          <PiText style="headline">{product.name}</PiText>
          <PiText style="subtitle">{product.price} Pi</PiText>
        </PiColumn>
        <ReputationBadge score={sellerRep?.score} tier={sellerRep?.tier} />
      </PiRow>
      <PiPayButton amount={product.price} recipient={product.seller} escrow onPress={handleBuy} />
      {escrowId && <EscrowStatus escrowId={escrowId} />}
    </PiColumn>
  );
};
```

---

## Example 2: Pi Services Hub

A platform for booking services (freelance, tutoring, consulting) with milestone escrow.

### Screens
1. **Home** — Service categories, top-rated providers
2. **Service Detail** — Provider profile, reputation, booking form
3. **Booking** — Milestone escrow creation (design → develop → deliver)
4. **Progress** — Milestone tracker with submit/confirm flow
5. **Reviews** — Provider reviews and attestations

### Key Logic Blocks
```
onTap(bookService) →
  pi.createMilestoneEscrow(buyer, provider, total, [
    { amount: 30%, description: "Design phase" },
    { amount: 40%, description: "Development phase" },
    { amount: 30%, description: "Delivery & review" }
  ]) →
    navigate(progress)

onTap(submitMilestone) →
  pi.submitMilestone(escrowId, milestoneId) →
    showToast("Milestone submitted! Awaiting buyer confirmation.")

onTap(confirmMilestone) →
  pi.confirmMilestone(escrowId, milestoneId) →
    pi.earnLoyalty(pioneer, "milestone_confirm", 10) →
    if(allMilestonesComplete) →
      showToast("Project complete! All milestones released.")
```

---

## Example 3: Pi Community Board

A community forum with reputation-gated posting and Sybil-resistant voting.

### Screens
1. **Feed** — Posts sorted by reputation-weighted votes
2. **Post Detail** — Content, comments, vote buttons
3. **New Post** — Create post (min Silver reputation required)
4. **Profile** — User reputation, badges, attestation score

### Key Logic Blocks
```
onTap(upvote) →
  if(pioneer.sybilScore < 3000) →
    apiCall("POST", "/api/vote", { post, weight: tierWeight(pioneer.tier) })
  else →
    showToast("Vote not counted: Sybil score too high")

onTap(newPost) →
  if(pioneer.tier != "Bronze") →
    navigate(new_post_form)
  else →
    showAlert("Min Silver Required", "You need Silver reputation to post.")

onTap(attestUser) →
  if(pioneer.tier != "Bronze") →
    pi.createAttestation(attester, attested, "CommunityVouch")
  else →
    showToast("Min Silver tier to attest other Pioneers")
```

---

## Example 4: Pi Loyalty Rewards Store

A rewards store where Pioneers redeem loyalty points for perks.

### Screens
1. **Rewards Catalog** — Available rewards by tier
2. **My Points** — Current points, tier, streak
3. **Redeem** — Confirm redemption, points deducted
4. **History** — Earned/spent points log

### Key Logic Blocks
```
onScreenLoad →
  pi.getLoyaltyProfile(pioneer) →
    setVar("points", result.redeemablePoints) →
    setVar("tier", result.tier)

onTap(redeemReward) →
  if(points >= reward.cost) →
    pi.redeemReward(pioneer, reward.type, reward.cost) →
      showToast("Reward redeemed! Enjoy your perk.")
  else →
    showToast("Not enough points. Keep earning!")
```

---

## Example 5: Simple Pi Landing Page (HTML Mode)

A basic landing page using HTML/CSS mode — no React needed.

### HTML Output
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pi Coffee Shop</title>
  <link rel="stylesheet" href="styles.css">
  <script src="pi-sdk/pi.js"></script>
</head>
<body class="pi-page">
  <header class="pi-navbar">
    <h1 class="pi-headline">☕ Pi Coffee</h1>
  </header>
  <main class="pi-column" style="padding: 16px; gap: 16px;">
    <img src="assets/hero.jpg" class="pi-image" alt="Fresh coffee">
    <h2 class="pi-title">Fresh roasted, Pi-powered</h2>
    <p class="pi-body">Order specialty coffee with Pi. Escrow-protected delivery.</p>
    <div class="pi-grid" style="columns: 2; gap: 12px;">
      <div class="pi-card">
        <h3 class="pi-subtitle">Ethiopian Single</h3>
        <p class="pi-caption">5 Pi / bag</p>
        <button class="pi-button pi-button--primary" onclick="Pi.pay({amount:5,recipient:'seller',escrow:true})">Order</button>
      </div>
      <div class="pi-card">
        <h3 class="pi-subtitle">Colombian Blend</h3>
        <p class="pi-caption">4 Pi / bag</p>
        <button class="pi-button pi-button--primary" onclick="Pi.pay({amount:4,recipient:'seller',escrow:true})">Order</button>
      </div>
    </div>
  </main>
</body>
</html>
```

This demonstrates the **HTML mode** for simple pages — no build step, no React, just HTML + CSS + Pi SDK.
