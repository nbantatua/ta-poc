'use client';

import React, { useState } from 'react';
import { Database, Zap, RefreshCw, CheckCircle2, Lock, AlertCircle } from 'lucide-react';
import { executePricingAutomation } from '@/lib/pricing-engine';
import { AutomationLog } from '@/types';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onLockScreen: () => void;
}

export default function Header({ title, subtitle, onLockScreen }: HeaderProps) {
  const [runningRules, setRunningRules] = useState(false);
  const [lastLog, setLastLog] = useState<AutomationLog | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);

  const handleRunPricingAutomation = async () => {
    setRunningRules(true);
    try {
      const log = await executePricingAutomation();
      setLastLog(log);
      setShowLogModal(true);
    } catch (err) {
      console.error('Failed to run pricing rules:', err);
    } finally {
      setRunningRules(false);
    }
  };

  return (
    <>
      <header className="h-16 bg-gray-900/90 border-b border-gray-800 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            {title}
          </h1>
          {subtitle && <p className="text-xs text-gray-400 font-mono">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4">
          {/* DB Status Badge */}
          <div className="hidden md:flex items-center gap-2 bg-gray-950 border border-gray-800 px-3 py-1.5 rounded-lg text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Database className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-300">Dexie.js IndexedDB</span>
          </div>

          {/* Prominent Pricing Automation Button */}
          <button
            onClick={handleRunPricingAutomation}
            disabled={runningRules}
            className="bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-95 disabled:opacity-50"
          >
            {runningRules ? (
              <RefreshCw className="w-4 h-4 animate-spin text-gray-950" />
            ) : (
              <Zap className="w-4 h-4 fill-gray-950 text-gray-950" />
            )}
            <span className="font-mono uppercase tracking-wider">Execute Pricing Automation Rules</span>
          </button>

          {/* User Account / Lock Screen */}
          <div className="flex items-center gap-2 border-l border-gray-800 pl-4">
            <button
              onClick={onLockScreen}
              title="Lock Terminal"
              className="w-9 h-9 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg flex items-center justify-center transition border border-gray-700/50"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Pricing Log Result Modal */}
      {showLogModal && lastLog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold font-mono">
                <Zap className="w-5 h-5 fill-amber-400" />
                <span>Pricing Automation Execution Log</span>
              </div>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-gray-400 hover:text-white text-xs font-mono bg-gray-800 px-2.5 py-1 rounded"
              >
                Close (ESC)
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-gray-950 p-3 rounded-lg border border-gray-800">
                <span className="text-gray-400 block text-[10px]">Items Repriced</span>
                <span className="text-lg font-bold text-emerald-400">{lastLog.itemsUpdated}</span>
              </div>
              <div className="bg-gray-950 p-3 rounded-lg border border-gray-800">
                <span className="text-gray-400 block text-[10px]">Net Price Change</span>
                <span className={`text-lg font-bold ${lastLog.totalDelta < 0 ? 'text-amber-400' : 'text-blue-400'}`}>
                  {lastLog.totalDelta >= 0 ? `+$${lastLog.totalDelta}` : `-$${Math.abs(lastLog.totalDelta)}`}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-gray-400 font-mono font-semibold">Repricing Execution Log:</span>
              <div className="bg-gray-950 border border-gray-800 rounded-xl p-3 max-h-56 overflow-y-auto space-y-2 text-xs font-mono text-gray-300">
                {lastLog.details.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-2 border-b border-gray-900 pb-1.5 last:border-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowLogModal(false)}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono px-4 py-2 rounded-xl transition"
              >
                Done & Return to Grid
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
