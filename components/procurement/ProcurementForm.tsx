'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { EventCategory, BroadcasterChannels } from '@/types';
import {
  PlusCircle,
  Calendar,
  MapPin,
  Tag,
  CreditCard,
  Check,
  AlertCircle,
  Ticket,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function ProcurementForm() {
  const [eventName, setEventName] = useState('');
  const [category, setCategory] = useState<EventCategory>('Concert');
  const [eventDate, setEventDate] = useState('');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('');
  const [section, setSection] = useState('');
  const [row, setRow] = useState('');
  const [seatStart, setSeatStart] = useState('1');
  const [seatEnd, setSeatEnd] = useState('4');

  const [costPerTicket, setCostPerTicket] = useState<number | ''>(150);
  const [faceValue, setFaceValue] = useState<number | ''>(125);
  const [listPrice, setListPrice] = useState<number | ''>(350);
  const [marketFloorPrice, setMarketFloorPrice] = useState<number | ''>(340);
  const [cardReference, setCardReference] = useState('Amex Platinum #4821');

  const [specListing, setSpecListing] = useState(false);
  const [targetDeliveryDate, setTargetDeliveryDate] = useState('');

  const [channels, setChannels] = useState<BroadcasterChannels>({
    stubhub: true,
    vividseats: true,
    seatgeek: true,
    ticketmaster: true,
  });

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-calculated quantity
  const startNum = parseInt(seatStart, 10) || 1;
  const endNum = parseInt(seatEnd, 10) || 1;
  const quantity = Math.max(1, endNum - startNum + 1);

  const numCost = typeof costPerTicket === 'number' ? costPerTicket : 0;
  const totalCost = numCost * quantity;
  const numListPrice = typeof listPrice === 'number' ? listPrice : 0;
  const projectedGross = numListPrice * quantity;
  const projectedMargin = projectedGross > 0 ? ((projectedGross - totalCost) / totalCost) * 100 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!eventName || !venue || !section || !row || !eventDate) {
      setErrorMsg('Please complete all required fields (Event Name, Venue, Section, Row, Date).');
      return;
    }

    if (specListing && !targetDeliveryDate) {
      setErrorMsg('Speculative listings require a Target Delivery Date.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newInventoryId = await db.inventory.add({
        eventName,
        category,
        eventDate: new Date(eventDate).toISOString(),
        venue,
        city: city || 'US City',
        section,
        row,
        seatStart,
        seatEnd,
        quantity,
        costPerTicket: numCost,
        totalCost,
        faceValue: typeof faceValue === 'number' ? faceValue : numCost,
        listPrice: numListPrice,
        marketFloorPrice: typeof marketFloorPrice === 'number' ? marketFloorPrice : numListPrice * 0.95,
        cardReference: cardReference || 'Corporate Card',
        specListing,
        targetDeliveryDate: specListing && targetDeliveryDate ? new Date(targetDeliveryDate).toISOString() : undefined,
        status: 'Available',
        channels,
        barcodes: [],
        lastRepricedAt: new Date().toISOString(),
      });

      setSuccessMsg(`Inventory Seeded Successfully! Added Item #${newInventoryId} (${quantity} seats to ${eventName})`);

      // Reset Form fields to defaults
      setEventName('');
      setSection('');
      setRow('');
      setSeatStart('1');
      setSeatEnd('4');
      setSpecListing(false);
      setTargetDeliveryDate('');
    } catch (err: any) {
      console.error('Failed to add inventory:', err);
      setErrorMsg(`Failed to add inventory: ${err?.message || 'IndexedDB Write Error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
            <PlusCircle className="w-4 h-4" />
            <span>Ticket Broker Stage 1: Procurement Layout</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Manual Inventory Ingestion & Purchase Logger</h2>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl">
            Ingest raw tickets directly into the local POS database. Seed seats, log payment card credentials, set target floor prices, and flag speculative delivery rules.
          </p>
        </div>

        {/* Realtime Calc Pill */}
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-3 text-right font-mono text-xs space-y-0.5">
          <div className="text-gray-400">Total Deployed Capital</div>
          <div className="text-lg font-bold text-emerald-400">{formatCurrency(totalCost)}</div>
          <div className="text-[10px] text-blue-400">
            Est. Return: +{projectedMargin.toFixed(1)}% ROI
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3 text-emerald-400 font-mono text-xs">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-400 font-mono text-xs">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Block A: Event & Category Details */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-3 text-sm font-bold text-white font-mono uppercase">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span>Block A — Event & Venue Identification</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-gray-400 mb-1">
                Event Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. Coldplay - Music of the Spheres"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">
                Event Category <span className="text-red-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white focus:border-blue-500 focus:outline-none font-mono"
              >
                <option value="Concert">Concert</option>
                <option value="Sports">Sports</option>
                <option value="Theater">Theater</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">
                Event Date & Time <span className="text-red-400">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white focus:border-blue-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">
                Venue Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Madison Square Garden"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">
                City / State
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. New York, NY"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Block B: Location & Seating */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-3 text-sm font-bold text-white font-mono uppercase">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Block B — Seating & Seat Grouping Spec</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">
                Section <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="e.g. 112 or Floor A"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">
                Row <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={row}
                onChange={(e) => setRow(e.target.value)}
                placeholder="e.g. 15 or B"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">
                Seat Start
              </label>
              <input
                type="text"
                value={seatStart}
                onChange={(e) => setSeatStart(e.target.value)}
                placeholder="1"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">
                Seat End
              </label>
              <input
                type="text"
                value={seatEnd}
                onChange={(e) => setSeatEnd(e.target.value)}
                placeholder="4"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none font-mono"
              />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-mono text-gray-400 mb-1">
                Total Quantity
              </label>
              <div className="w-full bg-gray-950 border border-emerald-500/30 text-emerald-400 font-bold rounded-xl py-2.5 px-3 text-xs font-mono text-center">
                {quantity} Seats
              </div>
            </div>
          </div>
        </div>

        {/* Block C: Cost & Purchasing Reference */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-3 text-sm font-bold text-white font-mono uppercase">
            <CreditCard className="w-4 h-4 text-amber-400" />
            <span>Block C — Procurement Cost & Payment Reference</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">
                Cost Per Ticket ($) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={costPerTicket}
                onChange={(e) => setCostPerTicket(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="150.00"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">
                Face Value ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={faceValue}
                onChange={(e) => setFaceValue(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="125.00"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">
                Purchasing Card Reference <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={cardReference}
                onChange={(e) => setCardReference(e.target.value)}
                placeholder="e.g. Amex Platinum #4821"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">
                Total Deployed Cost
              </label>
              <div className="w-full bg-gray-950 border border-gray-800 text-white font-bold rounded-xl py-2.5 px-3 text-xs font-mono">
                {formatCurrency(totalCost)}
              </div>
            </div>
          </div>
        </div>

        {/* Block D: Listing & Speculative Configuration */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-3 text-sm font-bold text-white font-mono uppercase">
            <Tag className="w-4 h-4 text-purple-400" />
            <span>Block D — Listing Pricing & Speculative Delivery</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">
                Initial List Price ($) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={listPrice}
                onChange={(e) => setListPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="350.00"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">
                Market Floor Protection Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={marketFloorPrice}
                onChange={(e) => setMarketFloorPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="340.00"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none font-mono"
              />
            </div>

            {/* Speculative Listing Toggle */}
            <div className="bg-gray-950 border border-gray-800 rounded-xl p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white font-mono">Speculative Listing</span>
                  <p className="text-[10px] text-gray-400 font-mono">Tickets pending transfer</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSpecListing(!specListing)}
                  className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                    specListing ? 'bg-purple-600' : 'bg-gray-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                      specListing ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {specListing && (
                <div className="mt-3 pt-2 border-t border-gray-800">
                  <label className="block text-[10px] font-mono text-purple-400 font-bold mb-1">
                    Target Delivery Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    required={specListing}
                    value={targetDeliveryDate}
                    onChange={(e) => setTargetDeliveryDate(e.target.value)}
                    className="w-full bg-gray-900 border border-purple-500/40 rounded-lg py-1.5 px-2 text-xs text-white font-mono"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Broadcaster Channel Enablement Checklist */}
          <div className="pt-3 border-t border-gray-800 space-y-2">
            <span className="text-xs font-mono text-gray-400 font-bold">Default Syndication Broadcasting Channels:</span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { key: 'stubhub', name: 'StubHub' },
                { key: 'vividseats', name: 'Vivid Seats' },
                { key: 'seatgeek', name: 'SeatGeek' },
                { key: 'ticketmaster', name: 'Ticketmaster Resale' },
              ].map((ch) => {
                const isChecked = channels[ch.key as keyof BroadcasterChannels];
                return (
                  <label
                    key={ch.key}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-mono cursor-pointer transition ${
                      isChecked
                        ? 'bg-blue-600/10 border-blue-500/40 text-blue-300'
                        : 'bg-gray-950 border-gray-800 text-gray-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) =>
                        setChannels({ ...channels, [ch.key]: e.target.checked })
                      }
                      className="rounded bg-gray-900 border-gray-700 text-blue-600 focus:ring-0"
                    />
                    <span>{ch.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs py-3.5 px-8 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>Ingest Inventory to POS DB</span>
          </button>
        </div>
      </form>
    </div>
  );
}
