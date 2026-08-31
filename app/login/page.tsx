'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Ticket, Lock, ArrowRight, Zap, Database } from 'lucide-react';
import { initDatabase } from '@/lib/db';

export default function LoginPage() {
  const router = useRouter();
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    if (typeof window !== 'undefined' && localStorage.getItem('ta_poc_auth') === 'true') {
      router.push('/dashboard');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Pre-initialize Dexie database
    try {
      await initDatabase();
    } catch (err) {
      console.error('Database initialization error:', err);
    }

    if (passkey === 'broker2026' || passkey.trim().length > 0) {
      localStorage.setItem('ta_poc_auth', 'true');
      localStorage.setItem('ta_poc_user', 'Master Broker POS Admin');
      setTimeout(() => {
        router.push('/dashboard');
      }, 400);
    } else {
      setError('Invalid passkey. Use demo passkey "broker2026" or click Quick Access.');
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setLoading(true);
    try {
      await initDatabase();
    } catch (err) {
      console.error(err);
    }
    localStorage.setItem('ta_poc_auth', 'true');
    localStorage.setItem('ta_poc_user', 'Master Broker POS Admin');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Lock Card */}
      <div className="w-full max-w-md bg-gray-900/90 border border-gray-800 backdrop-blur-xl rounded-2xl p-8 shadow-2xl z-10">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mb-3 shadow-inner">
            <Ticket className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-black tracking-wider text-white flex items-center gap-2">
            TA-POC <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded font-mono">TBMS 2026</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-mono">
            Ticket Broker Broker Management System
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs text-center font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 font-mono">
              Broker Passkey
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="Enter passkey (default: broker2026)"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2 font-mono text-sm">
                <Database className="w-4 h-4 animate-spin" /> Initializing Dexie DB...
              </span>
            ) : (
              <>
                <span>Access Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-800/80 flex flex-col gap-3">
          <button
            onClick={handleQuickDemo}
            disabled={loading}
            className="w-full bg-gray-800/80 hover:bg-gray-800 text-amber-400 border border-amber-500/20 hover:border-amber-500/40 text-xs font-mono py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>1-Click Instant Demo Authentication</span>
          </button>

          <div className="flex items-center justify-between text-[11px] text-gray-500 font-mono pt-2">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> IndexedDB Active
            </span>
            <span>Single-Tenant Locked</span>
          </div>
        </div>
      </div>

      <footer className="mt-8 text-center text-xs text-gray-600 font-mono">
        TA-POC - Ticket Broker Management System &copy; 2026
      </footer>
    </div>
  );
}
