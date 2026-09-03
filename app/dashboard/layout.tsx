'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { initDatabase } from '@/lib/db';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(false);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    // Auth Check
    const auth = localStorage.getItem('ta_poc_auth');
    if (auth !== 'true') {
      router.push('/login');
    } else {
      setAuthenticated(true);
      // Ensure database is populated with initial seed dataset
      initDatabase()
        .then(() => setDbReady(true))
        .catch((err) => {
          console.error('Dexie DB seed error:', err);
          setDbReady(true);
        });
    }
  }, [router]);

  const handleLockScreen = () => {
    localStorage.removeItem('ta_poc_auth');
    router.push('/login');
  };

  const getPageMeta = () => {
    switch (pathname) {
      case '/dashboard/procurement':
        return {
          title: 'Stage 1: Procurement & Inventory Ingestion',
          subtitle: 'Unified manual ticket creation form, speculative listing configuration & cost logging',
        };
      case '/dashboard/inventory':
        return {
          title: 'Stage 2: Inventory & Syndication Broadcaster Engine',
          subtitle: 'High-density inventory grid, multi-channel syndication status & pricing rules engine',
        };
      case '/dashboard/fulfillment':
        return {
          title: 'Stage 3: Fulfillment Queue & Barcode Ingestion',
          subtitle: 'Sold order fulfillment matching, drag-and-drop ticket parsing & barcode binding',
        };
      case '/dashboard/analytics':
        return {
          title: 'Stage 3: Profit Analyzer & Financial ROI Dashboard',
          subtitle: 'Capital deployment log, gross revenue payout streams, 15% marketplace commission deduction & ROI',
        };
      case '/dashboard/settings':
        return {
          title: 'Account Settings',
          subtitle: 'Broker profile, marketplace credentials, financial defaults & notification preferences',
        };
      default:
        return {
          title: 'Master Broker Overview',
          subtitle: 'Real-time POS metrics, active broadcaster syndication channels & pending fulfillment queue',
        };
    }
  };

  if (!authenticated || !dbReady) {
    return (
      <div className="min-h-screen bg-[#0b0f17] flex flex-col items-center justify-center font-mono">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
        <p className="text-xs text-gray-400">Loading Ticket Broker POS & Dexie IndexedDB...</p>
      </div>
    );
  }

  const { title, subtitle } = getPageMeta();

  return (
    <div className="flex h-screen bg-[#0b0f17] text-gray-100 overflow-hidden font-sans">
      <Sidebar onLockScreen={handleLockScreen} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title={title} subtitle={subtitle} onLockScreen={handleLockScreen} />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
