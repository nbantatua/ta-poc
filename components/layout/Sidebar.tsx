'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  Table,
  Truck,
  TrendingUp,
  Ticket,
  Radio,
  Zap,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface SidebarProps {
  onLockScreen: () => void;
}

export default function Sidebar({ onLockScreen }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Master Overview',
      href: '/dashboard',
      icon: LayoutDashboard,
      stage: 'HQ',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    {
      name: '1. Procurement Form',
      href: '/dashboard/procurement',
      icon: PlusCircle,
      stage: 'Stage 1',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      name: '2. Inventory & Syndication',
      href: '/dashboard/inventory',
      icon: Table,
      stage: 'Stage 2',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    {
      name: '3. Fulfillment Queue',
      href: '/dashboard/fulfillment',
      icon: Truck,
      stage: 'Stage 3',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    },
    {
      name: '3. Profit Analyzer',
      href: '/dashboard/analytics',
      icon: TrendingUp,
      stage: 'Stage 3',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    },
  ];

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-screen select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 border border-blue-400/30 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Ticket className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide font-mono flex items-center gap-1.5">
              TA-POC <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">POS</span>
            </h2>
            <p className="text-[10px] text-gray-400 font-mono">TBMS</p>
          </div>
        </div>
      </div>

      {/* Lifecycle Stage Nav */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">
          Ticket Broker Lifecycle
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-gray-300 hover:bg-gray-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span>{item.name}</span>
              </div>
              <span
                className={`text-[9px] font-mono border px-1.5 py-0.5 rounded ${
                  isActive ? 'bg-white/20 text-white border-white/30' : item.badgeColor
                }`}
              >
                {item.stage}
              </span>
            </Link>
          );
        })}

        {/* Workflow Info Box */}
        <div className="pt-6 px-2">
          <div className="bg-gray-950/80 border border-gray-800 rounded-xl p-3 text-[11px] space-y-2">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold font-mono">
              <Zap className="w-3.5 h-3.5" /> Direct Dexie DB Engine
            </div>
            <p className="text-gray-400 leading-tight">
              Client-side IndexedDB with live reactive subscriptions across tabs.
            </p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono pt-1">
              <CheckCircle2 className="w-3 h-3" /> Auto-Seeded 20 Events
            </div>
          </div>
        </div>
      </div>

      {/* Footer Lock Control */}
      <div className="p-3 border-t border-gray-800 bg-gray-950">
        <button
          onClick={onLockScreen}
          className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-red-500/10 border border-gray-800 hover:border-red-500/30 text-gray-300 hover:text-red-400 text-xs font-mono py-2 rounded-lg transition"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Lock Terminal</span>
        </button>
      </div>
    </aside>
  );
}
