export type EventCategory = 'Concert' | 'Sports' | 'Theater';

export type TicketStatus = 'Available' | 'Sold' | 'In-Fulfillment' | 'Delivered';

export type FulfillmentStatus = 'Pending Barcode' | 'Fulfilled' | 'Cancelled';

export interface BroadcasterChannels {
  stubhub: boolean;
  vividseats: boolean;
  seatgeek: boolean;
  ticketmaster: boolean;
}

export interface InventoryItem {
  id?: number;
  eventName: string;
  category: EventCategory;
  eventDate: string; // ISO date string
  venue: string;
  city: string;
  section: string;
  row: string;
  seatStart: string;
  seatEnd: string;
  quantity: number;
  costPerTicket: number;
  totalCost: number;
  faceValue: number;
  listPrice: number;
  marketFloorPrice: number;
  cardReference: string;
  specListing: boolean;
  targetDeliveryDate?: string;
  status: TicketStatus;
  channels: BroadcasterChannels;
  barcodes: string[];
  lastRepricedAt?: string;
  priceDelta?: number; // Stores price change for visual feedback
}

export interface Order {
  id?: number;
  inventoryId: number;
  orderNumber: string;
  marketplace: 'StubHub' | 'Vivid Seats' | 'SeatGeek' | 'Ticketmaster Resale';
  eventName: string;
  eventDate: string;
  section: string;
  row: string;
  seats: string;
  quantity: number;
  salePricePerTicket: number;
  totalGrossSale: number;
  commissionRate: number; // Default 0.15 (15%)
  netPayout: number;
  orderDate: string;
  fulfillmentStatus: FulfillmentStatus;
  ingestedBarcodes: string[];
  deliveryDeadline: string;
}

export interface PricingRule {
  id?: number;
  name: string;
  ruleType: 'UNDER_FLOOR' | 'TIME_DECAY' | 'SPECULATIVE_MARKUP';
  description: string;
  isActive: boolean;
}

export interface AutomationLog {
  timestamp: string;
  itemsUpdated: number;
  totalDelta: number;
  details: string[];
}
