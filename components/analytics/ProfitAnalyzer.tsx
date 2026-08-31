'use client';

import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import {
  TrendingUp,
  DollarSign,
  PieChart,
  Percent,
  CreditCard,
  Building2,
  Ticket,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import StatCard from '../layout/StatCard';

export default function ProfitAnalyzer() {
  const inventory = useLiveQuery(() => db.inventory.toArray()) || [];
  const orders = useLiveQuery(() => db.orders.toArray()) || [];

  // Financial Calculations
  const totalCapitalDeployed = inventory.reduce((sum, item) => sum + item.totalCost, 0);

  const totalGrossSale = orders.reduce((sum, ord) => sum + ord.totalGrossSale, 0);
  const totalCommissionsDeducted = orders.reduce((sum, ord) => sum + ord.totalGrossSale * ord.commissionRate, 0);
  const totalNetPayout = totalGrossSale - totalCommissionsDeducted;

  // Match sold orders back to inventory cost to calculate net profit on sold inventory
  const soldInventoryIds = new Set(orders.map((o) => o.inventoryId));
  const soldInventoryCost = inventory
    .filter((item) => item.id && (soldInventoryIds.has(item.id) || item.status === 'Sold' || item.status === 'Delivered'))
    .reduce((sum, item) => sum + item.totalCost, 0);

  const netProfit = totalNetPayout - soldInventoryCost;
  const netROI = soldInventoryCost > 0 ? (netProfit / soldInventoryCost) * 100 : 0;

  // Breakdown by Category
  const categories = ['Concert', 'Sports', 'Theater'] as const;
  const categoryStats = categories.map((cat) => {
    const catItems = inventory.filter((i) => i.category === cat);
    const catCapital = catItems.reduce((acc, i) => acc + i.totalCost, 0);
    const catOrders = orders.filter((o) => {
      const matchItem = inventory.find((inv) => inv.id === o.inventoryId);
      return matchItem?.category === cat;
    });
    const catGross = catOrders.reduce((acc, o) => acc + o.totalGrossSale, 0);
    const catNet = catGross * 0.85;

    return {
      category: cat,
      itemCount: catItems.length,
      capital: catCapital,
      gross: catGross,
      netPayout: catNet,
    };
  });

  // Breakdown by Marketplace Channel
  const marketplaces = ['StubHub', 'Vivid Seats', 'SeatGeek', 'Ticketmaster Resale'];
  const marketplaceStats = marketplaces.map((mp) => {
    const mpOrders = orders.filter((o) => o.marketplace === mp);
    const gross = mpOrders.reduce((sum, o) => sum + o.totalGrossSale, 0);
    const commission = gross * 0.15;
    const net = gross - commission;

    return {
      marketplace: mp,
      orderCount: mpOrders.length,
      gross,
      commission,
      net,
    };
  });

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Capital Deployed"
          value={formatCurrency(totalCapitalDeployed)}
          subtitle={`${inventory.length} total seeded ticket listings`}
          icon={CreditCard}
          accentColor="text-emerald-400"
        />

        <StatCard
          title="Gross Sales Stream"
          value={formatCurrency(totalGrossSale)}
          subtitle={`${orders.length} total sold transactions`}
          icon={DollarSign}
          accentColor="text-blue-400"
        />

        <StatCard
          title="Marketplace Fees (15%)"
          value={formatCurrency(totalCommissionsDeducted)}
          subtitle="Deducted StubHub/Vivid commission"
          icon={PieChart}
          accentColor="text-amber-400"
        />

        <StatCard
          title="Net ROI Metric"
          value={`+${netROI.toFixed(1)}%`}
          subtitle={`Net Profit: ${formatCurrency(netProfit)}`}
          icon={TrendingUp}
          trend={`+${formatCurrency(netProfit)} net payout`}
          trendPositive={netProfit >= 0}
          accentColor="text-purple-400"
        />
      </div>

      {/* Financial Stream Summary Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Capital Reconciliation & Revenue Waterfall</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Financial performance log deducting 15% marketplace commission streams from gross revenue payouts.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-1">
            <span className="text-gray-400 text-[11px] uppercase">Gross Revenue Payout Stream</span>
            <div className="text-xl font-bold text-white">{formatCurrency(totalGrossSale)}</div>
            <p className="text-[10px] text-gray-500">100% Marketplace GMV</p>
          </div>

          <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-1">
            <span className="text-amber-400 text-[11px] uppercase">15% Marketplace Commissions</span>
            <div className="text-xl font-bold text-amber-400">-{formatCurrency(totalCommissionsDeducted)}</div>
            <p className="text-[10px] text-gray-500">Standard broker takeaway fee</p>
          </div>

          <div className="bg-gray-950 p-4 rounded-xl border border-blue-500/30 space-y-1">
            <span className="text-blue-400 text-[11px] uppercase">Net Payout Received</span>
            <div className="text-xl font-bold text-blue-400">{formatCurrency(totalNetPayout)}</div>
            <p className="text-[10px] text-emerald-400 font-bold">Net Payout Efficiency: 85.0%</p>
          </div>
        </div>
      </div>

      {/* Two-Column Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
        {/* Category Performance Breakdown */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-3 text-sm font-bold text-white uppercase">
            <Ticket className="w-4 h-4 text-emerald-400" />
            <span>Category Performance Breakdown</span>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-[10px] uppercase">
                <th className="py-2">Category</th>
                <th className="py-2 text-center">Listings</th>
                <th className="py-2 text-right">Capital</th>
                <th className="py-2 text-right">Net Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {categoryStats.map((c) => (
                <tr key={c.category} className="hover:bg-gray-800/30">
                  <td className="py-3 font-bold text-white">{c.category}</td>
                  <td className="py-3 text-center text-gray-400">{c.itemCount}</td>
                  <td className="py-3 text-right text-gray-300">{formatCurrency(c.capital)}</td>
                  <td className="py-3 text-right font-bold text-emerald-400">
                    {formatCurrency(c.netPayout)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Marketplace Broadcaster Breakdown */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-3 text-sm font-bold text-white uppercase">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>Broadcaster Channel Performance</span>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-[10px] uppercase">
                <th className="py-2">Marketplace</th>
                <th className="py-2 text-center">Orders</th>
                <th className="py-2 text-right">Gross GMV</th>
                <th className="py-2 text-right">Net Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {marketplaceStats.map((mp) => (
                <tr key={mp.marketplace} className="hover:bg-gray-800/30">
                  <td className="py-3 font-bold text-white">{mp.marketplace}</td>
                  <td className="py-3 text-center text-gray-400">{mp.orderCount}</td>
                  <td className="py-3 text-right text-gray-300">{formatCurrency(mp.gross)}</td>
                  <td className="py-3 text-right font-bold text-blue-400">
                    {formatCurrency(mp.net)}
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
