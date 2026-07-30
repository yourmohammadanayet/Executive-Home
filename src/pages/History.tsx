import { useEffect, useState } from 'react';
import { fetchPaymentsData } from '../lib/dataService';
import { Search, Download, Eye } from 'lucide-react';
import { safeFormatDate } from '../lib/dateUtils';
import ReceiptModal from '../components/ReceiptModal';
import { useAuth } from '../context/AuthContext';

export default function History() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const { userAccess, isMember } = useAuth();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await fetchPaymentsData();
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(p => {
    if (isMember) {
      // Member can view only their own payment receipts
      const isUserMatch = 
        p.member?.member_code === userAccess?.member_code ||
        p.member?.full_name?.toLowerCase().includes(userAccess?.full_name?.toLowerCase() || '') ||
        p.member_id === userAccess?.id;
      if (!isUserMatch) return false;
    }

    return (
      p.member?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.receipt_number?.toLowerCase().includes(search.toLowerCase()) ||
      (p.transaction_id && p.transaction_id.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const handleViewReceipt = (payment: any) => {
    setSelectedPayment(payment);
    setIsReceiptOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F8F7]">
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        payment={selectedPayment}
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
              placeholder="Search receipt, member, or TRX ID..."
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#D5E2DF] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[11px] uppercase text-gray-500 border-b border-[#D5E2DF]">
                  <th scope="col" className="px-6 py-3 font-semibold">Receipt #</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Date</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Member</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Type</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Method</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Amount</th>
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
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-sm text-gray-500">
                      No payments found.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-3 font-medium text-[#173F3A] text-xs">
                        {payment.receipt_number}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {safeFormatDate(payment.payment_date, 'MMM dd, yyyy')}
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-[#173F3A]">
                        {payment.member?.full_name}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 uppercase tracking-wide">
                        {payment.payment_type}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        <div className="flex flex-col">
                          <span>{payment.payment_method}</span>
                          {payment.transaction_id && (
                            <span className="text-[10px] text-gray-400 font-mono mt-0.5">TRX: {payment.transaction_id}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-green-600 font-bold">
                        ৳{payment.amount.toLocaleString()}
                      </td>
                      <td className="relative px-4 py-3 text-right text-xs font-bold uppercase tracking-widest sm:pr-6">
                        <button 
                          onClick={() => handleViewReceipt(payment)}
                          className="text-[#23796F] hover:text-[#173F3A] flex items-center justify-end gap-1 w-full transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" /> Receipt
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
