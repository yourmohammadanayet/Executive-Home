import { useEffect, useState } from 'react';
import { fetchBillsData } from '../lib/dataService';
import { Search } from 'lucide-react';
import clsx from 'clsx';
import { safeFormatDate } from '../lib/dateUtils';
import RecordPaymentModal from '../components/RecordPaymentModal';
import GenerateBillsModal from '../components/GenerateBillsModal';
import { useAuth } from '../context/AuthContext';

export default function Payments() {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { userAccess, isAdmin, isMember } = useAuth();
  
  // Modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const data = await fetchBillsData();
      setBills(data || []);
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBills = bills.filter(b => {
    if (isMember) {
      // Members can view only their own bills
      const isUserMatch = 
        b.member?.member_code === userAccess?.member_code ||
        b.member?.full_name?.toLowerCase().includes(userAccess?.full_name?.toLowerCase() || '') ||
        b.member_id === userAccess?.id;
      if (!isUserMatch) return false;
    }

    return (
      b.member?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.member?.member_code?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const statusColors = {
    'Paid': 'bg-green-50 text-green-700 ring-green-600/20',
    'Partial': 'bg-orange-50 text-orange-700 ring-orange-600/20',
    'Due': 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
    'Overdue': 'bg-red-50 text-red-700 ring-red-600/20',
    'Advance': 'bg-blue-50 text-blue-700 ring-blue-600/20',
  };

  const handleRecordPayment = (bill: any) => {
    if (!isAdmin) return;
    setSelectedBill(bill);
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F8F7]">
      {isAdmin && (
        <header className="h-14 shrink-0 flex items-center justify-end px-4 sm:px-8 bg-white border-b border-[#D5E2DF]">
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="px-4 py-2 bg-[#23796F] text-white text-xs font-bold rounded-lg hover:bg-[#173F3A] transition-colors uppercase tracking-widest shadow-sm"
          >
            Generate Bills
          </button>
        </header>
      )}

      <GenerateBillsModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onSuccess={fetchBills}
      />

      <div className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto">
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-[#D5E2DF] shadow-sm">
          <div className="relative w-full max-w-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-md border-0 py-2 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-[#23796F] sm:text-sm sm:leading-6 outline-none"
              placeholder="Search bills..."
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#D5E2DF] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[11px] uppercase text-gray-500 border-b border-[#D5E2DF]">
                  <th scope="col" className="px-6 py-3 font-semibold">Member</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Month</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Total Payable</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Paid</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Due</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                  <th scope="col" className="relative px-4 py-3 sm:pr-6"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-[#D5E2DF]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#23796F]"></div>
                    </td>
                  </tr>
                ) : filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-sm text-gray-500">
                      No bills found.
                    </td>
                  </tr>
                ) : (
                  filteredBills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-3">
                        <div className="font-medium text-[#173F3A] text-xs">{bill.member?.full_name}</div>
                        <div className="text-[10px] text-gray-500">{bill.member?.room?.name}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {safeFormatDate(bill.billing_month, 'MMMM yyyy', 'August 2026')}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#173F3A] font-bold">
                        ৳{bill.total_payable.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-xs text-green-600 font-bold">
                        ৳{bill.paid_amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-xs text-red-600 font-bold">
                        ৳{bill.due_amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-[10px]">
                        <span className={clsx(
                          'inline-block px-2 py-0.5 rounded font-bold uppercase',
                          statusColors[bill.status as keyof typeof statusColors] || statusColors['Due']
                        )}>
                          {bill.status}
                        </span>
                      </td>
                      <td className="relative px-4 py-3 text-right text-[10px] font-bold uppercase tracking-widest sm:pr-6">
                        {isAdmin && bill.due_amount > 0 && (
                          <button 
                            onClick={() => handleRecordPayment(bill)}
                            className="text-[#23796F] hover:text-[#173F3A] transition-colors"
                          >
                            Record Payment
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isPaymentModalOpen && selectedBill && (
        <RecordPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedBill(null);
          }}
          bill={selectedBill}
          onSuccess={fetchBills}
        />
      )}
    </div>
  );
}
