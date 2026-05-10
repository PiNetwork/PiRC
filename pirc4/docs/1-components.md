# Pi Visual Builder — Component Specification

## Layout Components

### `<PiColumn>`
Vertical layout container.
```tsx
<PiColumn gap={8} padding={16} align="center">
  <PiText style="headline">Title</PiText>
  <PiText style="body">Description</PiText>
</PiColumn>
```
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| gap | number | 0 | Spacing between children (px) |
| padding | number | 0 | Inner padding |
| align | "start" \| "center" \| "end" | "start" | Horizontal alignment |
| crossAlign | "start" \| "center" \| "end" | "stretch" | Vertical alignment |
| scrollable | boolean | false | Enable vertical scroll |

### `<PiRow>`
Horizontal layout container.
```tsx
<PiRow gap={12} align="center">
  <PiImage src={product.image} width={80} height={80} radius={8} />
  <PiColumn gap={4}>
    <PiText style="subtitle">{product.name}</PiText>
    <PiText style="caption">{product.price} Pi</PiText>
  </PiColumn>
  <PiPayButton amount={product.price} recipient={seller} />
</PiRow>
```

### `<PiGrid>`
Responsive grid layout.
```tsx
<PiGrid columns={2} gap={12}>
  <ProductCard product={products[0]} />
  <ProductCard product={products[1]} />
  <ProductCard product={products[2]} />
  <ProductCard product={products[3]} />
</PiGrid>
```

### `<PiScrollView>`
Scrollable container with pull-to-refresh.
```tsx
<PiScrollView onRefresh={reloadData}>
  {items.map(item => <ProductCard key={item.id} product={item} />)}
</PiScrollView>
```

### `<PiTabView>`
Tab navigation container.
```tsx
<PiTabView tabs={["Shop", "Orders", "Profile"]}>
  <ShopScreen />
  <OrdersScreen />
  <ProfileScreen />
</PiTabView>
```

## Display Components

### `<PiText>`
Styled text with Pi Design System typography.
```tsx
<PiText style="headline" color="primary">Welcome, Pioneer!</PiText>
<PiText style="body" color="secondary">Browse trusted merchants</PiText>
<PiText style="caption" color="error">Payment failed</PiText>
```
| Style | Size | Weight |
|-------|------|--------|
| display | 32px | Bold |
| headline | 24px | SemiBold |
| title | 20px | SemiBold |
| subtitle | 16px | Medium |
| body | 14px | Regular |
| caption | 12px | Regular |
| overline | 10px | Medium |

### `<PiImage>`
Image with placeholder and error states.
```tsx
<PiImage src={product.image} width="100%" height={200} radius={12} fit="cover" placeholder="loading" />
```

### `<PiCard>`
Content container with elevation and radius.
```tsx
<PiCard elevation={1} padding={16} radius={12}>
  <PiText style="title">{merchant.name}</PiText>
  <ReputationBadge score={merchant.reputation} />
</PiCard>
```

### `<PiAvatar>`
User avatar with online indicator.
```tsx
<PiAvatar src={pioneer.avatar} size={48} online={true} verified={pioneer.isMerchant} />
```

### `<PiBadge>`
Status badge (reputation tier, verification level).
```tsx
<PiBadge variant="gold" icon="star">Gold Seller</PiBadge>
<PiBadge variant="verified" icon="check">Verified Merchant</PiBadge>
```

### `<PiChart>`
Data visualization (bar, line, pie).
```tsx
<PiChart type="bar" data={salesData} height={200} animated={true} />
```

## Input Components

### `<PiTextField>`
Text input with validation.
```tsx
<PiTextField
  label="Search merchants..."
  value={search}
  onChange={setSearch}
  icon="search"
  variant="outlined"
/>
```

### `<PiButton>`
Action button with variants.
```tsx
<PiButton variant="primary" onPress={handleBuy}>Buy Now — 10 Pi</PiButton>
<PiButton variant="secondary" onPress={handleCancel}>Cancel</PiButton>
<PiButton variant="danger" onPress={handleDispute}>Open Dispute</PiButton>
<PiButton variant="ghost" onPress={handleSkip}>Skip</PiButton>
```

### `<PiSwitch>` / `<PiSlider>` / `<PiDatePicker>`
Standard input controls.

## Navigation Components

### `<PiNavBar>`
Top navigation bar.
```tsx
<PiNavBar title="My Shop" back={true} actions={[{icon: "cart", onPress: openCart}]} />
```

### `<PiBottomSheet>`
Modal bottom sheet.
```tsx
<PiBottomSheet visible={showPayment} onDismiss={closePayment}>
  <EscrowPayment amount={10} seller={seller} />
</PiBottomSheet>
```

### `<PiDrawer>`
Side navigation drawer.
```tsx
<PiDrawer visible={menuOpen} position="left">
  <PiColumn padding={16}>
    <PiAvatar src={pioneer.avatar} size={64} />
    <PiText style="title">{pioneer.name}</PiText>
    <ReputationBadge score={pioneer.score} />
    <PiButton variant="ghost" onPress={goToSettings}>Settings</PiButton>
  </PiColumn>
</PiDrawer>
```

## Pi-Specific Components

### `<PiPayButton>`
One-tap Pi payment button with escrow option.
```tsx
<PiPayButton
  amount={10}
  recipient={seller}
  escrow={true}
  milestone={false}
  onSuccess={handlePaymentSuccess}
  onError={handlePaymentError}
/>
```
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| amount | number | required | Payment amount in Pi |
| recipient | Address | required | Seller address |
| escrow | boolean | false | Use PiDCTP escrow protection |
| milestone | boolean | false | Use milestone escrow |
| onSuccess | function | — | Called on successful payment |
| onError | function | — | Called on payment failure |

### `<PioneerCard>`
Pioneer profile card with reputation.
```tsx
<PioneerCard
  address={pioneer.address}
  name={pioneer.name}
  score={pioneer.reputation}
  tier={pioneer.tier}
  badges={pioneer.badges}
  onPress={viewProfile}
/>
```

### `<EscrowStatus>`
Escrow transaction status tracker.
```tsx
<EscrowStatus
  escrowId={escrow.id}
  state={escrow.state}
  amount={escrow.amount}
  milestones={escrow.milestones}
  onConfirm={confirmReceipt}
  onDispute={openDispute}
/>
```

### `<ReputationBadge>`
Reputation tier visual indicator.
```tsx
<ReputationBadge score={850} tier="Platinum" size="medium" showScore={true} />
```
| Tier | Color | Icon |
|------|-------|------|
| Bronze | #CD7F32 | shield |
| Silver | #C0C0C0 | shield |
| Gold | #FFD700 | star |
| Platinum | #E5E4E2 | diamond |
| Diamond | #B9F2FF | diamond |

### `<MerchantProfile>`
Merchant verification card.
```tsx
<MerchantProfile
  merchant={merchant.address}
  name={merchant.name}
  level="Standard"
  category="DigitalGoods"
  verified={true}
  rating={4.8}
  totalOrders={256}
/>
```

## Theme System

### Pi Design Tokens
```json
{
  "colors": {
    "primary": "#6B46F5",
    "secondary": "#9F7AEA",
    "success": "#48BB78",
    "warning": "#ECC94B",
    "error": "#F56565",
    "background": "#FFFFFF",
    "surface": "#F7FAFC",
    "text": "#1A202C",
    "textSecondary": "#718096"
  },
  "spacing": { "xs": 4, "sm": 8, "md": 12, "lg": 16, "xl": 24, "2xl": 32 },
  "radius": { "sm": 4, "md": 8, "lg": 12, "xl": 16, "full": 9999 },
  "elevation": { "none": 0, "sm": 1, "md": 2, "lg": 4 }
}
```
