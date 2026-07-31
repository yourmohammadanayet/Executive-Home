import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Loader2 } from 'lucide-react';
import { Room } from '../types';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddMemberModal({ isOpen, onClose, onSuccess }: AddMemberModalProps) {
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [roomId, setRoomId] = useState('');
  const [baseRent, setBaseRent] = useState(0);
  
  // Joining Charge State
  const [suggestedCharge, setSuggestedCharge] = useState(1500);
  const [finalCharge, setFinalCharge] = useState(1500);
  const [discount, setDiscount] = useState(0);
  const [waivedAmount, setWaivedAmount] = useState(0);
  const [paymentPlan, setPaymentPlan] = useState<'immediate' | 'first_month' | 'separate'>('first_month');

  useEffect(() => {
    if (isOpen) {
      fetchRooms();
      fetchSettings();
    }
  }, [isOpen]);

  const fetchRooms = async () => {
    const { data } = await supabase.from('rooms').select('*').order('name');
    if (data) setRooms(data);
  };

  const fetchSettings = async () => {
    const { data } = await supabase.from('settings').select('suggested_joining_charge').single();
    if (data) {
      setSuggestedCharge(data.suggested_joining_charge);
      setFinalCharge(data.suggested_joining_charge);
    }
  };

  const finalPayable = Math.max(0, finalCharge - discount - waivedAmount);

  const handleSubmit = async (e: import("react").FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Generate Member Code
      const { count } = await supabase.from('members').select('*', { count: 'exact', head: true });
      const nextId = (count || 0) + 1;
      const memberCode = `EH-${String(nextId).padStart(3, '0')}`;

      // 2. Insert Member locally & remote
      const newMember = {
        id: `mem-${Date.now()}`,
        member_code: memberCode,
        full_name: fullName,
        phone,
        email,
        room_id: roomId,
        room: { name: rooms.find(r => r.id === roomId)?.name || 'Assigned Room' },
        base_monthly_rent: baseRent,
        move_in_date: new Date().toISOString().split('T')[0],
        member_status: 'Active' as const,
        approval_status: 'Approved' as const,
        document_status: 'Pending' as const,
        auth_linked: false,
        created_at: new Date().toISOString(),
        joining_charge: {
          id: `jc-${Date.now()}`,
          member_id: `mem-${Date.now()}`,
          suggested_amount: suggestedCharge,
          final_charge_amount: finalCharge,
          discount_amount: discount,
          waived_amount: waivedAmount,
          final_payable_amount: finalPayable,
          paid_amount: 0,
          due_amount: finalPayable,
          payment_plan: paymentPlan,
          status: (finalPayable === 0 ? (waivedAmount > 0 ? 'Waived' : 'Paid') : 'Pending') as any,
        }
      };

      try {
        await supabase.from('members').insert({
          member_code: memberCode,
          full_name: fullName,
          phone,
          email,
          room_id: roomId,
          base_monthly_rent: baseRent,
          move_in_date: new Date().toISOString().split('T')[0],
          member_status: 'Active',
          document_status: 'Pending'
        });
      } catch (e) {
        console.log('Supabase insert skipped, stored locally');
      }

      // Update local storage
      const currentMembers = JSON.parse(localStorage.getItem('eh_members') || '[]');
      currentMembers.unshift(newMember);
      localStorage.setItem('eh_members', JSON.stringify(currentMembers));


      // 4. Generate First Monthly Bill
      const currentDate = new Date();
      const billingMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
      
      const includeJoining = paymentPlan === 'first_month';
      const billTotalPayable = baseRent + (includeJoining ? finalPayable : 0);

      const firstBill = {
        id: `bill-${Date.now()}-${newMember.id}`,
        member_id: newMember.id,
        billing_month: billingMonth,
        base_rent: baseRent,
        joining_charge_included: includeJoining,
        joining_charge_amount: includeJoining ? finalPayable : 0,
        total_payable: billTotalPayable,
        paid_amount: 0,
        due_amount: billTotalPayable,
        due_date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10).toISOString(),
        status: billTotalPayable === 0 ? 'Paid' : 'Due',
        member: {
          id: newMember.id,
          full_name: newMember.full_name,
          member_code: newMember.member_code,
          room: newMember.room,
        }
      };

      const currentBills = JSON.parse(localStorage.getItem('eh_bills') || '[]');
      currentBills.unshift(firstBill);
      localStorage.setItem('eh_bills', JSON.stringify(currentBills));

      try {
        await supabase
          .from('monthly_bills')
          .insert({
            member_id: newMember.id,
            billing_month: billingMonth,
            base_rent: baseRent,
            joining_charge_included: includeJoining,
            joining_charge_amount: includeJoining ? finalPayable : 0,
            total_payable: billTotalPayable,
            due_amount: billTotalPayable,
            due_date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10).toISOString(),
            status: billTotalPayable === 0 ? 'Paid' : 'Due'
          });
      } catch (e) {
        console.log('Supabase bill insert skipped, stored locally');
      }

      onSuccess();
      onClose();
      // Reset form
      setFullName(''); setPhone(''); setEmail(''); setRoomId(''); setBaseRent(0);
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the member');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-xl bg-white dark:bg-dark-surface shadow-xl my-8">
        <div className="flex items-center justify-between border-b border-[#D5E2DF] dark:border-dark-border px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">Add New Member</h2>
          <button onClick={onClose} className="text-gray-400 dark:text-dark-text-muted hover:text-gray-500 dark:text-dark-text-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 rounded-md bg-red-50 dark:bg-dark-red/10 p-4 text-sm text-red-700 border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Personal Info */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-dark-text-primary mb-3">Personal Information</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Full Name</label>
                  <input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border-strong shadow-sm focus:border-[#23796F] dark:border-emerald-500 focus:ring-[#23796F] dark:focus:ring-dark-teal sm:text-sm px-3 py-2 border outline-none ring-1 ring-inset ring-gray-300 dark:ring-dark-border-strong" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Phone Number</label>
                  <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border-strong shadow-sm focus:border-[#23796F] dark:border-emerald-500 focus:ring-[#23796F] dark:focus:ring-dark-teal sm:text-sm px-3 py-2 border outline-none ring-1 ring-inset ring-gray-300 dark:ring-dark-border-strong" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border-strong shadow-sm focus:border-[#23796F] dark:border-emerald-500 focus:ring-[#23796F] dark:focus:ring-dark-teal sm:text-sm px-3 py-2 border outline-none ring-1 ring-inset ring-gray-300 dark:ring-dark-border-strong" />
                </div>
              </div>
            </div>

            <div className="border-t border-[#D5E2DF] dark:border-dark-border pt-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-dark-text-primary mb-3">Room & Rent</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Room</label>
                  <select required value={roomId} onChange={e => setRoomId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border-strong shadow-sm focus:border-[#23796F] dark:border-emerald-500 focus:ring-[#23796F] dark:focus:ring-dark-teal sm:text-sm px-3 py-2 border outline-none ring-1 ring-inset ring-gray-300 dark:ring-dark-border-strong">
                    <option value="">Select a room</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.type})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Base Monthly Rent (৳)</label>
                  <input required type="number" min="0" value={baseRent} onChange={e => setBaseRent(Number(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border-strong shadow-sm focus:border-[#23796F] dark:border-emerald-500 focus:ring-[#23796F] dark:focus:ring-dark-teal sm:text-sm px-3 py-2 border outline-none ring-1 ring-inset ring-gray-300 dark:ring-dark-border-strong" />
                </div>
              </div>
            </div>

            <div className="border-t border-[#D5E2DF] dark:border-dark-border pt-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-dark-text-primary mb-3">One-time Joining / Service Charge</h3>
              <div className="rounded-md bg-blue-50 p-4 border border-blue-100 mb-4">
                <p className="text-sm text-blue-700">Suggested charge is ৳{suggestedCharge}. This is collected only once and is not a recurring monthly charge.</p>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Final Charge Amount</label>
                  <input type="number" min="0" value={finalCharge} onChange={e => setFinalCharge(Number(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border-strong shadow-sm focus:border-[#23796F] dark:border-emerald-500 focus:ring-[#23796F] dark:focus:ring-dark-teal sm:text-sm px-3 py-2 border outline-none ring-1 ring-inset ring-gray-300 dark:ring-dark-border-strong" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Discount</label>
                  <input type="number" min="0" value={discount} onChange={e => setDiscount(Number(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border-strong shadow-sm focus:border-[#23796F] dark:border-emerald-500 focus:ring-[#23796F] dark:focus:ring-dark-teal sm:text-sm px-3 py-2 border outline-none ring-1 ring-inset ring-gray-300 dark:ring-dark-border-strong" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Waived Amount</label>
                  <input type="number" min="0" value={waivedAmount} onChange={e => setWaivedAmount(Number(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border-strong shadow-sm focus:border-[#23796F] dark:border-emerald-500 focus:ring-[#23796F] dark:focus:ring-dark-teal sm:text-sm px-3 py-2 border outline-none ring-1 ring-inset ring-gray-300 dark:ring-dark-border-strong" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Final Payable (Calculated)</label>
                  <input type="number" readOnly value={finalPayable} className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border-strong bg-gray-50 dark:bg-dark-canvas/50 dark:bg-dark-surface/50 shadow-sm sm:text-sm px-3 py-2 border outline-none ring-1 ring-inset ring-gray-300 dark:ring-dark-border-strong" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Collection Plan</label>
                  <select value={paymentPlan} onChange={e => setPaymentPlan(e.target.value as any)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border-strong shadow-sm focus:border-[#23796F] dark:border-emerald-500 focus:ring-[#23796F] dark:focus:ring-dark-teal sm:text-sm px-3 py-2 border outline-none ring-1 ring-inset ring-gray-300 dark:ring-dark-border-strong">
                    <option value="first_month">Add to first month's bill</option>
                    <option value="immediate">Collect immediately (separate payment)</option>
                    <option value="separate">Collect separately later</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 border-t border-[#D5E2DF] dark:border-dark-border pt-6">
            <button type="button" onClick={onClose} className="rounded-md bg-white dark:bg-dark-surface px-4 py-2 text-sm font-semibold text-gray-900 dark:text-dark-text-primary shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-dark-border-strong hover:bg-gray-50 dark:hover:bg-dark-hover dark:bg-dark-canvas/50 dark:hover:bg-dark-hover/50 dark:bg-dark-surface/50 outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="inline-flex justify-center rounded-md bg-[#23796F] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#173F3A] disabled:opacity-70 flex items-center outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
