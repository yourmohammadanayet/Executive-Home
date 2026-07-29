import { useState, useEffect } from 'react';
import { fetchBillsData, fetchMembersData, fetchPaymentsData, fetchRoomsData } from '../lib/dataService';
import { X, Printer, Download, FileSpreadsheet } from 'lucide-react';
import { safeFormatDate } from '../lib/dateUtils';

interface ReportViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportTitle: string;
}

export default function ReportViewerModal({ isOpen, onClose, reportTitle }: ReportViewerModalProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadReportData();
    }
  }, [isOpen, reportTitle]);

  const loadReportData = async () => {
    setLoading(true);
    if (reportTitle.includes('Rent') || reportTitle.includes('Paid, Partial')) {
      const bills = await fetchBillsData();
      setData(bills);
    } else if (reportTitle.includes('Member')) {
      const members = await fetchMembersData();
      setData(members);
    } else if (reportTitle.includes('Room')) {
      const rooms = await fetchRoomsData();
      setData(rooms);
    } else {
      const payments = await fetchPaymentsData();
      setData(payments);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]).filter((k) => typeof data[0][k] !== 'object');
    const csvRows = [
      headers.join(','),
      ...data.map((row) => headers.map((h) => JSON.stringify(row[h] ?? '')).join(',')),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportTitle.replace(/\s+/g, '_')}_${safeFormatDate(new Date(), 'yyyyMMdd')}.csv`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-xl bg-white shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between border-b border-[#D5E2DF] px-6 py-4 bg-[#F5F8F7]">
          <h2 className="text-base font-bold text-[#173F3A] uppercase tracking-wider">
            {reportTitle}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-700 text-white text-xs font-bold rounded hover:bg-green-800 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#23796F] text-white text-xs font-bold rounded hover:bg-[#173F3A] transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Print Report
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[75vh]">
          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#23796F]"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#173F3A]">EXECUTIVE HOME MANAGEMENT</h3>
                  <p className="text-xs text-gray-500">{reportTitle} • Generated on {safeFormatDate(new Date(), 'MMMM dd, yyyy')}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-700">Total Records: {data.length}</p>
                </div>
              </div>

              <div className="overflow-x-auto border border-[#D5E2DF] rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 uppercase text-gray-500 font-semibold border-b border-[#D5E2DF]">
                      {reportTitle.includes('Rent') || reportTitle.includes('Paid, Partial') ? (
                        <>
                          <th className="px-4 py-3">Member</th>
                          <th className="px-4 py-3">Month</th>
                          <th className="px-4 py-3">Payable</th>
                          <th className="px-4 py-3">Paid</th>
                          <th className="px-4 py-3">Due</th>
                          <th className="px-4 py-3">Status</th>
                        </>
                      ) : reportTitle.includes('Room') ? (
                        <>
                          <th className="px-4 py-3">Room Name</th>
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3">Capacity</th>
                          <th className="px-4 py-3">Status</th>
                        </>
                      ) : reportTitle.includes('Member') ? (
                        <>
                          <th className="px-4 py-3">Code</th>
                          <th className="px-4 py-3">Member Name</th>
                          <th className="px-4 py-3">Room</th>
                          <th className="px-4 py-3">Base Rent</th>
                          <th className="px-4 py-3">Status</th>
                        </>
                      ) : (
                        <>
                          <th className="px-4 py-3">Receipt</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Member</th>
                          <th className="px-4 py-3">Method</th>
                          <th className="px-4 py-3">Amount</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D5E2DF]">
                    {data.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        {reportTitle.includes('Rent') || reportTitle.includes('Paid, Partial') ? (
                          <>
                            <td className="px-4 py-2.5 font-semibold text-[#173F3A]">
                              {row.member?.full_name || 'Member'}
                            </td>
                            <td className="px-4 py-2.5 text-gray-500">
                              {safeFormatDate(row.billing_month, 'MMM yyyy')}
                            </td>
                            <td className="px-4 py-2.5 font-bold">৳{row.total_payable?.toLocaleString()}</td>
                            <td className="px-4 py-2.5 text-green-600 font-bold">৳{row.paid_amount?.toLocaleString()}</td>
                            <td className="px-4 py-2.5 text-red-600 font-bold">৳{row.due_amount?.toLocaleString()}</td>
                            <td className="px-4 py-2.5 font-bold uppercase text-[10px]">{row.status}</td>
                          </>
                        ) : reportTitle.includes('Room') ? (
                          <>
                            <td className="px-4 py-2.5 font-bold text-[#173F3A]">{row.name}</td>
                            <td className="px-4 py-2.5 text-gray-600">{row.type}</td>
                            <td className="px-4 py-2.5">{row.capacity} Person(s)</td>
                            <td className="px-4 py-2.5 font-bold text-[10px] uppercase">{row.status}</td>
                          </>
                        ) : reportTitle.includes('Member') ? (
                          <>
                            <td className="px-4 py-2.5 font-mono">{row.member_code}</td>
                            <td className="px-4 py-2.5 font-bold text-[#173F3A]">{row.full_name}</td>
                            <td className="px-4 py-2.5">{row.room?.name || 'Unassigned'}</td>
                            <td className="px-4 py-2.5 font-bold">৳{row.base_monthly_rent?.toLocaleString()}</td>
                            <td className="px-4 py-2.5 font-bold text-[10px] uppercase">{row.member_status}</td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-2.5 font-mono text-[#173F3A] font-bold">{row.receipt_number}</td>
                            <td className="px-4 py-2.5 text-gray-500">{row.payment_date}</td>
                            <td className="px-4 py-2.5 font-semibold">{row.member?.full_name}</td>
                            <td className="px-4 py-2.5 text-gray-600">{row.payment_method}</td>
                            <td className="px-4 py-2.5 text-green-600 font-bold">৳{row.amount?.toLocaleString()}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
