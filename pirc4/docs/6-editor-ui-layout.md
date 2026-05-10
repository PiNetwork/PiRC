# Pi Visual Builder — Editor UI Layout

## Editor Overview

The Pi Visual Builder editor provides a professional, intuitive layout adapted for the Pi Browser environment.

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Pi Logo]  My Pi Shop ▾  │  Design  │  Workflow  │  Data  │  Styles  │  Plugins  │  🤖 AI  │
├────────────┬─────────────────────────────────────────────────┬────────┤
│            │                                                 │        │
│  ELEMENTS  │                                                 │ PROPS  │
│   TREE     │                  CANVAS                         │ EDITOR │
│            │            (WYSIWYG Preview)                    │        │
│  ▾ Page    │                                                 │ ────── │
│    ▾ Header│     ┌─────────────────────────────┐            │ Layout │
│      Logo  │     │     ☕ Pi Coffee Shop        │            │ Appearance│
│      Nav   │     │                             │            │ Content│
│    ▾ Body  │     │  ┌─────┐  ┌─────┐          │            │ Conditional│
│      Hero  │     │  │Eth. │  │Col. │          │            │ Custom │
│      Grid  │     │  │ 5Pi │  │ 4Pi │          │            │        │
│    ▾ Footer│     │  └─────┘  └─────┘          │            │        │
│      Links │     │                             │            │        │
│            │     │  [🛒 Order with Escrow]     │            │        │
│            │     └─────────────────────────────┘            │        │
│            │                                                 │        │
│  NEW +     │   📱 Mobile  📱 Tablet  💻 Desktop  ▶ Preview │        │
├────────────┴─────────────────────────────────────────────────┴────────┤
│  🤖 Pi AI Assistant: "How can I help? Type a prompt or ask me to..."  │
└──────────────────────────────────────────────────────────────────────┘
```

## Top Navigation Bar

| Button | Icon | Function |
|--------|------|----------|
| **App Name** | 📱 | Dropdown: switch pages, backend workflows, settings |
| **Design** | 🎨 | Switch to visual canvas editor |
| **Workflow** | ⚡ | Switch to event/action logic editor |
| **Data** | 🗄️ | Switch to database types & privacy rules |
| **Styles** | 🎭 | Switch to style variables & element styles |
| **Plugins** | 🧩 | Switch to plugin marketplace & API connector |
| **🤖 AI** | 🤖 | Toggle AI Assistant panel |
| **▶ Preview** | ▶ | Live preview in Pi Browser simulator |
| **🚀 Deploy** | 🚀 | Publish app to Pi ecosystem |

## Left Panel: Elements Tree

### Structure
```
▾ index (Page)
  ▾ Header (Group)
    Logo (Image)
    NavLinks (Group)
      Home (Text)
      Shop (Text)
      Orders (Text)
      Profile (Text)
    CartBadge (Icon)
  ▾ Body (Group)
    HeroSection (Group)
      HeroImage (Image)
      HeroTitle (Text)
      HeroSubtitle (Text)
    ProductGrid (RepeatingGroup)
      ▾ ProductCard (Group)
        ProductImage (Image)
        ProductName (Text)
        ProductPrice (Text)
        BuyButton (PiPayButton)
        ReputationBadge (ReputationBadge)
  ▾ Footer (Group)
    Links (Group)
    Copyright (Text)
```

### Elements Tree Buttons
| Button | Function |
|--------|----------|
| **+ New Element** | Add element to canvas (opens element picker) |
| **⬆ ⬇** | Move element up/down in hierarchy |
| **👁** | Show/hide element on canvas |
| **🔒** | Lock element position |
| **📋** | Duplicate element |
| **🗑** | Delete element |

### Element Picker (Popup)
When clicking **+ New Element**, a categorized picker appears:

| Category | Elements |
|----------|----------|
| **Layout** | Group (Container), Column, Row, RepeatingGroup, TabGroup, ScrollView |
| **Text** | Text, Heading, Paragraph, Link, RichText |
| **Input** | TextInput, TextArea, Dropdown, Checkbox, DatePicker, Slider, FileUpload |
| **Button** | Button, IconButton, PiPayButton, LinkButton |
| **Image** | Image, Icon, Avatar, Logo |
| **Media** | Video, Audio, Map, Chart |
| **Navigation** | NavBar, TabBar, Sidebar, BottomSheet, Modal |
| **Pi-Native** | PioneerCard, ReputationBadge, EscrowStatus, MerchantProfile, LoyaltyCard |
| **Custom** | Your custom components from marketplace |

## Center: Canvas (WYSIWYG)

### Canvas Toolbar
| Button | Function |
|--------|----------|
| **📱 Mobile** | Preview at 375px width |
| **📱 Tablet** | Preview at 768px width |
| **💻 Desktop** | Preview at 1280px width |
| **🔍 Zoom** | Zoom in/out on canvas |
| **↩ ↪** | Undo / Redo |
| **📐 Snap** | Toggle snap-to-grid |
| **📏 Guides** | Show alignment guides |
| **▶ Run** | Live preview with working logic |

### Canvas Interactions
- **Click**: Select element → show Property Editor
- **Double-click**: Select element + open Property Editor focused
- **Drag**: Move element on canvas
- **Drag from panel**: Add new element from Elements Tree
- **Right-click**: Context menu (Copy, Paste, Delete, Move to front/back)
- **Ctrl+Z**: Undo
- **Ctrl+S**: Save (auto-save enabled by default)

## Right Panel: Property Editor

### Layout Section
| Field | Type | Description |
|-------|------|-------------|
| **Width** | px / % / fit | Element width |
| **Height** | px / % / fit | Element height |
| **Margin** | top/right/bottom/left | Outer spacing |
| **Padding** | top/right/bottom/left | Inner spacing |
| **Align** | left/center/right/stretch | Horizontal alignment within parent |
| **Float** | none/left/right | Float behavior |
| **Overflow** | visible/hidden/scroll | Content overflow handling |

### Appearance Section
| Field | Type | Description |
|-------|------|-------------|
| **Background** | color / gradient / image | Element background |
| **Border** | width / style / color / radius | Border properties |
| **Shadow** | offset / blur / spread / color | Box shadow |
| **Opacity** | 0-100% | Element transparency |
| **Font** | family / size / weight / color | Typography |
| **Transition** | property / duration / easing | Animation on state change |

### Content Section (Dynamic Data)
| Field | Type | Description |
|-------|------|-------------|
| **Static Text** | string | Fixed text content |
| **Dynamic Data** | 📎 button | Insert data from Data Tab (e.g., `Product's name`) |
| **Conditional** | 🔄 button | Show different content based on condition |

### Conditional Tab
```
┌─────────────────────────────────────────┐
│  Condition 1: When Product's stock = 0   │
│    → Background: #FF0000 (Red)           │
│    → Text: "Out of Stock"                │
│    → Button: Hidden                      │
│                                          │
│  Condition 2: When Product's stock < 5   │
│    → Text: "Only {stock} left!"          │
│    → Background: #FFA500 (Orange)        │
│                                          │
│  [+ Add Condition]                       │
└─────────────────────────────────────────┘
```

## 🤖 AI Assistant Panel (Bottom Bar)

### Layout
```
┌──────────────────────────────────────────────────────────────────┐
│ 🤖 Pi AI Assistant                                    [✕ Close] │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🤖 Hi! I'm your Pi AI Assistant. I can:                        │
│     • Build UI elements and pages                                │
│     • Create workflows and logic                                 │
│     • Set up database schemas                                    │
│     • Connect APIs and plugins                                   │
│     • Fix bugs and optimize performance                          │
│                                                                  │
│  🧑 "Build a product listing page with escrow payment"          │
│                                                                  │
│  🤖 I'll create that for you! Here's what I'm doing:            │
│     ✅ Created RepeatingGroup "ProductGrid"                      │
│     ✅ Added ProductCard with Image, Name, Price                 │
│     ✅ Added PiPayButton with escrow enabled                     │
│     ✅ Created "Product" data type with fields                   │
│     ✅ Added "When BuyButton clicked → Create Escrow" workflow   │
│                                                                  │
│  🧑 "Make it look more professional"                            │
│                                                                  │
│  🤖 I've updated the design:                                     │
│     ✅ Applied Pi Design System theme                            │
│     ✅ Added card shadows and rounded corners                    │
│     ✅ Improved spacing and typography                           │
│     ✅ Added ReputationBadge next to each seller                 │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  Type your request here...                      ➤ Send│       │
│  └──────────────────────────────────────────────────────┘       │
└──────────────────────────────────────────────────────────────────┘
```

### AI Quick Actions
| Button | Action |
|--------|--------|
| **🎨 Build UI** | "Describe what you want to build" |
| **⚡ Add Logic** | "What should happen when..." |
| **🗄️ Create Data** | "What data does your app need?" |
| **🔗 Connect API** | "What external service to connect?" |
| **🐛 Fix Issue** | "Describe the problem you're seeing" |
| **✨ Improve Design** | "Make it look better / more professional" |

### AI Capabilities by Tab
| Tab | What AI Can Do |
|-----|----------------|
| **Design** | Create elements, apply styles, build responsive layouts, add Pi components |
| **Workflow** | Build event-action chains, add conditional logic, create custom workflows |
| **Data** | Create data types, define fields, set up relations, configure privacy rules |
| **Styles** | Generate theme colors, create style variables, apply consistent branding |
| **Plugins** | Recommend plugins, configure API connections, set up Pi SDK integration |

## Workflow Tab Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Pi Logo]  My Pi Shop ▾  │  Design  │ ⚡Workflow│  Data  │  ...   │
├────────────┬─────────────────────────────────────────────────────────┤
│            │                                                         │
│  EVENTS    │               WORKFLOW CANVAS                           │
│            │                                                         │
│  📄 Page   │  ┌─────────────────────────────────────────────────┐    │
│   Events   │  │  When: BuyButton is clicked                     │    │
│            │  │  ┌───────────────────────────────────────────┐  │    │
│  🖱️ Element│  │  │ Step 1: Show element "LoadingSpinner"     │  │    │
│   Events   │  │  └───────────────────────────────────────────┘  │    │
│            │  │  ┌───────────────────────────────────────────┐  │    │
│  ⏰ Custom │  │  │ Step 2: Pi → Create Escrow                 │  │    │
│  Workflows │  │  │   buyer = Current Pioneer                  │  │    │
│            │  │  │   seller = Product's owner                 │  │    │
│  📅 Sched. │  │  │   amount = Product's price                │  │    │
│  Workflows │  │  └───────────────────────────────────────────┘  │    │
│            │  │  ┌───────────────────────────────────────────┐  │    │
│  🔗 API    │  │  │ Step 3: Navigate to "EscrowStatus" page   │  │    │
│  Workflows │  │  └───────────────────────────────────────────┘  │    │
│            │  │                                                     │    │
│  🪙 Pi     │  │  [+ Add Step]                                       │    │
│  Workflows │  └─────────────────────────────────────────────────┘    │
│            │                                                         │
│  [+ New]   │  ─────────────────────────────────────────────────────  │
│            │  🤖 "I need a workflow that handles expired escrows"    │
├────────────┴─────────────────────────────────────────────────────────┤
│  🤖 Pi AI: "How can I help with your workflows?"                    │
└──────────────────────────────────────────────────────────────────────┘
```

### Workflow Step Types
| Category | Steps Available |
|----------|----------------|
| **Element** | Show/Hide, Animate, Scroll to, Set state |
| **Data** | Create record, Update record, Delete record, Make changes to list |
| **Navigation** | Go to page, Go to page with data, Open popup, Close popup |
| **Pi Payments** | Send Pi, Create Escrow, Confirm Receipt, Create Milestone Escrow |
| **Pi Trust** | Get Reputation, Award Badge, Create Attestation, Verify Merchant |
| **Pi Dispute** | Open Dispute, Submit Evidence, Execute Ruling |
| **Pi Loyalty** | Earn Points, Redeem Reward |
| **API** | Call API, Call Pi SDK method |
| **Logic** | If/Else, Custom Event, Pause, Resume, Cancel |
| **Utility** | Set variable, Run JavaScript, Send email, Show toast |

## Data Tab Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Pi Logo]  My Pi Shop ▾  │  Design  │  Workflow  │ 🗄️Data│  ...  │
├────────────┬─────────────────────────────────────────────────────────┤
│            │                                                         │
│  DATA      │              DATA TYPE: Product                         │
│  TYPES     │                                                         │
│            │  Fields:                                                │
│  📦 Product│  ┌──────────┬──────────┬────────┬──────────────────┐    │
│  📦 Order  │  │ Field    │ Type     │ Linked │ Privacy          │    │
│  📦 Review │  ├──────────┼──────────┼────────┼──────────────────┤    │
│  📦 Merchant│ │ name     │ text     │ —      │ Public (read)    │    │
│  📦 Pioneer│ │ price    │ number   │ —      │ Public (read)    │    │
│            │ │ image    │ image    │ —      │ Public (read)    │    │
│  [+ New    │ │ stock    │ number   │ —      │ Seller (write)   │    │
│   Type]    │ │ seller   │ Pioneer  │ 🔗     │ Public (read)    │    │
│            │ │ category │ option   │ —      │ Public (read)    │    │
│            │ │ escrow   │ Escrow   │ 🔗     │ Owner (read)     │    │
│            │ └──────────┴──────────┴────────┴──────────────────┘    │
│            │                                                         │
│            │  [+ Add Field]                                          │
│            │                                                         │
│            │  🤖 "I need a review system for products"              │
├────────────┴─────────────────────────────────────────────────────────┤
│  🤖 Pi AI: "I'll create a Review data type linked to Product"       │
└──────────────────────────────────────────────────────────────────────┘
```

### Field Types
| Type | Icon | Description | PiDCTP Link |
|------|------|-------------|-------------|
| **text** | Aa | Short text string | — |
| **number** | # | Numeric value | — |
| **boolean** | ✓ | True/false | — |
| **date** | 📅 | Date/time | — |
| **image** | 🖼️ | Image file | — |
| **address** | 📍 | Pi wallet address | Pioneer/Merchant |
| **option** | 📋 | Predefined choice | EscrowState, Tier, Category |
| **relation** | 🔗 | Link to another type | Order → Escrow, Product → Merchant |
| **geographic** | 🌍 | Lat/lng coordinates | — |
| **file** | 📎 | File attachment | — |

## Styles Tab Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Pi Logo]  My Pi Shop ▾  │  Design  │  ...  │ 🎭Styles│  ...     │
├────────────┬─────────────────────────────────────────────────────────┤
│            │                                                         │
│  STYLE     │              STYLE VARIABLES                            │
│  VARIABLES │                                                         │
│            │  🎨 Colors                                              │
│  🎨 Colors │  ┌──────────────┬──────────┬──────────────────┐        │
│  🔤 Fonts  │  │ Variable     │ Value    │ Used By           │        │
│  📐 Spacing│  ├──────────────┼──────────┼──────────────────┤        │
│  📏 Radius │  │ pi-primary  │ #6B46F5  │ Buttons, Links    │        │
│            │  │ pi-success  │ #48BB78  │ Confirmations     │        │
│  [+ New]   │  │ pi-error    │ #F56565  │ Errors, Disputes  │        │
│            │  │ pi-bg       │ #FFFFFF  │ Page backgrounds  │        │
│            │  └──────────────┴──────────┴──────────────────┘        │
│            │                                                         │
│  ELEMENT   │  🔤 Fonts                                               │
│  STYLES    │  ┌──────────────┬──────────┬──────────────────┐        │
│            │  │ Variable     │ Value    │ Used By           │        │
│  📦 Button │  ├──────────────┼──────────┼──────────────────┤        │
│  📦 Card   │  │ pi-heading  │ 24px/600 │ Page titles       │        │
│  📦 Input  │  │ pi-body     │ 14px/400 │ Body text         │        │
│  📦 Badge  │  │ pi-caption  │ 12px/400 │ Labels, hints     │        │
│            │  └──────────────┴──────────┴──────────────────┘        │
│  [+ New]   │                                                         │
│            │  🤖 "Generate a dark theme for my app"                  │
├────────────┴─────────────────────────────────────────────────────────┤
│  🤖 Pi AI: "I've created dark theme variables. Apply them?"         │
└──────────────────────────────────────────────────────────────────────┘
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Ctrl+Z** | Undo |
| **Ctrl+Y** | Redo |
| **Ctrl+S** | Save |
| **Ctrl+C** | Copy element |
| **Ctrl+V** | Paste element |
| **Delete** | Delete selected |
| **Ctrl+D** | Duplicate element |
| **Ctrl+G** | Group selected elements |
| **Ctrl+Shift+G** | Ungroup |
| **Ctrl+Enter** | Preview app |
| **Ctrl+/ ** | Toggle AI Assistant |
| **Ctrl+1** | Switch to Design tab |
| **Ctrl+2** | Switch to Workflow tab |
| **Ctrl+3** | Switch to Data tab |
| **Ctrl+4** | Switch to Styles tab |
| **Ctrl+5** | Switch to Plugins tab |
