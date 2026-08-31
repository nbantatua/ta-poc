'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import StatCard from '@/components/layout/StatCard';
import {
  Ticket,
  Truck,
  TrendingUp,
  DollarSign,
  PlusCircle,
  Table,
  Zap,
  Clock,
  Radio,
  ArrowRight,
  ShieldCheck,
  Globe,
  AlertTriangle,
} from 'lucide-react';
import { formatCurrency, formatShortDate } from '@/lib/utils';
import { executePricingAutomation } from '@/lib/pricing-engine';

export default function MasterDashboardOverview() {
  const inventory = useLiveQuery(() => db.inventory.toArray()) || [];
  const orders = useLiveQuery(() => db.orders.toArray()) || [];
  const [runningRules, setRunningRules] = useState(false);
  const [automationMessage, setAutomationMessage] = useState<string | null>(null);

  // Metrics
  const totalCapital = inventory.reduce((sum, item) => sum + item.totalCost, 0);
  const availableInventoryCount = inventory.filter((i) => i.status === 'Available').length;
  const pendingOrders = orders.filter((o) => o.fulfillmentStatus === 'Pending Barcode');

  const totalGrossSale = orders.reduce((sum, ord) => sum + ord.totalGrossSale, 0);
  const totalNetPayout = totalGrossSale * 0.85;

  const handleQuickPricingAutomation = async () => {
    setRunningRules(true);
    setAutomationMessage(null);
    try {
      const log = await executePricingAutomation();
      setAutomationMessage(`Automated repricing complete: ${log.itemsUpdated} item(s) adjusted!`);
      setTimeout(() => setAutomationMessage(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setRunningRules(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Alert for Pending Fulfillment if any */}
      {pendingOrders.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between font-mono text-xs text-amber-300">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
            <div>
              <span className="font-bold text-white">Action Required: {pendingOrders.length} Order(s) Awaiting Ticket Barcodes</span>
              <p className="text-[11px] text-amber-400/80">
                Customers are awaiting ticket fulfillment. Drag and drop mock PDF tickets in Stage 3 queue.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/fulfillment"
            className="bg-amber-500 text-gray-950 hover:bg-amber-400 px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1 shrink-0"
          >
            <span>Fulfill Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Capital Deployed"
          value={formatCurrency(totalCapital)}
          subtitle={`${inventory.length} total seeded ticket listings`}
          icon={DollarSign}
          accentColor="text-emerald-400"
        />

        <StatCard
          title="Active Open Inventory"
          value={`${availableInventoryCount} listings`}
          subtitle={`${inventory.filter((i) => i.specListing).length} speculative listings`}
          icon={Ticket}
          accentColor="text-blue-400"
        />

        <StatCard
          title="Pending Order Fulfillment"
          value={`${pendingOrders.length} pending`}
          subtitle={`${orders.filter((o) => o.fulfillmentStatus === 'Fulfilled').length} fulfilled orders`}
          icon={Truck}
          accentColor="text-amber-400"
        />

        <StatCard
          title="Est. Net Revenue Stream"
          value={formatCurrency(totalNetPayout)}
          subtitle="Net payouts after 15% fee"
          icon={TrendingUp}
          accentColor="text-purple-400"
        />
      </div>

      {/* Quick Action & Workflow Launcher Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Pricing Automation Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase">
              <Zap className="w-4 h-4 fill-amber-400" />
              <span>Stage 2 Pricing Engine Automation</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">One-Touch Repricing Rules Engine</h3>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Executes floor undercut rules, 48-hour event time decay rules, and speculative delivery markup calculations across IndexedDB inventory.
            </p>
          </div>

          {automationMessage && (
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-mono">
              {automationMessage}
            </div>
          )}

          <button
            onClick={handleQuickPricingAutomation}
            disabled={runningRules}
            className="w-full bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold font-mono text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
          >
            <Zap className="w-4 h-4 fill-gray-950 text-gray-950" />
            <span>Execute Pricing Rules Now</span>
          </button>
        </div>

        {/* Stage 1 Ingestion Shortcut */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase">
              <PlusCircle className="w-4 h-4" />
              <span>Stage 1 Procurement</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">Ingest Ticket Inventory</h3>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Log new event purchases with cost metrics, payment card references, section/row seating specs, and speculative delivery rules.
            </p>
          </div>

          <Link
            href="/dashboard/procurement"
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold font-mono text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 border border-gray-700 transition"
          >
            <span>Launch Ingestion Form</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Stage 3 Fulfillment Shortcut */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-bold uppercase">
              <Truck className="w-4 h-4" />
              <span>Stage 3 Fulfillment Zone</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">Barcode Dropzone & Matching</h3>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Drag & drop mock ticket PDFs or mobile screenshots to extract barcodes, fulfill orders, and recalculate financial ROI.
            </p>
          </div>

          <Link
            href="/dashboard/fulfillment"
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold font-mono text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition"
          >
            <span>Open Fulfillment Queue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Recent Inventory Preview Grid */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Table className="w-4 h-4 text-blue-400" />
              <span>Live Broadcaster Inventory Feed (Dexie.js Reactive)</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Showing top 6 recently modified listings in client storage</p>
          </div>
          <Link
            href="/dashboard/inventory"
            className="text-xs text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1"
          >
            <span>View Full Spreadsheet Grid ({inventory.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-[10px] uppercase">
                <th className="py-2 px-3">Event Name</th>
                <th className="py-2 px-3">Category</th>
                <th className="py-2 px-3">Event Date</th>
                <th className="py-2 px-3">Seating</th>
                <th className="py-2 px-3 text-right">Cost/Seat</th>
                <th className="py-2 px-3 text-right">List Price</th>
                <th className="py-2 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {inventory.slice(0, 6).map((item) => (
                <tr key={item.id} className="hover:bg-gray-800/30">
                  <td className="py-2.5 px-3 font-bold text-white max-w-[200px] truncate">{item.eventName}</td>
                  <td className="py-2.5 px-3 text-gray-400">{item.category}</td>
                  <td className="py-2.5 px-3 text-gray-300">{formatShortDate(item.eventDate)}</td>
                  <td className="py-2.5 px-3 text-gray-300">
                    Sec {item.section}, Row {item.row} ({item.quantity} Seats)
                  </td>
                  <td className="py-2.5 px-3 text-right text-gray-400">{formatCurrency(item.costPerTicket)}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-blue-400">{formatCurrency(item.listPrice)}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.status === 'Sold'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          : item.specListing
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
