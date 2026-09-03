'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { BrokerAccount } from '@/types';
import {
  Building2,
  Mail,
  FileText,
  Key,
  DollarSign,
  Bell,
  Save,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function AccountSettingsPage(): JSX.Element {
  const [account, setAccount] = useState<BrokerAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState({
    stubhub: false,
    vividseats: false,
    seatgeek: false,
    ticketmaster: false,
  });
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadAccount();
  }, []);

  const loadAccount = async () => {
    try {
      setLoading(true);
      const accounts = await db.brokerAccount.toArray();
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      } else {
        // Initialize empty account
        setAccount({
          businessName: '',
          ownerName: '',
          email: '',
          phone: '',
          businessAddress: '',
          city: '',
          state: '',
          zipCode: '',
          taxId: '',
          licenseNumber: '',
          stubhubApiKey: '',
          vividseatsApiKey: '',
          seatgeekApiKey: '',
          ticketmasterApiKey: '',
          defaultCommissionRate: 0.15,
          minimumMarginPercent: 0.10,
          emailNotifications: true,
          smsNotifications: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error loading account:', error);
      setSaveMessage({ type: 'error', text: 'Failed to load account data' });
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\(\d{3}\)\s\d{3}-\d{4}$/;
    return phoneRegex.test(phone);
  };

  const validateZipCode = (zip: string): boolean => {
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(zip);
  };

  const validateTaxId = (taxId: string): boolean => {
    const taxIdRegex = /^\d{2}-\d{7}$|^\d{3}-\d{2}-\d{4}$|^\*\*-\*{3}\d{4}$/;
    return taxIdRegex.test(taxId);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!account?.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (!account?.ownerName.trim()) {
      newErrors.ownerName = 'Owner name is required';
    }

    if (!account?.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(account.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!account?.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!validatePhone(account.phone)) {
      newErrors.phone = 'Phone must be in format (XXX) XXX-XXXX';
    }

    if (!account?.taxId.trim()) {
      newErrors.taxId = 'Tax ID is required';
    } else if (!validateTaxId(account.taxId)) {
      newErrors.taxId = 'Tax ID must be in format XX-XXXXXXX or XXX-XX-XXXX';
    }

    if (account?.zipCode && !validateZipCode(account.zipCode)) {
      newErrors.zipCode = 'Zip code must be 5 or 9 digits';
    }

    if (account && (account.defaultCommissionRate < 0.01 || account.defaultCommissionRate > 0.30)) {
      newErrors.defaultCommissionRate = 'Commission rate must be between 1% and 30%';
    }

    if (account && (account.minimumMarginPercent < 0.01 || account.minimumMarginPercent > 0.50)) {
      newErrors.minimumMarginPercent = 'Margin percent must be between 1% and 50%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!account) return;

    if (!validateForm()) {
      setSaveMessage({ type: 'error', text: 'Please fix validation errors before saving' });
      return;
    }

    try {
      setSaving(true);
      setSaveMessage(null);

      const updatedAccount = {
        ...account,
        updatedAt: new Date().toISOString(),
      };

      if (account.id) {
        await db.brokerAccount.update(account.id, updatedAccount);
      } else {
        const id = await db.brokerAccount.add(updatedAccount);
        setAccount({ ...updatedAccount, id: id as number });
      }

      setSaveMessage({ type: 'success', text: 'Account settings saved successfully' });
      setTimeout(() => setSaveMessage(null), 5000);
    } catch (error) {
      console.error('Error saving account:', error);
      setSaveMessage({ type: 'error', text: 'Failed to save account settings' });
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof BrokerAccount>(field: K, value: BrokerAccount[K]) => {
    if (account) {
      setAccount({ ...account, [field]: value });
      // Clear error for this field
      if (errors[field as string]) {
        setErrors({ ...errors, [field as string]: '' });
      }
    }
  };

  const toggleApiKeyVisibility = (key: 'stubhub' | 'vividseats' | 'seatgeek' | 'ticketmaster') => {
    setShowApiKeys({ ...showApiKeys, [key]: !showApiKeys[key] });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400 font-mono">Loading account settings...</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-sm text-gray-400 font-mono">Failed to load account data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Save Message */}
      {saveMessage && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-mono text-sm ${
            saveMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
          role="alert"
        >
          {saveMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>{saveMessage.text}</span>
        </div>
      )}

      {/* Business Information */}
      <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2 mb-4">
          <Building2 className="w-4 h-4 text-blue-400" />
          Business Information
        </h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="businessName" className="block text-xs text-gray-400 font-mono mb-1.5">
              Business Name *
            </label>
            <input
              id="businessName"
              type="text"
              value={account.businessName}
              onChange={(e) => updateField('businessName', e.target.value)}
              className={`w-full bg-gray-950 border ${
                errors.businessName ? 'border-red-500' : 'border-gray-800'
              } text-white text-sm px-3 py-2 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none`}
              aria-required="true"
              aria-invalid={!!errors.businessName}
              aria-describedby={errors.businessName ? 'businessName-error' : undefined}
            />
            {errors.businessName && (
              <p id="businessName-error" className="text-xs text-red-400 mt-1 font-mono">
                {errors.businessName}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="ownerName" className="block text-xs text-gray-400 font-mono mb-1.5">
              Owner Name *
            </label>
            <input
              id="ownerName"
              type="text"
              value={account.ownerName}
              onChange={(e) => updateField('ownerName', e.target.value)}
              className={`w-full bg-gray-950 border ${
                errors.ownerName ? 'border-red-500' : 'border-gray-800'
              } text-white text-sm px-3 py-2 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none`}
              aria-required="true"
              aria-invalid={!!errors.ownerName}
              aria-describedby={errors.ownerName ? 'ownerName-error' : undefined}
            />
            {errors.ownerName && (
              <p id="ownerName-error" className="text-xs text-red-400 mt-1 font-mono">
                {errors.ownerName}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="licenseNumber" className="block text-xs text-gray-400 font-mono mb-1.5">
              License Number (Optional)
            </label>
            <input
              id="licenseNumber"
              type="text"
              value={account.licenseNumber || ''}
              onChange={(e) => updateField('licenseNumber', e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 text-white text-sm px-3 py-2 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </section>

      {/* Contact Details */}
      <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2 mb-4">
          <Mail className="w-4 h-4 text-blue-400" />
          Contact Details
        </h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs text-gray-400 font-mono mb-1.5">
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              value={account.email}
              onChange={(e) => updateField('email', e.target.value)}
              className={`w-full bg-gray-950 border ${
                errors.email ? 'border-red-500' : 'border-gray-800'
              } text-white text-sm px-3 py-2 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none`}
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className="text-xs text-red-400 mt-1 font-mono">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-xs text-gray-400 font-mono mb-1.5">
              Phone Number * (Format: (XXX) XXX-XXXX)
            </label>
            <input
              id="phone"
              type="tel"
              value={account.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="(555) 123-4567"
              className={`w-full bg-gray-950 border ${
                errors.phone ? 'border-red-500' : 'border-gray-800'
              } text-white text-sm px-3 py-2 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none`}
              aria-required="true"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
            />
            {errors.phone && (
              <p id="phone-error" className="text-xs text-red-400 mt-1 font-mono">
                {errors.phone}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="businessAddress" className="block text-xs text-gray-400 font-mono mb-1.5">
              Business Address
            </label>
            <input
              id="businessAddress"
              type="text"
              value={account.businessAddress}
              onChange={(e) => updateField('businessAddress', e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 text-white text-sm px-3 py-2 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="city" className="block text-xs text-gray-400 font-mono mb-1.5">
                City
              </label>
              <input
                id="city"
                type="text"
                value={account.city}
                onChange={(e) => updateField('city', e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 text-white text-sm px-3 py-2 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-xs text-gray-400 font-mono mb-1.5">
                State
              </label>
              <input
                id="state"
                type="text"
                value={account.state}
                onChange={(e) => updateField('state', e.target.value)}
                maxLength={2}
                placeholder="NY"
                className="w-full bg-gray-950 border border-gray-800 text-white text-sm px-3 py-2 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label htmlFor="zipCode" className="block text-xs text-gray-400 font-mono mb-1.5">
                Zip Code
              </label>
              <input
                id="zipCode"
                type="text"
                value={account.zipCode}
                onChange={(e) => updateField('zipCode', e.target.value)}
                placeholder="10001"
                className={`w-full bg-gray-950 border ${
                  errors.zipCode ? 'border-red-500' : 'border-gray-800'
                } text-white text-sm px-3 py-2 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none`}
                aria-invalid={!!errors.zipCode}
                aria-describedby={errors.zipCode ? 'zipCode-error' : undefined}
              />
              {errors.zipCode && (
                <p id="zipCode-error" className="text-xs text-red-400 mt-1 font-mono">
                  {errors.zipCode}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tax Information */}
      <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-blue-400" />
          Tax Information
        </h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="taxId" className="block text-xs text-gray-400 font-mono mb-1.5">
              Tax ID (EIN or SSN) *
            </label>
            <input
              id="taxId"
              type="text"
              value={account.taxId}
              onChange={(e) => updateField('taxId', e.target.value)}
              placeholder="XX-XXXXXXX or XXX-XX-XXXX"
              className={`w-full bg-gray-950 border ${
                errors.taxId ? 'border-red-500' : 'border-gray-800'
              } text-white text-sm px-3 py-2 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none`}
              aria-required="true"
              aria-invalid={!!errors.taxId}
              aria-describedby={errors.taxId ? 'taxId-error' : undefined}
            />
            {errors.taxId && (
              <p id="taxId-error" className="text-xs text-red-400 mt-1 font-mono">
                {errors.taxId}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Marketplace API Credentials */}
      <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2 mb-4">
          <Key className="w-4 h-4 text-blue-400" />
          Marketplace API Credentials
        </h2>
        <p className="text-xs text-amber-400 mb-4 font-mono bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg">
          Warning: API keys are stored locally in your browser. For production use, move credentials to secure server-side storage.
        </p>
        <div className="space-y-4">
          {[
            { key: 'stubhubApiKey' as const, label: 'StubHub API Key', field: 'stubhub' as const },
            { key: 'vividseatsApiKey' as const, label: 'Vivid Seats API Key', field: 'vividseats' as const },
            { key: 'seatgeekApiKey' as const, label: 'SeatGeek API Key', field: 'seatgeek' as const },
            { key: 'ticketmasterApiKey' as const, label: 'Ticketmaster API Key', field: 'ticketmaster' as const },
          ].map(({ key, label, field }) => (
            <div key={key}>
              <label htmlFor={key} className="block text-xs text-gray-400 font-mono mb-1.5">
                {label} (Optional)
              </label>
              <div className="relative">
                <input
                  id={key}
                  type={showApiKeys[field] ? 'text' : 'password'}
                  value={account[key] || ''}
                  onChange={(e) => updateField(key, e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 text-white text-sm px-3 py-2 pr-10 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="Enter API key"
                />
                <button
                  type="button"
                  onClick={() => toggleApiKeyVisibility(field)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition"
                  aria-label={showApiKeys[field] ? 'Hide API key' : 'Show API key'}
                >
                  {showApiKeys[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Financial Defaults */}
      <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2 mb-4">
          <DollarSign className="w-4 h-4 text-blue-400" />
          Financial Defaults
        </h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="defaultCommissionRate" className="block text-xs text-gray-400 font-mono mb-1.5">
              Default Commission Rate (1% - 30%)
            </label>
            <div className="flex items-center gap-3">
              <input
                id="defaultCommissionRate"
                type="number"
                step="0.01"
                min="0.01"
                max="0.30"
                value={account.defaultCommissionRate}
                onChange={(e) => updateField('defaultCommissionRate', parseFloat(e.target.value) || 0.15)}
                className={`flex-1 bg-gray-950 border ${
                  errors.defaultCommissionRate ? 'border-red-500' : 'border-gray-800'
                } text-white text-sm px-3 py-2 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none`}
                aria-invalid={!!errors.defaultCommissionRate}
                aria-describedby={errors.defaultCommissionRate ? 'defaultCommissionRate-error' : undefined}
              />
              <span className="text-sm text-gray-400 font-mono">
                {(account.defaultCommissionRate * 100).toFixed(0)}%
              </span>
            </div>
            {errors.defaultCommissionRate && (
              <p id="defaultCommissionRate-error" className="text-xs text-red-400 mt-1 font-mono">
                {errors.defaultCommissionRate}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="minimumMarginPercent" className="block text-xs text-gray-400 font-mono mb-1.5">
              Minimum Margin Percent (1% - 50%)
            </label>
            <div className="flex items-center gap-3">
              <input
                id="minimumMarginPercent"
                type="number"
                step="0.01"
                min="0.01"
                max="0.50"
                value={account.minimumMarginPercent}
                onChange={(e) => updateField('minimumMarginPercent', parseFloat(e.target.value) || 0.10)}
                className={`flex-1 bg-gray-950 border ${
                  errors.minimumMarginPercent ? 'border-red-500' : 'border-gray-800'
                } text-white text-sm px-3 py-2 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none`}
                aria-invalid={!!errors.minimumMarginPercent}
                aria-describedby={errors.minimumMarginPercent ? 'minimumMarginPercent-error' : undefined}
              />
              <span className="text-sm text-gray-400 font-mono">
                {(account.minimumMarginPercent * 100).toFixed(0)}%
              </span>
            </div>
            {errors.minimumMarginPercent && (
              <p id="minimumMarginPercent-error" className="text-xs text-red-400 mt-1 font-mono">
                {errors.minimumMarginPercent}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Notification Preferences */}
      <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-blue-400" />
          Notification Preferences
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="emailNotifications" className="text-sm text-white font-mono">
                Email Notifications
              </label>
              <p className="text-xs text-gray-400 font-mono mt-0.5">Receive order and fulfillment alerts via email</p>
            </div>
            <button
              type="button"
              id="emailNotifications"
              role="switch"
              aria-checked={account.emailNotifications}
              onClick={() => updateField('emailNotifications', !account.emailNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                account.emailNotifications ? 'bg-blue-600' : 'bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  account.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="smsNotifications" className="text-sm text-white font-mono">
                SMS Notifications
              </label>
              <p className="text-xs text-gray-400 font-mono mt-0.5">Receive urgent alerts via text message</p>
            </div>
            <button
              type="button"
              id="smsNotifications"
              role="switch"
              aria-checked={account.smsNotifications}
              onClick={() => updateField('smsNotifications', !account.smsNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                account.smsNotifications ? 'bg-blue-600' : 'bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  account.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-4 pb-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-xl transition font-mono text-sm"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}
