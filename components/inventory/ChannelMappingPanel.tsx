'use client';

import React from 'react';
import { InventoryItem } from '@/types';
import { db } from '@/lib/db';
import { Radio, X, Check, Globe } from 'lucide-react';

interface ChannelMappingPanelProps {
  item: InventoryItem;
  onClose: () => void;
}

export default function ChannelMappingPanel({ item, onClose }: ChannelMappingPanelProps) {
  const handleToggleChannel = async (channelKey: 'stubhub' | 'vividseats' | 'seatgeek' | 'ticketmaster') => {
    if (!item.id) return;
    const updatedChannels = {
      ...item.channels,
      [channelKey]: !item.channels[channelKey],
    };
    await db.inventory.update(item.id, { channels: updatedChannels });
  };

  const channelConfigs = [
    { key: 'stubhub', name: 'StubHub', color: 'border-indigo-500/40 text-indigo-400 bg-indigo-500/10' },
    { key: 'vividseats', name: 'Vivid Seats', color: 'border-red-500/40 text-red-400 bg-red-500/10' },
    { key: 'seatgeek', name: 'SeatGeek', color: 'border-sky-500/40 text-sky-400 bg-sky-500/10' },
    { key: 'ticketmaster', name: 'Ticketmaster Resale', color: 'border-blue-500/40 text-blue-400 bg-blue-500/10' },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2 text-blue-400 font-bold font-mono">
            <Radio className="w-5 h-5" />
            <span>Broadcaster Channel Syndication</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3 className="text-sm font-bold text-white">{item.eventName}</h3>
          <p className="text-xs text-gray-400 font-mono">
            Sec {item.section}, Row {item.row} ({item.quantity} Seats) — List Price: ${item.listPrice.toFixed(2)}
          </p>
        </div>

        <div className="space-y-2">
          <span className="text-xs text-gray-400 font-mono font-semibold">Broadcaster Marketplace Feeds:</span>

          {channelConfigs.map((cfg) => {
            const isEnabled = item.channels[cfg.key as keyof typeof item.channels];
            return (
              <div
                key={cfg.key}
                onClick={() => handleToggleChannel(cfg.key as any)}
                className={`flex items-center justify-between p-3 rounded-xl border font-mono text-xs cursor-pointer transition ${
                  isEnabled ? cfg.color : 'bg-gray-950 border-gray-800 text-gray-500'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Globe className={`w-4 h-4 ${isEnabled ? 'text-white' : 'text-gray-600'}`} />
                  <span className="font-bold">{cfg.name}</span>
                </div>
                <div className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                  isEnabled ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-500'
                }`}>
                  {isEnabled ? 'LIVE BROADCASTING' : 'DISABLED'}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs px-4 py-2 rounded-xl transition"
          >
            Save & Exit
          </button>
        </div>
      </div>
    </div>
  );
}
