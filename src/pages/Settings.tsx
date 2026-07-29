import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppSettings } from '../types';
import { getAppSettings, saveAppSettings, DEFAULT_SETTINGS, addAuditEntry } from '../lib/accessControlService';
import { seedDatabase } from '../lib/dataService';
import { 
  Users, 
  ShieldCheck, 
  Save, 
  Building2, 
  Lock, 
  Check, 
  AlertTriangle, 
  X, 
  ChevronRight, 
  Clock, 
  KeyRound, 
  RefreshCw, 
  Database,
  Sliders
} from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();
  const { userAccess } = useAuth();

  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [savedSettings, setSavedSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isModified, setIsModified] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Active section inside Settings (Billing or Security or Landing)
  const [activeSection, setActiveSection] = useState<'overview' | 'billing' | 'security'>('overview');

  // Developer Tools Modal State
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    const current = getAppSettings();
    setSettings(current);
    setSavedSettings(current);
  }, []);

  const handleChange = (field: keyof AppSettings, value: any) => {
    const updated = { ...settings, [field]: value };
    setSettings(updated);
    setIsModified(JSON.stringify(updated) !== JSON.stringify(savedSettings));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      saveAppSettings(settings, userAccess?.full_name || 'Mohammad Anayet (Admin)');
      setSavedSettings(settings);
      setIsModified(false);
      setToast({ type: 'success', message: 'Application settings saved successfully.' });
      setTimeout(() => setToast(null), 3500);
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to save application settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleRunSeedReset = async () => {
    if (confirmText.trim() !== 'RESET EXECUTIVE HOME') {
      setToast({ type: 'error', message: 'Confirmation text must match "RESET EXECUTIVE HOME".' });
      return;
    }

    await seedDatabase(true);
    setResetSuccess(true);
    addAuditEntry({
      actor_name: userAccess?.full_name || 'Mohammad Anayet (Admin)',
      actor_email: userAccess?.email || 'yourmohammadanayet@gmail.com',
      action: 'System Initial Seed Reset Executed',
      target_user: 'System Database',
      new_value: 'Restored 9 confirmed residents & 4 default rooms',
    });

    setToast({ type: 'success', message: 'Database reset to 9 confirmed residents successfully.' });
    setTimeout(() => {
      setDevToolsOpen(false);
      setResetSuccess(false);
      setConfirmText('');
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6 pb-24">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 text-sm font-semibold border ${
          toast.type === 'success' 
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
            : 'bg-rose-50 text-rose-900 border-rose-200'
        }`}>
          {toast.type === 'success' ? <Check className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-auto text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="pb-2 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#173F3A]">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage application preferences, member access and security.</p>
        </div>

        {activeSection !== 'overview' && (
          <button
            onClick={() => setActiveSection('overview')}
            className="text-xs font-semibold text-[#23796F] hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            ← Back to Settings Hub
          </button>
        )}
      </div>

      {/* LANDING VIEW: 3 SIMPLE CARDS */}
      {activeSection === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: User Access */}
          <div className="bg-white p-6 rounded-xl border border-[#D5E2DF] shadow-2xs flex flex-col justify-between hover:border-[#23796F] transition-all group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-[#23796F] flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#173F3A]">User Access</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Control who can sign in to Executive Home, manage login enablement, and review account permissions.
              </p>
            </div>

            <button
              onClick={() => navigate('/user-access')}
              className="mt-6 w-full py-2.5 px-4 bg-[#EBF3F2] group-hover:bg-[#23796F] text-[#173F3A] group-hover:text-white font-semibold text-xs rounded-lg flex items-center justify-between transition-all"
            >
              <span>Manage User Access</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Home & Billing */}
          <div className="bg-white p-6 rounded-xl border border-[#D5E2DF] shadow-2xs flex flex-col justify-between hover:border-[#23796F] transition-all group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#173F3A]">Home & Billing</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Configure home name, address, contact details, payment deadlines, joining charges, and currency settings.
              </p>
            </div>

            <button
              onClick={() => setActiveSection('billing')}
              className="mt-6 w-full py-2.5 px-4 bg-[#EBF3F2] group-hover:bg-[#23796F] text-[#173F3A] group-hover:text-white font-semibold text-xs rounded-lg flex items-center justify-between transition-all"
            >
              <span>Configure Billing & Info</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 3: Security */}
          <div className="bg-white p-6 rounded-xl border border-[#D5E2DF] shadow-2xs flex flex-col justify-between hover:border-[#23796F] transition-all group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#173F3A]">Security</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Manage session inactivity timeouts, login attempt limits, and password policy constraints.
              </p>
            </div>

            <button
              onClick={() => setActiveSection('security')}
              className="mt-6 w-full py-2.5 px-4 bg-[#EBF3F2] group-hover:bg-[#23796F] text-[#173F3A] group-hover:text-white font-semibold text-xs rounded-lg flex items-center justify-between transition-all"
            >
              <span>Security Controls</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* HOME & BILLING SECTION */}
      {activeSection === 'billing' && (
        <div className="bg-white p-6 rounded-xl border border-[#D5E2DF] shadow-2xs space-y-6">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-[#173F3A]">Home & Financial Preferences</h2>
            <p className="text-xs text-gray-500 mt-0.5">Configure currency, payment deadline, joining charge defaults, and contact details.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Executive Home Name</label>
              <input
                type="text"
                value={settings.home_name}
                onChange={(e) => handleChange('home_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23796F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Timezone</label>
              <input
                type="text"
                value={settings.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23796F] focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 font-semibold mb-1">Property Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23796F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Contact Email</label>
              <input
                type="email"
                value={settings.contact_email}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23796F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Contact Phone</label>
              <input
                type="text"
                value={settings.contact_phone}
                onChange={(e) => handleChange('contact_phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23796F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Currency</label>
              <input
                type="text"
                value={settings.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23796F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Monthly Payment Deadline Day (1 - 31)</label>
              <input
                type="number"
                min={1}
                max={31}
                value={settings.payment_deadline_day}
                onChange={(e) => handleChange('payment_deadline_day', parseInt(e.target.value) || 10)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23796F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Default One-time Joining Charge (BDT)</label>
              <input
                type="number"
                value={settings.suggested_joining_charge}
                onChange={(e) => handleChange('suggested_joining_charge', parseInt(e.target.value) || 1500)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23796F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Receipt Prefix</label>
              <input
                type="text"
                value={settings.receipt_prefix}
                onChange={(e) => handleChange('receipt_prefix', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23796F] focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECURITY SECTION */}
      {activeSection === 'security' && (
        <div className="bg-white p-6 rounded-xl border border-[#D5E2DF] shadow-2xs space-y-6">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-[#173F3A]">Security Controls</h2>
            <p className="text-xs text-gray-500 mt-0.5">Manage session timeouts, login attempt limits, and password policies.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Session Timeout (Minutes)</label>
              <input
                type="number"
                value={settings.session_timeout_mins}
                onChange={(e) => handleChange('session_timeout_mins', parseInt(e.target.value) || 60)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23796F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Minimum Password Length</label>
              <input
                type="number"
                value={settings.password_min_length}
                onChange={(e) => handleChange('password_min_length', parseInt(e.target.value) || 8)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23796F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Failed Login Attempt Limit</label>
              <input
                type="number"
                value={settings.login_attempt_limit}
                onChange={(e) => handleChange('login_attempt_limit', parseInt(e.target.value) || 5)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23796F] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <span className="block font-semibold text-gray-800">Require Email Verification</span>
                <span className="text-[11px] text-gray-500">Users must verify email before signing in</span>
              </div>
              <input
                type="checkbox"
                checked={settings.require_email_verification}
                onChange={(e) => handleChange('require_email_verification', e.target.checked)}
                className="h-4 w-4 text-[#23796F] rounded border-gray-300 focus:ring-[#23796F]"
              />
            </div>
          </div>
        </div>
      )}

      {/* STICKY SAVE BUTTON FOR MODIFIED SETTINGS */}
      {isModified && (
        <div className="fixed bottom-6 right-6 z-40 bg-white p-4 rounded-xl border border-[#D5E2DF] shadow-xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Unsaved changes detected</span>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-[#23796F] hover:bg-[#1C635B] text-white font-semibold text-xs rounded-lg flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      )}

      {/* FOOTER COLLAPSED DEVELOPER TOOLS */}
      <div className="pt-8 border-t border-gray-200 text-center">
        <button
          onClick={() => setDevToolsOpen(true)}
          className="text-xs text-gray-400 hover:text-gray-600 font-medium inline-flex items-center gap-1.5"
        >
          <Database className="w-3.5 h-3.5" />
          <span>Developer & System Maintenance Tools</span>
        </button>
      </div>

      {/* DEVELOPER TOOLS MODAL */}
      {devToolsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2 text-[#173F3A]">
                <Database className="w-5 h-5 text-[#23796F]" />
                <h3 className="text-base font-bold">Developer Maintenance Tools</h3>
              </div>
              <button onClick={() => setDevToolsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-gray-500 leading-relaxed">
              Caution: Resetting initial database will sanitize all records back to the 9 confirmed Executive Home residents.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Type confirmation phrase <span className="font-mono text-rose-600 font-bold">RESET EXECUTIVE HOME</span>:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="RESET EXECUTIVE HOME"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 font-mono text-xs"
                />
              </div>

              {resetSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 font-semibold rounded-lg flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Database reset executed. Reloading system...</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => setDevToolsOpen(false)}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleRunSeedReset}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-xs"
              >
                Reset Initial Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
