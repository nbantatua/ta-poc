import { db } from './db';
import { InventoryItem, AutomationLog } from '../types';

export async function executePricingAutomation(): Promise<AutomationLog> {
  const items = await db.inventory.where('status').equals('Available').toArray();
  const allRules = await db.pricingRules.toArray();
  const rules = allRules.filter(r => r.isActive);

  let itemsUpdated = 0;
  let totalDelta = 0;
  const details: string[] = [];
  const now = new Date();

  for (const item of items) {
    let newPrice = item.listPrice;
    let delta = 0;
    const itemLogs: string[] = [];

    // Rule 1: Market Floor Undercut
    const floorRule = rules.find(r => r.ruleType === 'UNDER_FLOOR');
    if (floorRule && item.listPrice > item.marketFloorPrice) {
      const calculatedTarget = Math.max(item.marketFloorPrice - 2.00, item.costPerTicket * 1.10);
      if (calculatedTarget < newPrice) {
        const drop = newPrice - calculatedTarget;
        newPrice = calculatedTarget;
        itemLogs.push(`Undercut floor by $2.00 (-$${drop.toFixed(2)})`);
      }
    }

    // Rule 2: 48-Hour Event Time Decay
    const timeDecayRule = rules.find(r => r.ruleType === 'TIME_DECAY');
    if (timeDecayRule && item.eventDate) {
      const eventTime = new Date(item.eventDate).getTime();
      const hoursUntilEvent = (eventTime - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntilEvent > 0 && hoursUntilEvent <= 48) {
        const decayTarget = Math.max(newPrice * 0.95, item.costPerTicket * 1.05);
        if (decayTarget < newPrice) {
          const drop = newPrice - decayTarget;
          newPrice = decayTarget;
          itemLogs.push(`48h event decay -5% (-$${drop.toFixed(2)})`);
        }
      }
    }

    // Rule 3: Speculative Delivery Premium
    const specRule = rules.find(r => r.ruleType === 'SPECULATIVE_MARKUP');
    if (specRule && item.specListing && item.targetDeliveryDate) {
      const delivTime = new Date(item.targetDeliveryDate).getTime();
      const daysUntilDelivery = (delivTime - now.getTime()) / (1000 * 60 * 60 * 24);

      if (daysUntilDelivery > 0 && daysUntilDelivery <= 7) {
        const specTarget = newPrice * 1.08;
        const increase = specTarget - newPrice;
        newPrice = specTarget;
        itemLogs.push(`Speculative deadline premium +8% (+$${increase.toFixed(2)})`);
      }
    }

    // Round to 2 decimal places
    newPrice = Math.round(newPrice * 100) / 100;
    delta = Math.round((newPrice - item.listPrice) * 100) / 100;

    if (delta !== 0 && item.id) {
      itemsUpdated++;
      totalDelta += delta;

      await db.inventory.update(item.id, {
        listPrice: newPrice,
        priceDelta: delta,
        lastRepricedAt: now.toISOString(),
      });

      details.push(
        `${item.eventName} (${item.section} R${item.row}): $${item.listPrice.toFixed(2)} → $${newPrice.toFixed(2)} [${itemLogs.join(', ')}]`
      );
    }
  }

  return {
    timestamp: now.toISOString(),
    itemsUpdated,
    totalDelta: Math.round(totalDelta * 100) / 100,
    details: details.length > 0 ? details : ['All active inventory is already optimally priced based on active rule matrices.'],
  };
}
