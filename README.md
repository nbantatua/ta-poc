# Ticket Broker Management Platform (TA-POC)

A modern Next.js-based management system for professional ticket brokers to handle procurement, inventory management, dynamic pricing, and order fulfillment across multiple resale marketplaces.

## Overview

This platform enables ticket brokers to manage the complete lifecycle of ticket inventory from initial purchase through resale fulfillment, with automated pricing rules and real-time inventory tracking. Built with Next.js 14, TypeScript, and Dexie.js for client-side data persistence.

## Tech Stack

- **Framework**: Next.js 14.2.5 with App Router
- **Language**: TypeScript
- **Database**: Dexie.js (IndexedDB wrapper) for client-side reactive storage
- **UI**: React 18.3 with Tailwind CSS
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with custom dark theme

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the dashboard.

### Build & Production

```bash
npm run build
npm start
```

## Business Processes

### Three-Stage Workflow

The platform implements a three-stage business process for ticket brokerage operations:

#### **Stage 1: Procurement & Ingestion**

The ticket acquisition and inventory logging phase.

**Process:**
1. Broker purchases tickets from primary markets (Ticketmaster, venue box offices, presales)
2. Tickets are logged into the system with complete metadata:
   - Event details (name, venue, date, category)
   - Seating information (section, row, seat numbers)
   - Financial metrics (cost per ticket, face value, initial list price)
   - Market intelligence (market floor price)
   - Payment tracking (credit card reference for reconciliation)
   - Delivery specifications (speculative vs. in-hand)

**Key Features:**
- Speculative listing support for tickets not yet received
- Target delivery date tracking for speculative inventory
- Multi-marketplace broadcast channel selection (StubHub, Vivid Seats, SeatGeek, Ticketmaster Resale)
- Barcode tracking for tickets in-hand

**Business Logic:**
- Speculative listings are flagged for special pricing treatment
- Cost basis calculation for ROI tracking
- Card reference enables expense reconciliation across payment methods

---

#### **Stage 2: Dynamic Pricing & Automation**

Automated price optimization based on market conditions and time-based rules.

**Process:**
1. Pricing rules engine continuously evaluates inventory against active rules
2. Three core pricing strategies are automatically applied:

**Pricing Rules:**

1. **Market Floor Undercut Rule**
   - Monitors market floor prices across all broadcast channels
   - Automatically undercuts floor by $2.00 when current list price exceeds floor
   - Enforces minimum margin (10% above cost basis)
   - Ensures competitive positioning without race-to-bottom pricing

2. **48-Hour Event Time Decay Rule**
   - Detects when event date is within 48 hours
   - Applies 5% price reduction to clear aging inventory
   - Protects against holding worthless tickets past event date
   - Maintains minimum margin (5% above cost)

3. **Speculative Delivery Premium Rule**
   - Applies to speculative listings within 7 days of target delivery
   - Adds 8% premium to compensate for delivery risk
   - Incentivizes speculative purchases with higher margins
   - Premium removed once tickets are received

**Automation Execution:**
- One-click bulk repricing via dashboard automation button
- Real-time calculation across entire inventory
- Atomic updates with change tracking (price delta logging)
- Detailed execution logs showing which rules fired for each item

**Financial Intelligence:**
- All rules respect cost basis to prevent loss-making sales
- Price changes are logged with timestamps for audit trail
- Net revenue projections update automatically

---

#### **Stage 3: Order Fulfillment**

Barcode matching and delivery workflow management.

**Process:**
1. Customer places order on marketplace (StubHub, Vivid Seats, etc.)
2. Order synced to platform with fulfillment status "Pending Barcode"
3. Broker receives notification of orders awaiting fulfillment
4. Broker drags and drops ticket PDF/screenshot into fulfillment dropzone
5. System extracts barcodes from uploaded files
6. Barcodes automatically matched to pending orders
7. Matched tickets marked as "Fulfilled"
8. Inventory status updated to "Sold"
9. Financial metrics recalculated (gross sale, net payout after commission)

**Key Features:**
- Visual drag-and-drop fulfillment interface
- Barcode extraction from ticket PDFs and mobile screenshots
- Automatic order-to-inventory matching
- Delivery deadline tracking with urgency indicators
- Real-time fulfillment status updates

**Financial Tracking:**
- Gross sale amount (what customer paid)
- Commission rate (typically 15% marketplace fee)
- Net payout calculation (revenue after fees)
- ROI calculation (net payout vs. cost basis)

---

## Dashboard Features

### Master Dashboard Overview
- **Capital Deployment Metrics**: Total capital invested across all inventory
- **Active Inventory Count**: Available listings vs. sold vs. in-fulfillment
- **Pending Fulfillment Alerts**: Action-required banners for orders awaiting barcodes
- **Revenue Projections**: Estimated net payout after marketplace commissions
- **Quick Actions**: One-touch pricing automation, direct links to all three stages
- **Live Inventory Feed**: Real-time reactive view of recent inventory changes

### Inventory Management (`/dashboard/inventory`)
- Spreadsheet-style grid view of all ticket listings
- Live updates via Dexie.js reactive queries
- Filterable by event category, status, speculative flag
- Visual price change indicators
- Per-item pricing rule configuration
- Marketplace broadcast channel toggles
- Barcode tracking and validation

### Procurement Form (`/dashboard/procurement`)
- Structured intake form for new ticket purchases
- Automatic cost basis and margin calculations
- Speculative vs. in-hand toggle
- Credit card reference for expense tracking
- Multi-marketplace broadcast selection
- Bulk quantity support (multiple seats)

### Fulfillment Queue (`/dashboard/fulfillment`)
- Pending orders sorted by delivery deadline
- Drag-and-drop ticket file upload zone
- Barcode extraction and automatic matching
- Order status tracking (Pending → Fulfilled)
- Marketplace integration indicators
- Financial summary per order

### Analytics Dashboard (`/dashboard/analytics`)
- Profit margin analysis by event category
- ROI tracking across inventory
- Marketplace performance comparison
- Time-based revenue projections
- Cost basis vs. realized revenue

---

## Data Models

### InventoryItem
Core ticket listing entity with pricing, seating, and fulfillment data.

```typescript
{
  id: number
  eventName: string
  category: 'Concert' | 'Sports' | 'Theater'
  eventDate: string (ISO 8601)
  venue: string
  city: string
  section: string
  row: string
  seatStart: string
  seatEnd: string
  quantity: number
  costPerTicket: number
  totalCost: number
  faceValue: number
  listPrice: number
  marketFloorPrice: number
  cardReference: string
  specListing: boolean
  targetDeliveryDate?: string (for speculative listings)
  status: 'Available' | 'Sold' | 'In-Fulfillment' | 'Delivered'
  channels: { stubhub, vividseats, seatgeek, ticketmaster }
  barcodes: string[]
  lastRepricedAt?: string
  priceDelta?: number
}
```

### Order
Customer purchase order from marketplace requiring fulfillment.

```typescript
{
  id: number
  inventoryId: number (links to InventoryItem)
  orderNumber: string
  marketplace: 'StubHub' | 'Vivid Seats' | 'SeatGeek' | 'Ticketmaster Resale'
  eventName: string
  eventDate: string
  section: string
  row: string
  seats: string
  quantity: number
  salePricePerTicket: number
  totalGrossSale: number
  commissionRate: number (0.15 = 15%)
  netPayout: number (gross - commission)
  orderDate: string
  fulfillmentStatus: 'Pending Barcode' | 'Fulfilled' | 'Cancelled'
  ingestedBarcodes: string[]
  deliveryDeadline: string
}
```

### PricingRule
Configurable automation rules for price adjustments.

```typescript
{
  id: number
  name: string
  ruleType: 'UNDER_FLOOR' | 'TIME_DECAY' | 'SPECULATIVE_MARKUP'
  description: string
  isActive: boolean
}
```

---

## Key Business Concepts

### Speculative Listings
Tickets listed for sale before they are physically received. Common scenarios:
- Mobile transfer tickets not yet delivered by original seller
- Will-call tickets to be picked up at venue
- Tickets purchased but awaiting shipping
- Risk premium applied via pricing rules to compensate for delivery uncertainty

### Market Floor Price
The lowest price currently available across all marketplaces for comparable seating. Used as competitive benchmark for undercut pricing strategy.

### Cost Basis Protection
All pricing rules enforce minimum margins above cost basis to prevent loss-making sales, even during aggressive price reductions.

### Marketplace Commission
Resale platforms charge 15% commission (typical) on gross sales. Net payout = gross sale × (1 - commission rate).

### Broadcast Channels
Multi-marketplace listing strategy where same inventory is simultaneously listed on multiple platforms (StubHub, Vivid Seats, etc.) to maximize exposure. When sold on one channel, must be immediately removed from others.

### Card Reference
Payment method tracking for expense reconciliation and credit card rewards optimization (e.g., "Amex Platinum #4821").

---

## File Structure

```
ta-poc-back/
├── app/
│   ├── layout.tsx                 # Root layout with Dexie initialization
│   ├── page.tsx                   # Landing page / login
│   ├── login/
│   │   └── page.tsx              # Authentication page
│   └── dashboard/
│       ├── layout.tsx            # Dashboard shell with navigation
│       ├── page.tsx              # Master dashboard overview
│       ├── procurement/
│       │   └── page.tsx          # Stage 1: Ticket ingestion
│       ├── inventory/
│       │   └── page.tsx          # Inventory grid view
│       ├── fulfillment/
│       │   └── page.tsx          # Stage 3: Order fulfillment
│       └── analytics/
│           └── page.tsx          # Financial analytics
├── components/
│   ├── procurement/
│   │   └── ProcurementForm.tsx   # Ticket intake form
│   ├── inventory/
│   │   ├── InventoryGrid.tsx     # Reactive inventory table
│   │   ├── PricingRuleModal.tsx  # Rule configuration UI
│   │   └── ChannelMappingPanel.tsx # Marketplace toggles
│   ├── fulfillment/
│   │   ├── FulfillmentQueue.tsx  # Order list and filters
│   │   └── TicketDropzone.tsx    # File upload and barcode extraction
│   ├── analytics/
│   │   └── ProfitAnalyzer.tsx    # Financial reporting
│   └── layout/
│       ├── Header.tsx            # Top navigation
│       ├── Sidebar.tsx           # Side navigation
│       └── StatCard.tsx          # Metric display component
├── lib/
│   ├── db.ts                     # Dexie database schema and seed data
│   ├── pricing-engine.ts         # Automated pricing rule execution
│   └── utils.ts                  # Formatting helpers
├── types/
│   └── index.ts                  # TypeScript type definitions
└── tailwind.config.js            # Tailwind theme customization
```

---

## Development Notes

### Database Initialization
The app uses Dexie.js with automatic seeding on first run. 20 sample inventory items and 4 sample orders are pre-populated covering concerts, sports, and theater events.

### Reactive UI
All inventory and order data uses `useLiveQuery` from `dexie-react-hooks` for automatic UI updates when data changes. No manual refresh needed.

### Pricing Engine
The pricing automation runs on-demand via dashboard button. In production, this could be scheduled to run automatically on a cron job.

### Barcode Extraction
Currently simulated with mock barcode data. Production implementation would use OCR or PDF parsing libraries to extract real barcodes from uploaded ticket files.

---

## Future Enhancements

- **API Integration**: Direct marketplace API connections for real-time order syncing
- **OCR Implementation**: Real barcode extraction from uploaded PDF tickets
- **Mobile Responsive**: Optimized mobile views for on-the-go management
- **Multi-User Support**: User authentication and role-based access control
- **Historical Analytics**: Trend analysis and predictive pricing models
- **Automated Repricing**: Scheduled cron-based pricing rule execution
- **Expense Reconciliation**: Credit card statement import and matching
- **Tax Reporting**: 1099-K generation and quarterly tax projections

---

## License

Proprietary - Internal business tool for ticket brokerage operations.

---

## Support

For questions or issues, contact the development team.
