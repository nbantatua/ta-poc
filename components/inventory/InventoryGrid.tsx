'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { InventoryItem, EventCategory, TicketStatus } from '@/types';
import {
  Table,
  Search,
  SlidersHorizontal,
  Radio,
  Clock,
  Zap,
  TrendingDown,
  TrendingUp,
  Tag,
  AlertTriangle,
  Globe,
  Plus,
} from 'lucide-react';
import { formatCurrency, formatDate, formatShortDate } from '@/lib/utils';
import ChannelMappingPanel from './ChannelMappingPanel';
import PricingRuleModal from './PricingRuleModal';
import Link from 'next/link';

export default function InventoryGrid() {
  const inventory = useLiveQuery(() => db.inventory.toArray()) || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedItemForChannels, setSelectedItemForChannels] = useState<InventoryItem | null>(null);
  const [showPricingRulesModal, setShowPricingRulesModal] = useState(false);

  // Filtering
  const filteredItems = inventory.filter((item) => {
    const matchesSearch =
      item.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.row.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.cardReference.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesStatus =
      selectedStatus === 'ALL'
        ? true
        : selectedStatus === 'SPECULATIVE'
        ? item.specListing
        : item.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (item: InventoryItem) => {
    if (item.status === 'Sold') {
      return (
        <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
          SOLD
        </span>
      );
    }
    if (item.status === 'Delivered') {
      return (
        <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
          DELIVERED
        </span>
      );
    }
    if (item.specListing) {
      return (
        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" /> SPECULATIVE
        </span>
      );
    }
    return (
      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
        AVAILABLE
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Controls & Summary Bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by event, venue, section, row, card ref..."
              className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 bg-gray-950 p-1 border border-gray-800 rounded-xl text-xs font-mono">
            {['ALL', 'Concert', 'Sports', 'Theater'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-gray-950 p-1 border border-gray-800 rounded-xl text-xs font-mono">
            {['ALL', 'Available', 'SPECULATIVE', 'Sold'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1.5 rounded-lg transition ${
                  selectedStatus === st
                    ? 'bg-gray-800 text-amber-400 font-bold border border-gray-700'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Rule Matrix Modal Trigger */}
          <button
            onClick={() => setShowPricingRulesModal(true)}
            className="bg-gray-950 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-gray-300 px-3 py-2 rounded-xl text-xs font-mono flex items-center gap-1.5 transition shrink-0"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span>Rule Matrix</span>
          </button>
        </div>

        {/* Dense Counter Strip */}
        <div className="flex items-center justify-between text-xs font-mono border-t border-gray-800/80 pt-2 text-gray-400">
          <div>
            Showing <span className="text-white font-bold">{filteredItems.length}</span> of{' '}
            <span className="text-gray-300">{inventory.length}</span> Total Listings
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>
              Total Capital: <span className="text-emerald-400 font-bold">{formatCurrency(inventory.reduce((acc, i) => acc + i.totalCost, 0))}</span>
            </span>
            <span>
              Total List Value: <span className="text-blue-400 font-bold">{formatCurrency(inventory.reduce((acc, i) => acc + i.listPrice * i.quantity, 0))}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main High-Density Inventory Spreadsheet */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-gray-950 border-b border-gray-800 text-gray-400 text-[11px] uppercase tracking-wider select-none">
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Event & Venue</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Event Date</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3 text-center">Qty</th>
                <th className="py-3 px-3 text-right">Cost/Seat</th>
                <th className="py-3 px-3 text-right">List Price</th>
                <th className="py-3 px-3 text-right">Floor</th>
                <th className="py-3 px-3">Card Ref</th>
                <th className="py-3 px-3 text-center">Syndication Channels</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800/60">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-gray-500 font-mono">
                    No matching inventory items found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const hasPriceDelta = item.priceDelta && item.priceDelta !== 0;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-gray-800/40 transition group ${
                        hasPriceDelta ? 'price-flash' : ''
                      }`}
                    >
                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {getStatusBadge(item)}
                      </td>

                      {/* Event & Venue */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-white max-w-[200px] truncate" title={item.eventName}>
                          {item.eventName}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate max-w-[200px]">
                          {item.venue} ({item.city})
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="text-[10px] bg-gray-950 border border-gray-800 text-gray-300 px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                      </td>

                      {/* Event Date */}
                      <td className="py-3 px-3 whitespace-nowrap text-gray-300">
                        {formatShortDate(item.eventDate)}
                      </td>

                      {/* Location */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="text-white font-bold">Sec {item.section}</span>
                        <span className="text-gray-400">, Row {item.row}</span>
                        <div className="text-[10px] text-gray-500">Seats {item.seatStart}-{item.seatEnd}</div>
                      </td>

                      {/* Qty */}
                      <td className="py-3 px-3 whitespace-nowrap text-center font-bold text-emerald-400">
                        {item.quantity}
                      </td>

                      {/* Cost/Seat */}
                      <td className="py-3 px-3 whitespace-nowrap text-right text-gray-400">
                        {formatCurrency(item.costPerTicket)}
                      </td>

                      {/* List Price with delta highlight */}
                      <td className="py-3 px-3 whitespace-nowrap text-right font-bold">
                        <div className="text-blue-400">{formatCurrency(item.listPrice)}</div>
                        {hasPriceDelta && (
                          <div
                            className={`text-[9px] flex items-center justify-end gap-0.5 font-bold ${
                              (item.priceDelta || 0) < 0 ? 'text-amber-400' : 'text-emerald-400'
                            }`}
                          >
                            {(item.priceDelta || 0) < 0 ? (
                              <TrendingDown className="w-2.5 h-2.5" />
                            ) : (
                              <TrendingUp className="w-2.5 h-2.5" />
                            )}
                            <span>{item.priceDelta && item.priceDelta > 0 ? `+${item.priceDelta}` : item.priceDelta}</span>
                          </div>
                        )}
                      </td>

                      {/* Floor Price */}
                      <td className="py-3 px-3 whitespace-nowrap text-right text-gray-500">
                        {formatCurrency(item.marketFloorPrice)}
                      </td>

                      {/* Card Ref */}
                      <td className="py-3 px-3 whitespace-nowrap text-gray-400 text-[10px]">
                        {item.cardReference}
                      </td>

                      {/* Syndication Channels */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div
                          onClick={() => setSelectedItemForChannels(item)}
                          className="flex items-center justify-center gap-1 bg-gray-950 hover:bg-gray-800 border border-gray-800 p-1.5 rounded-lg cursor-pointer transition"
                          title="Click to toggle broadcasting channels"
                        >
                          <span className={`w-2 h-2 rounded-full ${item.channels.stubhub ? 'bg-indigo-400' : 'bg-gray-700'}`} title="StubHub" />
                          <span className={`w-2 h-2 rounded-full ${item.channels.vividseats ? 'bg-red-400' : 'bg-gray-700'}`} title="Vivid Seats" />
                          <span className={`w-2 h-2 rounded-full ${item.channels.seatgeek ? 'bg-sky-400' : 'bg-gray-700'}`} title="SeatGeek" />
                          <span className={`w-2 h-2 rounded-full ${item.channels.ticketmaster ? 'bg-blue-400' : 'bg-gray-700'}`} title="Ticketmaster" />
                          <Globe className="w-3 h-3 text-gray-400 ml-1" />
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 whitespace-nowrap text-right">
                        <button
                          onClick={() => setSelectedItemForChannels(item)}
                          className="text-[10px] text-blue-400 hover:text-blue-300 font-mono bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded transition"
                        >
                          Channels
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Channel Mapping Drawer/Modal */}
      {selectedItemForChannels && (
        <ChannelMappingPanel
          item={selectedItemForChannels}
          onClose={() => setSelectedItemForChannels(null)}
        />
      )}

      {/* Pricing Rule Matrix Modal */}
      {showPricingRulesModal && (
        <PricingRuleModal onClose={() => setShowPricingRulesModal(false)} />
      )}
    </div>
  );
}
