import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Loader2 } from 'lucide-react';
import { safeFormatDate } from '../lib/dateUtils';
import { getLocalData, setLocalData } from '../lib/dataService';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bill: any;
}

export default function RecordPaymentModal({ isOpen, onClose, onSuccess, bill }: RecordPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [amount, setAmount] = useState(bill?.due_amount || 0);
  const [method, setMethod] = useState('Cash');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = async (e: import("react").FormEvent) => {
    e.preventDefault();
    if (!bill) return;
    
    setLoading(true);
    setError(null);

    try {
      // 1. Create Receipt Number & Payment record
      const receiptNumber = `EH-REC-${Date.now().toString().slice(-6)}`;

      // Calculate new due and status
      const newPaid = bill.paid_amount + amount;
      const newDue = Math.max(0, bill.total_payable - newPaid);
      
      let newStatus = 'Due';
      if (newDue === 0) newStatus = 'Paid';
      else if (newPaid > 0) newStatus = 'Partial';
      
      if (newDue > 0 && bill.due_date && !isNaN(new Date(bill.due_date).getTime()) && new Date(bill.due_date) < new Date()) {
        newStatus = 'Overdue';
      }

      const newPayment = {
        id: `pay-${Date.now()}`,
        member_id: bill.member_id,
        monthly_bill_id: bill.id,
        payment_type: bill.joining_charge_included ? 'Combined Rent and Joining Charge' : 'Monthly Rent',
        amount,
        payment_date: paymentDate,
        payment_method: method,
        transaction_id: transactionId,
        receipt_number: receiptNumber,
        notes,
        created_at: new Date().toISOString(),
        member: bill.member
      };

      // 2. Save payment to LocalStorage
      const currentPayments = getLocalData<any[]>('eh_payments', []);
      const updatedPayments = [newPayment, ...currentPayments];
      setLocalData('eh_payments', updatedPayments);

      // 3. Update monthly_bills in LocalStorage
      const currentBills = getLocalData<any[]>('eh_bills', []);
      const updatedBills = currentBills.map((b) => {
        if (b.id === bill.id) {
          return {
            ...b,
            paid_amount: newPaid,
            due_amount: newDue,
            status: newStatus
          };
        }
        return b;
      });
      setLocalData('eh_bills', updatedBills);

      // 4. Try Sync with Supabase in a non-blocking try-catch block
      try {
        await supabase.from('payments').insert({
          member_id: bill.member_id,
          monthly_bill_id: bill.id,
          payment_type: newPayment.payment_type,
          amount,
          payment_date: paymentDate,
          payment_method: method,
          transaction_id: transactionId,
          receipt_number: receiptNumber,
          notes
        });

        await supabase.from('monthly_bills').update({
          paid_amount: newPaid,
          due_amount: newDue,
          status: newStatus
        }).eq('id', bill.id);

        if (bill.joining_charge_included && newStatus === 'Paid') {
          await supabase.from('joining_charges').update({
            paid_amount: bill.joining_charge_amount,
            due_amount: 0,
            status: 'Paid'
          }).eq('member_id', bill.member_id).eq('payment_plan', 'first_month');
        }
      } catch (sbErr) {
        console.warn('Supabase database sync completed with local backup:', sbErr);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while recording payment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !bill) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#D5E2DF] px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Record Payment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <div className="mb-4 bg-teal-50/70 p-3 rounded-lg border border-teal-200 text-xs text-[#173F3A]">
            <p className="font-bold flex items-center gap-1">
              <span>ℹ️ Manual Collection System</span>
            </p>
            <p className="mt-0.5 text-gray-700">
              All transactions are processed manually. For <strong>bKash</strong>, <strong>Nagad</strong>, or <strong>Bank Transfer</strong>, enter the <strong>Transaction ID (TrxID)</strong> manually to issue a verified receipt.
            </p>
          </div>

          <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-gray-500">Member</span>
                <span className="font-medium text-gray-900">{bill.member?.full_name}</span>
              </div>
              <div>
                <span className="block text-gray-500">Billing Month</span>
                <span className="font-medium text-gray-900">{safeFormatDate(bill.billing_month, 'MMMM yyyy', 'August 2026')}</span>
              </div>
              <div>
                <span className="block text-gray-500">Total Payable</span>
                <span className="font-medium text-gray-900">৳{bill.total_payable.toLocaleString()}</span>
              </div>
              <div>
                <span className="block text-gray-500">Current Due</span>
                <span className="font-medium text-red-600">৳{bill.due_amount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Amount (৳)</label>
              <input required type="number" min="1" max={bill.due_amount} value={amount} onChange={e => setAmount(Number(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#23796F] focus:ring-[#23796F] sm:text-sm px-3 py-2 border outline-none ring-1 ring-inset ring-gray-300" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Date</label>
                <input required type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#23796F] focus:ring-[#23796F] sm:text-sm px-3 py-2 border outline-none ring-1 ring-inset ring-gray-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                <select value={method} onChange={e => setMethod(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#23796F] focus:ring-[#23796F] sm:text-sm px-3 py-2 border outline-none ring-1 ring-inset ring-gray-300">
                  <option value="Cash">Cash</option>
                  <option value="bKash">bKash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Rocket">Rocket</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Transaction ID (TrxID) {method !== 'Cash' && <span className="text-red-500 font-bold">*</span>}
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={e => setTransactionId(e.target.value)}
                required={method !== 'Cash'}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#23796F] focus:ring-[#23796F] sm:text-sm px-3 py-2 border outline-none ring-1 ring-inset ring-gray-300"
                placeholder={method === 'Cash' ? 'Optional for cash (e.g. Cash Receipt #)' : `Enter manual ${method} TrxID (e.g. TRX982736)`}
              />
              {method !== 'Cash' && (
                <p className="text-[11px] text-teal-800 font-medium mt-1">
                  Required for {method} to verify member transaction authenticity.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
              <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#23796F] focus:ring-[#23796F] sm:text-sm px-3 py-2 border outline-none ring-1 ring-inset ring-gray-300" />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-[#D5E2DF]">
            <button type="button" onClick={onClose} className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="inline-flex justify-center rounded-md bg-[#23796F] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#173F3A] disabled:opacity-70 flex items-center">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
