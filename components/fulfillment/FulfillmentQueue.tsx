'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Order, FulfillmentStatus } from '@/types';
import {
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Barcode,
  Search,
  FileCheck,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { formatCurrency, formatDate, formatShortDate } from '@/lib/utils';
import TicketDropzone from './TicketDropzone';

export default function FulfillmentQueue() {
  const orders = useLiveQuery(() => db.orders.toArray()) || [];
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrderForDrop, setSelectedOrderForDrop] = useState<Order | null>(null);

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.marketplace.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ? true : ord.fulfillmentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = orders.filter((o) => o.fulfillmentStatus === 'Pending Barcode').length;
  const fulfilledCount = orders.filter((o) => o.fulfillmentStatus === 'Fulfilled').length;

  return (
    <div className="space-y-6">
      {/* Stage 3 Dropzone Section */}
      <TicketDropzone
        selectedOrderId={selectedOrderForDrop?.id}
        onFulfillSuccess={() => setSelectedOrderForDrop(null)}
      />

      {/* Filter & Summary Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search order #, event, marketplace..."
              className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-gray-950 p-1 border border-gray-800 rounded-xl">
            {['ALL', 'Pending Barcode', 'Fulfilled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  statusFilter === st
                    ? 'bg-purple-600 text-white font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{pendingCount} Pending Barcode</span>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{fulfilledCount} Complete</span>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl overflow-hidden font-mono text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-950 border-b border-gray-800 text-gray-400 text-[11px] uppercase tracking-wider select-none">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Marketplace</th>
                <th className="py-3 px-4">Event Details</th>
                <th className="py-3 px-4">Seating</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Gross Sale</th>
                <th className="py-3 px-4 text-right">Net Payout</th>
                <th className="py-3 px-4">Delivery Deadline</th>
                <th className="py-3 px-4">Fulfillment Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-gray-500">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const isPending = ord.fulfillmentStatus === 'Pending Barcode';
                  const isSelectedForDrop = selectedOrderForDrop?.id === ord.id;

                  return (
                    <tr
                      key={ord.id}
                      className={`hover:bg-gray-800/40 transition ${
                        isSelectedForDrop ? 'bg-purple-900/20 border-l-4 border-l-purple-500' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                        {ord.orderNumber}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="bg-gray-950 border border-gray-800 text-gray-300 px-2 py-0.5 rounded text-[10px]">
                          {ord.marketplace}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white max-w-[220px] truncate" title={ord.eventName}>
                          {ord.eventName}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          Event: {formatShortDate(ord.eventDate)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-gray-300">
                        Sec {ord.section}, Row {ord.row} (Seats {ord.seats})
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-emerald-400">
                        {ord.quantity}
                      </td>

                      <td className="py-3.5 px-4 text-right text-gray-300">
                        {formatCurrency(ord.totalGrossSale)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-blue-400">
                        {formatCurrency(ord.netPayout)}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-gray-400">
                        {formatDate(ord.deliveryDeadline)}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isPending ? (
                          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-max">
                            <Clock className="w-3 h-3" /> PENDING BARCODE
                          </span>
                        ) : (
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3 h-3" /> FULFILLED
                          </span>
                        )}

                        {ord.ingestedBarcodes && ord.ingestedBarcodes.length > 0 && (
                          <div className="text-[9px] text-gray-500 mt-0.5 truncate max-w-[140px]">
                            {ord.ingestedBarcodes.join(', ')}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {isPending ? (
                          <button
                            onClick={() => setSelectedOrderForDrop(ord)}
                            className="bg-purple-600 hover:bg-purple-500 text-white text-[10px] px-2.5 py-1 rounded-lg transition font-bold"
                          >
                            Bind Ticket File
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-500 flex items-center justify-end gap-1">
                            <FileCheck className="w-3.5 h-3.5 text-emerald-400" /> Complete
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
