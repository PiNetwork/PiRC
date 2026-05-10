# Pi Visual Builder — Logic Blocks Specification

## Event Blocks

### UI Events
| Block | Trigger | Properties |
|-------|---------|------------|
| `onTap` | User taps component | target, tapCount |
| `onLongPress` | Long press (500ms) | target |
| `onSwipe` | Swipe gesture | target, direction (left/right/up/down) |
| `onScroll` | Scroll event | target, position, direction |
| `onTextChange` | Text input changes | target, value |
| `onFocus` / `onBlur` | Focus events | target |
| `onSubmit` | Form submission | target, values |

### Lifecycle Events
| Block | Trigger | Properties |
|-------|---------|------------|
| `onScreenLoad` | Screen enters view | params |
| `onScreenUnload` | Screen leaves view | — |
| `onPullRefresh` | Pull-to-refresh triggered | — |
| `onTimer` | Periodic timer (ms) | interval, repeat |

### Pi Events
| Block | Trigger | Properties |
|-------|---------|------------|
| `onPaymentSuccess` | Pi payment completed | txHash, amount |
| `onPaymentError` | Pi payment failed | error, code |
| `onEscrowStateChange` | Escrow state updated | escrowId, newState |
| `onAuthComplete` | Pioneer authenticated | address, profile |
| `onDisputeRuling` | Dispute ruling issued | disputeId, ruling |

## Logic Blocks

### Conditional
```
┌─────────────┐
│   if/else    │
│  condition   │
├──────┬──────┤
│ then │ else │
└──────┴──────┘
```
```json
{ "type": "if", "condition": "${cart.total} > 100", "then": [...actions], "else": [...actions] }
```

### Loop
```
┌─────────────┐
│  forEach     │
│  ${items}    │
├─────────────┤
│  item body   │
└─────────────┘
```
```json
{ "type": "forEach", "collection": "${products}", "itemVar": "product", "body": [...actions] }
```

### Switch
```json
{ "type": "switch", "value": "${escrow.state}", "cases": { "Funded": [...], "Completed": [...], "Disputed": [...] }, "default": [...] }
```

### Try/Catch
```json
{ "type": "try", "body": [...actions], "catch": [{ "type": "showToast", "message": "${error.message}" }] }
```

## Data Blocks

### Variables
| Block | Description |
|-------|-------------|
| `setVar` | Set variable value |
| `getVar` | Get variable value |
| `setList` | Add/remove list items |
| `getList` | Get list item by index |
| `setMap` | Set map key/value |
| `getMap` | Get map value by key |

### API Calls
```json
{ "type": "apiCall", "method": "GET", "url": "https://api.example.com/products", "headers": {"Authorization": "Bearer ${token}"}, "onSuccess": [...actions], "onError": [...actions] }
```

### Local Storage
| Block | Description |
|-------|-------------|
| `storeSave` | Save key/value to Pi Browser storage |
| `storeLoad` | Load value by key |
| `storeDelete` | Delete key |

## Navigation Blocks

| Block | Description |
|-------|-------------|
| `navigate` | Go to screen |
| `goBack` | Return to previous screen |
| `openUrl` | Open external URL in Pi Browser |
| `showToast` | Show toast notification |
| `showAlert` | Show alert dialog |
| `closeSheet` | Close bottom sheet |

## Pi-Specific Blocks

### Authentication
```json
{ "type": "pi.auth", "action": "login", "onSuccess": [{ "type": "setVar", "name": "pioneer", "value": "${auth.profile}" }], "onError": [{ "type": "showToast", "message": "Login failed" }] }
```

### Payments
```json
{ "type": "pi.pay", "amount": "${product.price}", "recipient": "${seller}", "escrow": true, "onSuccess": [{ "type": "navigate", "screen": "receipt" }], "onError": [{ "type": "showToast", "message": "Payment failed" }] }
```

### Escrow (PiDCTP)
```json
{ "type": "pi.createEscrow", "buyer": "${pioneer}", "seller": "${merchant}", "amount": "${total}", "token": "PI", "deliveryDeadline": "${deadline}", "onSuccess": [{ "type": "setVar", "name": "escrowId", "value": "${result.escrowId}" }] }
```

```json
{ "type": "pi.confirmReceipt", "escrowId": "${escrowId}", "onSuccess": [{ "type": "showToast", "message": "Receipt confirmed!" }] }
```

### Milestone Escrow
```json
{ "type": "pi.createMilestoneEscrow", "buyer": "${pioneer}", "seller": "${merchant}", "totalAmount": "${total}", "milestones": [ { "amount": 30, "description": "Design phase" }, { "amount": 40, "description": "Development phase" }, { "amount": 30, "description": "Delivery phase" } ] }
```

### Reputation
```json
{ "type": "pi.getReputation", "address": "${seller}", "onSuccess": [{ "type": "setVar", "name": "sellerRep", "value": "${result}" }] }
```

### Dispute
```json
{ "type": "pi.openDispute", "escrowId": "${escrowId}", "category": "NotAsDescribed", "evidence": "${evidenceHash}", "onSuccess": [{ "type": "navigate", "screen": "dispute_status" }] }
```

### Merchant
```json
{ "type": "pi.verifyMerchant", "address": "${merchant}", "onSuccess": [{ "type": "setVar", "name": "isVerified", "value": "${result.verified}" }] }
```

### Loyalty
```json
{ "type": "pi.earnLoyalty", "pioneer": "${pioneer}", "action": "escrow_complete", "amount": 15 }
```

### Subscription (PiRC2)
```json
{ "type": "pi.subscribe", "planId": "${plan.id}", "onSuccess": [{ "type": "showToast", "message": "Subscribed!" }] }
```

## Full Example: E-Commerce App Logic

```json
{
  "screen": "product_detail",
  "events": [
    {
      "trigger": "onScreenLoad",
      "actions": [
        { "type": "pi.getReputation", "address": "${product.seller}", "onSuccess": [{ "type": "setVar", "name": "sellerRep", "value": "${result}" }] },
        { "type": "apiCall", "method": "GET", "url": "/api/products/${productId}", "onSuccess": [{ "type": "setVar", "name": "product", "value": "${result}" }] }
      ]
    },
    {
      "trigger": "onTap",
      "target": "buyButton",
      "actions": [
        { "type": "if", "condition": "${sellerRep.score} >= 200", "then": [
          { "type": "pi.createEscrow", "buyer": "${pioneer}", "seller": "${product.seller}", "amount": "${product.price}", "onSuccess": [
            { "type": "showToast", "message": "Escrow created! Funds protected." },
            { "type": "navigate", "screen": "escrow_status" }
          ]}
        ], "else": [
          { "type": "showAlert", "title": "Low Reputation", "message": "This seller has low reputation. Continue without escrow?" }
        ]}
      ]
    },
    {
      "trigger": "onTap",
      "target": "disputeButton",
      "actions": [
        { "type": "pi.openDispute", "escrowId": "${escrowId}", "category": "NotAsDescribed", "evidence": "${screenshotHash}", "onSuccess": [
          { "type": "showToast", "message": "Dispute opened. Jurors will review." },
          { "type": "navigate", "screen": "dispute_status" }
        ]}
      ]
    }
  ]
}
```
