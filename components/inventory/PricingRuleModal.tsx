'use client';

import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { PricingRule } from '@/types';
import { Sliders, X, Check, ShieldAlert, Clock, ArrowDown } from 'lucide-react';

interface PricingRuleModalProps {
  onClose: () => void;
}

export default function PricingRuleModal({ onClose }: PricingRuleModalProps) {
  const rules = useLiveQuery(() => db.pricingRules.toArray()) || [];

  const handleToggleRule = async (ruleId?: number, currentStatus?: boolean) => {
    if (!ruleId) return;
    await db.pricingRules.update(ruleId, { isActive: !currentStatus });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold font-mono">
            <Sliders className="w-5 h-5" />
            <span>Pricing Automation Rule Matrix</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-gray-400 font-mono">
          Configure rule triggers applied when executing pricing automation across available inventory.
        </p>

        <div className="space-y-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`p-3.5 rounded-xl border font-mono text-xs transition space-y-1.5 ${
                rule.isActive
                  ? 'bg-amber-500/10 border-amber-500/30 text-gray-100'
                  : 'bg-gray-950 border-gray-800 text-gray-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400">{rule.name}</span>
                <button
                  onClick={() => handleToggleRule(rule.id, rule.isActive)}
                  className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition ${
                    rule.isActive ? 'bg-amber-500 text-gray-950' : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {rule.isActive ? 'Rule Active' : 'Disabled'}
                </button>
              </div>
              <p className="text-gray-300 text-[11px] leading-tight">{rule.description}</p>
            </div>
          ))}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-800 hover:bg-gray-700 text-white font-mono text-xs px-4 py-2 rounded-xl transition"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
}
