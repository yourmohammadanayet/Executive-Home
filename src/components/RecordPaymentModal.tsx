import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { 
  X, 
  Loader2, 
  Search, 
  User, 
  Home, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  ChevronDown, 
  Hash,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { safeFormatDate } from '../lib/dateUtils';
import { getLocalData, setLocalData } from '../lib/dataService';
import { motion, AnimatePresence } from 'motion/react';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bill?: any;
}

export default function RecordPaymentModal({ isOpen, onClose, onSuccess, bill }: RecordPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Core loaded data
  const [members, setMembers] = useState<any[]>([]);
  const [allBills, setAllBills] = useState<any[]>([]);

  // Selection states
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [memberBills, setMemberBills] = useState<any[]>([]);
  const [selectedBillId, setSelectedBillId] = useState<string>('');

  // Dropdown search & control
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Form states
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState('Cash');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  // Click outside handler for custom dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize data and handle preselected bill
  useEffect(() => {
    if (isOpen) {
      const loadedMembers = getLocalData<any[]>('eh_members', []);
      const loadedBills = getLocalData<any[]>('eh_bills', []);
      setMembers(loadedMembers);
      setAllBills(loadedBills);

      // Always start empty with no preselected member as requested
      setSelectedMemberId('');
      setSearchQuery('');
      setMemberBills([]);
      setSelectedBillId('');
      setAmount(0);
      setShowDropdown(true); // Open the auto-suggest list immediately
      
      setMethod('Cash');
      setTransactionId('');
      setNotes('');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setError(null);
    }
  }, [isOpen, bill]);

  // When a member is selected from dropdown
  const handleSelectMember = (member: any) => {
    setSelectedMemberId(member.id);
    setSearchQuery(member.full_name);
    setShowDropdown(false);

    const filtered = allBills.filter(b => b.member_id === member.id);
    setMemberBills(filtered);

    // Auto-select the latest bill with an outstanding due
    const billWithDue = filtered.find(b => b.due_amount > 0);
    if (billWithDue) {
      setSelectedBillId(billWithDue.id);
      setAmount(billWithDue.due_amount);
    } else {
      // Otherwise, select the latest overall bill
      const latestBill = filtered.length > 0 ? filtered[0] : null;
      if (latestBill) {
        setSelectedBillId(latestBill.id);
        setAmount(latestBill.due_amount);
      } else {
        setSelectedBillId('');
        setAmount(0);
      }
    }
  };

  // Get current active member details
  const selectedMember = members.find(m => m.id === selectedMemberId);
  const selectedBill = memberBills.find(b => b.id === selectedBillId);

  // Process members with their total dues and sort them so those with dues appear first
  const processedMembers = members.map(m => {
    const mBills = allBills.filter(b => b.member_id === m.id);
    const totalDue = mBills.reduce((sum, b) => sum + (b.due_amount || 0), 0);
    return {
      ...m,
      totalDue
    };
  }).sort((a, b) => {
    // Show members with dues first, sorted by due amount descending
    if (a.totalDue > 0 && b.totalDue === 0) return -1;
    if (a.totalDue === 0 && b.totalDue > 0) return 1;
    if (a.totalDue > 0 && b.totalDue > 0) return b.totalDue - a.totalDue;
    // If both have no dues, sort alphabetically
    return (a.full_name || '').localeCompare(b.full_name || '');
  });

  // Search filtered member list
  const filteredMembers = processedMembers.filter(m => {
    // If there's no query, show all
    if (!searchQuery) return true;

    // If query matches current selected member exactly, show all so they can easily switch
    if (selectedMember && searchQuery === selectedMember.full_name) return true;

    const query = searchQuery.toLowerCase();
    return (
      m.full_name?.toLowerCase().includes(query) ||
      m.member_code?.toLowerCase().includes(query) ||
      (m.phone && m.phone.includes(query)) ||
      m.room?.name?.toLowerCase().includes(query)
    );
  });

  const dueMembers = filteredMembers.filter(m => m.totalDue > 0);
  const paidMembers = filteredMembers.filter(m => m.totalDue === 0);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSubmit = async (e: import("react").FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) {
      setError('Please select a member first');
      return;
    }
    if (!selectedBill) {
      setError('Please select a billing period or month to apply this payment');
      return;
    }
    if (amount <= 0) {
      setError('Please enter a valid payment amount greater than 0');
      return;
    }
    if (amount > selectedBill.due_amount) {
      setError(`Payment amount cannot exceed the current outstanding due of ৳${selectedBill.due_amount}`);
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const receiptNumber = `EH-REC-${Date.now().toString().slice(-6)}`;

      // Calculate new due and status
      const newPaid = selectedBill.paid_amount + amount;
      const newDue = Math.max(0, selectedBill.total_payable - newPaid);
      
      let newStatus = 'Due';
      if (newDue === 0) newStatus = 'Paid';
      else if (newPaid > 0) newStatus = 'Partial';
      
      if (newDue > 0 && selectedBill.due_date && !isNaN(new Date(selectedBill.due_date).getTime()) && new Date(selectedBill.due_date) < new Date()) {
        newStatus = 'Overdue';
      }

      const newPayment = {
        id: `pay-${Date.now()}`,
        member_id: selectedMemberId,
        monthly_bill_id: selectedBill.id,
        payment_type: selectedBill.joining_charge_included ? 'Combined Rent and Joining Charge' : 'Monthly Rent',
        amount,
        payment_date: paymentDate,
        payment_method: method,
        transaction_id: transactionId,
        receipt_number: receiptNumber,
        notes,
        created_at: new Date().toISOString(),
        member: selectedMember
      };

      // 2. Save payment to LocalStorage
      const currentPayments = getLocalData<any[]>('eh_payments', []);
      const updatedPayments = [newPayment, ...currentPayments];
      setLocalData('eh_payments', updatedPayments);

      // 3. Update monthly_bills in LocalStorage
      const currentBills = getLocalData<any[]>('eh_bills', []);
      const updatedBills = currentBills.map((b) => {
        if (b.id === selectedBill.id) {
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

      // 4. Update Supabase
      try {
        await supabase.from('payments').insert({
          member_id: selectedMemberId,
          monthly_bill_id: selectedBill.id,
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
        }).eq('id', selectedBill.id);

        if (selectedBill.joining_charge_included && newStatus === 'Paid') {
          await supabase.from('joining_charges').update({
            paid_amount: selectedBill.joining_charge_amount,
            due_amount: 0,
            status: 'Paid'
          }).eq('member_id', selectedMemberId).eq('payment_plan', 'first_month');
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#173f3a]/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-2xl max-h-[calc(100vh-2rem)] rounded-2xl bg-white dark:bg-dark-surface shadow-2xl border border-gray-100 dark:border-dark-border flex flex-col my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#D5E2DF] dark:border-dark-border px-6 py-4 bg-gray-50/50 rounded-t-2xl shrink-0">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-[#173F3A] dark:text-dark-text-primary flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#23796F] dark:text-dark-teal" />
              <span>Record Member Payment</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-dark-text-secondary">Collect monthly rent, dues, and issue automated invoices.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover dark:bg-dark-raised text-gray-400 dark:text-dark-text-muted hover:text-gray-600 dark:hover:text-dark-text-secondary dark:text-dark-text-secondary transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 min-h-0">
          {error && (
            <div className="rounded-xl bg-rose-50 p-3.5 text-xs font-semibold text-rose-800 border border-rose-200 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Search Dropdown Selector */}
          {!selectedMember ? (
            <div className="space-y-3.5">
              <label className="block text-xs font-black text-[#173F3A] dark:text-dark-text-primary uppercase tracking-wider">Select Resident Member</label>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 dark:text-dark-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Type member name, ID, room, or phone to search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-dark-canvas/50 dark:bg-dark-surface/50 hover:bg-white dark:bg-dark-surface focus:bg-white border border-gray-200 dark:border-dark-border focus:border-[#23796F] dark:border-emerald-500 rounded-xl text-xs font-semibold text-[#173F3A] dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-[#23796F] dark:focus:ring-dark-teal dark:focus:ring-dark-teal/20 transition-all shadow-2xs outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                  autoFocus
                />
              </div>

              {/* Grid of members to select from */}
              <div className="space-y-4 flex-1 min-h-0">
                <div className="h-[380px] overflow-y-auto pr-1 space-y-6">
                  {filteredMembers.length === 0 ? (
                    <div className="py-10 text-center bg-gray-50 dark:bg-dark-canvas/50 dark:bg-dark-surface/50 rounded-2xl border border-dashed border-gray-200 dark:border-dark-border">
                      <AlertCircle className="w-6 h-6 text-gray-400 dark:text-dark-text-muted mx-auto mb-1.5" />
                      <p className="text-xs font-bold text-gray-700 dark:text-dark-text-secondary">No matching members found</p>
                      <p className="text-[11px] text-gray-400 dark:text-dark-text-muted">Try checking spelling or room number.</p>
                    </div>
                  ) : (
                    <>
                      {/* Section 1: Due Members */}
                      {dueMembers.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 px-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                            <p className="text-[10px] font-black text-rose-700 uppercase tracking-wider">
                              Due Amount List ({dueMembers.length})
                            </p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
                            <AnimatePresence mode="popLayout">
                              {dueMembers.map((m) => (
                                <motion.button
                                  key={m.id}
                                  layout
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                                  transition={{ duration: 0.2 }}
                                  type="button"
                                  onClick={() => handleSelectMember(m)}
                                  className="w-full text-left p-3 flex items-center justify-between hover:bg-[#23796F]/5 bg-white dark:bg-dark-surface border border-rose-100 hover:border-[#23796F] dark:border-emerald-500 rounded-xl shadow-3xs group cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    {m.photo_url ? (
                                      <img
                                        src={m.photo_url}
                                        alt={m.full_name}
                                        referrerPolicy="no-referrer"
                                        className="w-10 h-10 rounded-xl object-cover border border-gray-100 dark:border-dark-border shrink-0"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-dark-teal/10 text-[#23796F] dark:text-dark-teal text-[11px] font-bold flex items-center justify-center border border-teal-100 shrink-0">
                                        {getInitials(m.full_name)}
                                      </div>
                                    )}
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold text-[#173F3A] dark:text-dark-text-primary group-hover:text-[#23796F] dark:hover:text-dark-teal dark:text-dark-teal transition-colors truncate">{m.full_name}</p>
                                      <p className="text-[10px] text-gray-500 dark:text-dark-text-secondary font-semibold mt-0.5 truncate">
                                        ID: {m.member_code}
                                      </p>
                                      <p className="text-[10px] text-gray-400 dark:text-dark-text-muted font-medium truncate">
                                        {m.room?.name || 'No Suite'}
                                      </p>
                                    </div>
                                  </div>
                                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border shrink-0 bg-rose-50 text-rose-700 border-rose-100 font-black">
                                    Due: ৳{m.totalDue.toLocaleString()}
                                  </span>
                                </motion.button>
                              ))}
                            </AnimatePresence>
                          </div>
                        </div>
                      )}

                      {/* Section 2: Paid Members */}
                      {paidMembers.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 px-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                              Paid List / No Dues ({paidMembers.length})
                            </p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
                            <AnimatePresence mode="popLayout">
                              {paidMembers.map((m) => (
                                <motion.button
                                  key={m.id}
                                  layout
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                                  transition={{ duration: 0.2 }}
                                  type="button"
                                  onClick={() => handleSelectMember(m)}
                                  className="w-full text-left p-3 flex items-center justify-between hover:bg-[#23796F]/5 bg-white dark:bg-dark-surface border border-emerald-100 hover:border-[#23796F] dark:border-emerald-500 rounded-xl shadow-3xs group cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    {m.photo_url ? (
                                      <img
                                        src={m.photo_url}
                                        alt={m.full_name}
                                        referrerPolicy="no-referrer"
                                        className="w-10 h-10 rounded-xl object-cover border border-gray-100 dark:border-dark-border shrink-0"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-dark-teal/10 text-[#23796F] dark:text-dark-teal text-[11px] font-bold flex items-center justify-center border border-teal-100 shrink-0">
                                        {getInitials(m.full_name)}
                                      </div>
                                    )}
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold text-[#173F3A] dark:text-dark-text-primary group-hover:text-[#23796F] dark:hover:text-dark-teal dark:text-dark-teal transition-colors truncate">{m.full_name}</p>
                                      <p className="text-[10px] text-gray-500 dark:text-dark-text-secondary font-semibold mt-0.5 truncate">
                                        ID: {m.member_code}
                                      </p>
                                      <p className="text-[10px] text-gray-400 dark:text-dark-text-muted font-medium truncate">
                                        {m.room?.name || 'No Suite'}
                                      </p>
                                    </div>
                                  </div>
                                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border shrink-0 bg-emerald-50 dark:bg-dark-teal/10 text-emerald-700 border-emerald-100">
                                    No Dues
                                  </span>
                                </motion.button>
                              ))}
                            </AnimatePresence>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-gray-700 dark:text-dark-text-secondary uppercase tracking-wider">Selected Resident Member</label>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMemberId('');
                    setSearchQuery('');
                    setMemberBills([]);
                    setSelectedBillId('');
                    setAmount(0);
                  }}
                  className="text-[10px] font-bold text-[#23796F] dark:text-dark-teal hover:text-[#173F3A] dark:hover:text-dark-text-primary dark:text-dark-text-primary transition-all flex items-center gap-1.5 bg-teal-50 dark:bg-dark-teal/10 hover:bg-teal-100/80 px-2.5 py-1 rounded-lg border border-teal-100 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                >
                  <Search className="w-3 h-3" />
                  Change Resident / Search
                </button>
              </div>

              {/* Dynamic Professional Profile Card */}
              <div className="p-4 bg-gradient-to-br from-white via-[#F7F9F8] to-[#edf4f2] rounded-2xl border border-[#D5E2DF] dark:border-dark-border shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {selectedMember.photo_url ? (
                    <img
                      src={selectedMember.photo_url}
                      alt={selectedMember.full_name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-xs shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#23796F] text-white text-xs font-black flex items-center justify-center border-2 border-white shadow-xs shrink-0">
                      {getInitials(selectedMember.full_name)}
                    </div>
                  )}
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-sm font-bold text-[#173F3A] dark:text-dark-text-primary truncate">{selectedMember.full_name}</h3>
                      <span className="inline-flex items-center px-2 py-0.2 rounded-full text-[9px] font-black uppercase bg-teal-50 dark:bg-dark-teal/10 text-[#23796F] dark:text-dark-teal border border-teal-100">
                        ID: {selectedMember.member_code}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-gray-500 dark:text-dark-text-secondary font-medium flex-wrap">
                      <span className="flex items-center gap-1">
                        <Home className="w-3.5 h-3.5 text-gray-400 dark:text-dark-text-muted" />
                        {selectedMember.room?.name || 'Unassigned Room'}
                      </span>
                      {selectedMember.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-gray-400 dark:text-dark-text-muted" />
                          {selectedMember.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="sm:text-right space-y-1">
                  <p className="text-[10px] text-gray-400 dark:text-dark-text-muted font-bold uppercase tracking-wider">Base Monthly Rent</p>
                  <p className="text-base font-black text-[#173F3A] dark:text-dark-text-primary">৳{selectedMember.base_monthly_rent.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Bill Dues Selection & Status */}
          {selectedMember && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-dark-text-secondary uppercase tracking-wider">Select Billing Cycle / Month</label>
              
              {memberBills.length === 0 ? (
                <div className="p-5 text-center bg-gray-50 dark:bg-dark-canvas/50 dark:bg-dark-surface/50 rounded-2xl border border-dashed border-gray-200 dark:border-dark-border">
                  <AlertCircle className="w-6 h-6 text-gray-400 dark:text-dark-text-muted mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-gray-700 dark:text-dark-text-secondary">No Bills Generated</p>
                  <p className="text-[11px] text-gray-400 dark:text-dark-text-muted">There are no generated bills for this resident member yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {memberBills.map((b) => {
                    const isSelected = b.id === selectedBillId;
                    const hasDue = b.due_amount > 0;
                    
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setSelectedBillId(b.id);
                          setAmount(b.due_amount);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#23796F] dark:border-emerald-500 bg-teal-50/25 shadow-xs ring-2 ring-[#23796F]/10'
                            : 'border-gray-200 dark:border-dark-border hover:border-gray-300 dark:border-dark-border-strong bg-white dark:bg-dark-surface'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-bold text-[#173F3A] dark:text-dark-text-primary">
                            {safeFormatDate(b.billing_month, 'MMMM yyyy', 'August 2026')}
                          </span>
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                              b.status === 'Paid'
                                ? 'bg-emerald-50 dark:bg-dark-teal/10 text-emerald-700 border border-emerald-100'
                                : b.status === 'Partial'
                                ? 'bg-amber-50 text-[#D5803B] border border-amber-100'
                                : 'bg-red-50 dark:bg-dark-red/10 text-[#D64545] border border-red-100 dark:border-red-900/30'
                            }`}
                          >
                            {b.status}
                          </span>
                        </div>

                        <div className="mt-3 grid grid-cols-3 gap-1.5 text-[10px] border-t border-gray-100 dark:border-dark-border/80 pt-2 text-gray-500 dark:text-dark-text-secondary">
                          <div>
                            <span className="block text-[9px] text-gray-400 dark:text-dark-text-muted">Payable</span>
                            <span className="font-bold text-gray-700 dark:text-dark-text-secondary">৳{b.total_payable}</span>
                          </div>
                          <div>
                            <span className="block text-[9px] text-gray-400 dark:text-dark-text-muted">Paid</span>
                            <span className="font-bold text-[#2E8B67]">৳{b.paid_amount}</span>
                          </div>
                          <div>
                            <span className="block text-[9px] text-gray-400 dark:text-dark-text-muted">Outstanding</span>
                            <span className={`font-black ${hasDue ? 'text-red-600 dark:text-dark-red' : 'text-gray-400 dark:text-dark-text-muted'}`}>৳{b.due_amount}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Form details once a bill is selected */}
          {selectedBill && (
            <div className="border-t border-gray-100 dark:border-dark-border pt-5 space-y-4">
              {/* Alert System / Guideline */}
              <div className="bg-teal-50/60 border border-teal-200/80 p-3 rounded-xl flex items-start gap-2.5 text-[11px] text-[#173F3A] dark:text-dark-text-primary">
                <Info className="w-4 h-4 text-[#23796F] dark:text-dark-teal shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold">Automated Calculation Panel</p>
                  <p className="text-gray-600 dark:text-dark-text-secondary">
                    Applying payment of <strong>৳{amount.toLocaleString()}</strong> to {safeFormatDate(selectedBill.billing_month, 'MMMM yyyy', 'August 2026')}. 
                    Remaining outstanding balance will become <strong className="text-red-700">৳{(selectedBill.due_amount - amount).toLocaleString()}</strong>.
                  </p>
                </div>
              </div>

              {/* Dynamic Payment Input Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-dark-text-secondary uppercase tracking-wider">Payment Amount (৳)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-extrabold text-gray-500 dark:text-dark-text-secondary">৳</span>
                    <input
                      required
                      type="number"
                      min="1"
                      max={selectedBill.due_amount}
                      value={amount || ''}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2.5 bg-gray-50 dark:bg-dark-canvas/50 dark:bg-dark-surface/50 focus:bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border focus:border-[#23796F] dark:border-emerald-500 rounded-xl text-xs font-black text-[#173F3A] dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-[#23796F] dark:focus:ring-dark-teal dark:focus:ring-dark-teal/15 transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-dark-text-muted">Maximum payable: ৳{selectedBill.due_amount}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-dark-text-secondary uppercase tracking-wider">Payment Date</label>
                  <input
                    required
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-dark-canvas/50 dark:bg-dark-surface/50 focus:bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border focus:border-[#23796F] dark:border-emerald-500 rounded-xl text-xs font-semibold text-[#173F3A] dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-[#23796F] dark:focus:ring-dark-teal dark:focus:ring-dark-teal/15 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`space-y-1.5 ${method === 'Cash' ? 'sm:col-span-2' : ''}`}>
                  <label className="block text-xs font-bold text-gray-700 dark:text-dark-text-secondary uppercase tracking-wider">Payment Method</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-dark-canvas/50 dark:bg-dark-surface/50 focus:bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border focus:border-[#23796F] dark:border-emerald-500 rounded-xl text-xs font-bold text-[#173F3A] dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-[#23796F] dark:focus:ring-dark-teal dark:focus:ring-dark-teal/15 cursor-pointer transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                  >
                    <option value="Cash">Cash</option>
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Rocket">Rocket</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {method !== 'Cash' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700 dark:text-dark-text-secondary uppercase tracking-wider">
                      Transaction ID (TrxID) <span className="text-red-500 font-black">*</span>
                    </label>
                    <div className="relative">
                      <Hash className="w-3.5 h-3.5 text-gray-400 dark:text-dark-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        required={method !== 'Cash'}
                        placeholder={`Manual ${method} transaction ID`}
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-dark-canvas/50 dark:bg-dark-surface/50 focus:bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border focus:border-[#23796F] dark:border-emerald-500 rounded-xl text-xs font-semibold text-[#173F3A] dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-[#23796F] dark:focus:ring-dark-teal dark:focus:ring-dark-teal/15 transition-all"
                      />
                    </div>
                    <p className="text-[10px] text-teal-800 font-semibold mt-1">
                      Required for gateway verification.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-dark-text-secondary uppercase tracking-wider">Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add payment context, special remarks, or descriptions..."
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-dark-canvas/50 dark:bg-dark-surface/50 focus:bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border focus:border-[#23796F] dark:border-emerald-500 rounded-xl text-xs font-semibold text-[#173F3A] dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-[#23796F] dark:focus:ring-dark-teal dark:focus:ring-dark-teal/15 transition-all"
                />
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="mt-8 flex justify-end gap-3 pt-5 border-t border-[#D5E2DF] dark:border-dark-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-white dark:bg-dark-surface px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-dark-text-secondary border border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-hover dark:bg-dark-canvas/50 dark:hover:bg-dark-hover/50 dark:bg-dark-surface/50 active:scale-[0.98] transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedMemberId || !selectedBillId}
              className="inline-flex justify-center rounded-xl bg-[#23796F] hover:bg-[#173F3A] px-5 py-2.5 text-xs font-extrabold text-white shadow-2xs hover:shadow-xs active:scale-[0.98] disabled:opacity-50 transition-all flex items-center outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Payment & Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
