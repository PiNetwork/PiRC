# Pi Visual Builder — Component Marketplace

## Overview

The Component Marketplace enables Pioneers to publish, discover, and monetize custom visual components for Pi Visual Builder.

## Component Lifecycle

```
Create → Test → Publish → Discover → Install → Use → Rate → Update
```

## Publishing a Component

### Component Package Format
```
my-component/
├── component.json       # Metadata & props definition
├── ui.json              # Visual layout template
├── logic.json           # Default logic blocks
├── styles.css           # Component styles
├── preview.png          # 320x180 preview image
├── README.md            # Usage documentation
└── tests/
    └── basic.test.json  # Visual regression test
```

### component.json
```json
{
  "name": "ProductCard",
  "version": "1.2.0",
  "author": "pioneer:GBCX...XYZ",
  "description": "E-commerce product card with Pi payment integration",
  "category": "commerce",
  "tags": ["product", "card", "payment", "escrow"],
  "piVersion": ">=0.1",
  "props": {
    "title": { "type": "string", "required": true, "default": "" },
    "price": { "type": "number", "required": true, "default": 0 },
    "image": { "type": "uri", "required": false },
    "seller": { "type": "address", "required": true },
    "showReputation": { "type": "boolean", "default": true },
    "escrowEnabled": { "type": "boolean", "default": true },
    "onBuy": { "type": "event" },
    "onDetail": { "type": "event" }
  },
  "dependencies": {
    "@pi/components": ">=1.0.0"
  },
  "license": "MIT",
  "price": 0,
  "verified": false
}
```

## Categories

| Category | Description | Examples |
|----------|-------------|----------|
| **commerce** | Buying & selling | ProductCard, CartView, OrderTracker |
| **social** | Social features | CommentThread, FollowButton, ShareSheet |
| **finance** | Payments & tracking | PiWalletCard, TransactionList, EscrowTracker |
| **content** | Media & information | ArticleView, VideoPlayer, PodcastPlayer |
| **games** | Gaming | Leaderboard, ScoreCard, AchievementBadge |
| **utility** | Tools & helpers | QrScanner, Calculator, TimerWidget |
| **navigation** | App navigation | SideMenu, TabBar, BreadcrumbNav |
| **data** | Data display | DataTable, ChartWidget, StatCard |

## Monetization

### Pricing Models
| Model | Price | Description |
|-------|-------|-------------|
| **Free** | 0 Pi | Open-source, community contribution |
| **One-time** | 1-100 Pi | Single purchase, lifetime updates |
| **Subscription** | 0.5-10 Pi/month | Monthly access with premium support |
| **Freemium** | Free + Premium | Basic free, advanced features paid |

### Revenue Split
| Party | Percentage |
|-------|-----------|
| Component Author | 85% |
| Pi Network (platform fee) | 10% |
| Pi Visual Builder (maintenance) | 5% |

### Payment Flow
```
Pioneer clicks "Install"
  → Pi.pay({ amount: component.price, recipient: marketplace })
  → Component unlocked in builder
  → Revenue split executed automatically
  → Component appears in palette
```

## Verification System

### Pi-Verified Badge
Components can receive a **Pi-Verified** badge after review:

| Criteria | Requirement |
|----------|------------|
| Security | No malicious code, no data exfiltration |
| Performance | Renders in <100ms, <50KB bundle |
| Compatibility | Works with current Pi Browser version |
| Documentation | Complete README with examples |
| Tests | At least 1 visual regression test |

### Verification Process
1. Author submits verification request (free)
2. Pi team reviews code & behavior
3. Component tested on Pi Browser
4. Badge awarded or feedback provided
5. Re-verification required on major updates

## Discovery

### Search & Filter
```
Search: "product card"
Filters: category=commerce, verified=true, price=free, rating>=4
Sort: popular | newest | highest-rated
```

### Rankings
| Signal | Weight |
|--------|--------|
| Install count | 40% |
| Average rating | 30% |
| Verification status | 15% |
| Update recency | 10% |
| Author reputation | 5% |

### Featured Components
Curated by Pi team, rotated weekly. Featured components get:
- Homepage placement
- Pi social media promotion
- 2x visibility in search

## Rating System

```json
{
  "rating": 4.5,
  "count": 128,
  "breakdown": {
    "5_star": 72,
    "4_star": 38,
    "3_star": 12,
    "2_star": 4,
    "1_star": 2
  },
  "reviews": [
    {
      "pioneer": "GBCX...ABC",
      "stars": 5,
      "comment": "Perfect for my Pi shop! Escrow integration works great.",
      "date": "2026-04-15"
    }
  ]
}
```

## Version Management

### Semantic Versioning
- **Major** (1.x.x): Breaking prop changes
- **Minor** (x.1.x): New props, backward compatible
- **Patch** (x.x.1): Bug fixes, no new props

### Update Flow
```
Author publishes v1.2.0
  → Existing users notified: "Update available"
  → User clicks "Update"
  → Changelog displayed
  → Props migration auto-applied
  → Component updated in builder
```

## Security

### Code Review
- All published components scanned for:
  - External network requests (blocked unless whitelisted)
  - Local storage access (sandboxed per component)
  - Pi SDK misuse (only declared permissions)
  - Obfuscated code (rejected)

### Sandboxing
- Components run in isolated scope
- Cannot access other component state
- Pi SDK calls require explicit permission in manifest
- No direct DOM manipulation (use framework APIs only)
