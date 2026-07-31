import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { fetchMembersData } from '../lib/dataService';
import { X, Loader2, Calendar } from 'lucide-react';

interface GenerateBillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GenerateBillsModal({ isOpen, onClose, onSuccess }: GenerateBillsModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [dueDateDay, setDueDateDay] = useState(10);

  if (!isOpen) return null;

  const handleGenerate = async (e: import('react').FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const activeMembers = await fetchMembersData();
      const [yearStr, monthStr] = selectedMonth.split('-');
      const year = Number(yearStr);
      const month = Number(monthStr) - 1; // 0-indexed

      const billingMonthIso = new Date(year, month, 1).toISOString();
      const dueDateIso = new Date(year, month, dueDateDay).toISOString();

      let generatedCount = 0;
      const cachedBills = JSON.parse(localStorage.getItem('eh_bills') || '[]');

      for (const member of activeMembers) {
        if (member.member_status !== 'Active') continue;

        // Check if bill already exists in cache/local
        const existsLocally = cachedBills.some(
          (b: any) =>
            b.member_id === member.id &&
            new Date(b.billing_month).getMonth() === month &&
            new Date(b.billing_month).getFullYear() === year
        );

        if (!existsLocally) {
          const newBill = {
            id: `bill-${Date.now()}-${member.id}`,
            member_id: member.id,
            member: {
              full_name: member.full_name,
              member_code: member.member_code,
              room: member.room,
            },
            billing_month: billingMonthIso,
            base_rent: member.base_monthly_rent,
            joining_charge_included: false,
            joining_charge_amount: 0,
            total_payable: member.base_monthly_rent,
            paid_amount: 0,
            due_amount: member.base_monthly_rent,
            due_date: dueDateIso,
            status: 'Due',
          };

          cachedBills.unshift(newBill);
          generatedCount++;

          // Attempt insertion into Supabase
          try {
            await supabase.from('monthly_bills').insert({
              member_id: member.id,
              billing_month: billingMonthIso,
              base_rent: member.base_monthly_rent,
              joining_charge_included: false,
              joining_charge_amount: 0,
              total_payable: member.base_monthly_rent,
              paid_amount: 0,
              due_amount: member.base_monthly_rent,
              due_date: dueDateIso,
              status: 'Due',
            });
          } catch (e) {
            // Ignore DB insert errors, cached locally
          }
        }
      }

      localStorage.setItem('eh_bills', JSON.stringify(cachedBills));

      setSuccessMsg(`Successfully generated ${generatedCount} new monthly bill(s) for ${selectedMonth}!`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to generate bills');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-xl bg-white dark:bg-dark-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-[#D5E2DF] dark:border-dark-border px-6 py-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#23796F] dark:text-dark-teal" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">Generate Monthly Bills</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 dark:text-dark-text-muted hover:text-gray-500 dark:text-dark-text-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleGenerate} className="p-6 space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-dark-red/10 p-3 text-xs text-red-700 border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="rounded-md bg-green-50 p-3 text-xs text-green-800 border border-green-200">
              {successMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-dark-text-secondary uppercase tracking-wide">
              Billing Month
            </label>
            <input
              type="month"
              required
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 dark:text-dark-text-primary shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-dark-border-strong focus:ring-2 focus:ring-[#23796F] dark:focus:ring-dark-teal text-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-dark-text-secondary uppercase tracking-wide">
              Due Date (Day of Month)
            </label>
            <input
              type="number"
              required
              min="1"
              max="28"
              value={dueDateDay}
              onChange={(e) => setDueDateDay(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 dark:text-dark-text-primary shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-dark-border-strong focus:ring-2 focus:ring-[#23796F] dark:focus:ring-dark-teal text-sm outline-none"
            />
            <p className="mt-1 text-[10px] text-gray-500 dark:text-dark-text-secondary">
              Default is 10th of every month.
            </p>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800">
            This action generates monthly rent bills for all active members based on their assigned base monthly rent.
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[#D5E2DF] dark:border-dark-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-white dark:bg-dark-surface px-4 py-2 text-xs font-semibold text-gray-700 dark:text-dark-text-secondary shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-dark-border-strong hover:bg-gray-50 dark:hover:bg-dark-hover dark:bg-dark-canvas/50 dark:hover:bg-dark-hover/50 dark:bg-dark-surface/50 outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center rounded-md bg-[#23796F] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#173F3A] disabled:opacity-70 items-center outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Bills
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
