import { db } from './db';

export interface ParseResult {
  success: boolean;
  orderId?: number;
  orderNumber?: string;
  barcodesExtracted: string[];
  message: string;
}

export async function parseAndFulfillTicketFile(
  file: File,
  targetOrderId?: number
): Promise<ParseResult> {
  const fileName = file.name;
  let extractedBarcodes: string[] = [];

  // Look for barcode pattern in filename or generate simulated barcodes based on file hash/name
  const filenameBarcodeMatch = fileName.match(/(?:BC|BARCODE|TCK)[_-]?([A-Z0-9]{8,14})/i);

  if (filenameBarcodeMatch && filenameBarcodeMatch[1]) {
    extractedBarcodes.push(`BC-${filenameBarcodeMatch[1].toUpperCase()}`);
  } else {
    // Generate deterministic barcodes based on file size and timestamp for POC simulation
    const seed = Math.abs(fileName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + file.size);
    const baseCode = (seed * 9301 + 49297) % 233280;

    extractedBarcodes = [
      `BC-${baseCode}01-TKT`,
      `BC-${baseCode}02-TKT`
    ];
  }

  // Find order to bind to
  let orderToFulfill = targetOrderId
    ? await db.orders.get(targetOrderId)
    : undefined;

  if (!orderToFulfill) {
    // Attempt to match order number from filename (e.g. ORD-91024)
    const orderMatch = fileName.match(/ORD[_-]?(\d+)/i);
    if (orderMatch && orderMatch[1]) {
      const ordNum = `ORD-${orderMatch[1]}`;
      orderToFulfill = await db.orders.where('orderNumber').equals(ordNum).first();
    }
  }

  if (!orderToFulfill) {
    // Grab the earliest pending order
    orderToFulfill = await db.orders.where('fulfillmentStatus').equals('Pending Barcode').first();
  }

  if (!orderToFulfill || !orderToFulfill.id) {
    return {
      success: false,
      barcodesExtracted: extractedBarcodes,
      message: 'No pending order found matching file or in queue to fulfill.',
    };
  }

  // Fill barcodes matching order quantity
  while (extractedBarcodes.length < orderToFulfill.quantity) {
    const idx = extractedBarcodes.length + 1;
    extractedBarcodes.push(`BC-AUTOGEN-${orderToFulfill.orderNumber}-${idx}`);
  }

  if (extractedBarcodes.length > orderToFulfill.quantity) {
    extractedBarcodes = extractedBarcodes.slice(0, orderToFulfill.quantity);
  }

  // Update order in Dexie
  await db.orders.update(orderToFulfill.id, {
    fulfillmentStatus: 'Fulfilled',
    ingestedBarcodes: extractedBarcodes,
  });

  // Update corresponding inventory item status to Delivered
  if (orderToFulfill.inventoryId) {
    await db.inventory.update(orderToFulfill.inventoryId, {
      status: 'Delivered',
      barcodes: extractedBarcodes,
    });
  }

  return {
    success: true,
    orderId: orderToFulfill.id,
    orderNumber: orderToFulfill.orderNumber,
    barcodesExtracted: extractedBarcodes,
    message: `Successfully ingested ${extractedBarcodes.length} barcode(s) for Order ${orderToFulfill.orderNumber}.`,
  };
}
