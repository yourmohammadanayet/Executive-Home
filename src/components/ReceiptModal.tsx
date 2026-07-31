import { useState } from 'react';
import { X, Printer, CheckCircle, Copy, Share2, Download } from 'lucide-react';
import { safeFormatDate } from '../lib/dateUtils';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: any;
}

export default function ReceiptModal({ isOpen, onClose, payment }: ReceiptModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !payment) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyReceiptText = () => {
    const text = `🧾 EXECUTIVE HOME - OFFICIAL MONEY RECEIPT
Receipt #: ${payment.receipt_number}
Member Name: ${payment.member?.full_name || 'Resident'} (${payment.member?.member_code || ''})
Payment Category: ${payment.payment_type}
Amount Paid: BDT ${Number(payment.amount).toLocaleString()}
Payment Date: ${safeFormatDate(payment.payment_date, 'dd MMMM yyyy')}
Payment Method: ${payment.payment_method}
${payment.transaction_id ? `Transaction ID (TrxID): ${payment.transaction_id}\n` : ''}Status: CLEARED & VERIFIED ✅
Thank you for living with Executive Home!`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-xl bg-white dark:bg-dark-surface shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#D5E2DF] dark:border-dark-border px-6 py-4 print:hidden bg-[#F5F8F7] dark:bg-dark-canvas">
          <h2 className="text-sm font-bold text-[#173F3A] dark:text-dark-text-primary uppercase tracking-wider">
            Money Receipt Details
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyReceiptText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-dark-surface border border-[#D5E2DF] dark:border-dark-border text-[#173F3A] dark:text-dark-text-primary text-xs font-bold rounded hover:bg-gray-50 dark:hover:bg-dark-hover dark:bg-dark-canvas/50 dark:hover:bg-dark-hover/50 dark:bg-dark-surface/50 transition-colors shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
              title="Copy formatted receipt text for WhatsApp/SMS share"
            >
              {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-600" /> : <Share2 className="w-3.5 h-3.5 text-[#23796F] dark:text-dark-teal" />}
              {copied ? 'Copied!' : 'Share'}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#23796F] text-white text-xs font-bold rounded hover:bg-[#173F3A] transition-colors shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
            >
              <Printer className="w-3.5 h-3.5" /> Download / Print
            </button>
            <button onClick={onClose} className="text-gray-400 dark:text-dark-text-muted hover:text-gray-600 dark:hover:text-dark-text-secondary dark:text-dark-text-secondary p-1">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-8 space-y-6 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary">
          <div className="flex justify-between items-start border-b border-gray-200 dark:border-dark-border pb-6">
            <div>
              <h1 className="text-2xl font-black text-[#173F3A] dark:text-dark-text-primary tracking-tight">EXECUTIVE HOME</h1>
              <p className="text-xs text-gray-500 dark:text-dark-text-secondary font-medium">Premium Living & Hostel Management</p>
              <p className="text-[11px] text-gray-400 dark:text-dark-text-muted mt-1">Dhaka, Bangladesh • Hotline: +880 1700-000000</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 font-bold text-xs rounded border border-green-200">
                <CheckCircle className="w-3.5 h-3.5" /> PAID RECEIPT
              </span>
              <p className="text-xs font-mono font-bold text-gray-800 dark:text-dark-text-primary mt-2">{payment.receipt_number}</p>
              <p className="text-[10px] text-gray-500 dark:text-dark-text-secondary">
                Date: {safeFormatDate(payment.payment_date, 'dd MMMM yyyy')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-[#F5F8F7] dark:bg-dark-canvas p-4 rounded-lg border border-[#D5E2DF] dark:border-dark-border text-xs">
            <div>
              <p className="text-gray-500 dark:text-dark-text-secondary uppercase text-[10px] font-semibold">Received From</p>
              <p className="font-bold text-[#173F3A] dark:text-dark-text-primary text-sm mt-0.5">{payment.member?.full_name || 'Member'}</p>
              <p className="text-gray-500 dark:text-dark-text-secondary font-mono text-[10px]">{payment.member?.member_code}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-dark-text-secondary uppercase text-[10px] font-semibold">Payment Category</p>
              <p className="font-bold text-[#173F3A] dark:text-dark-text-primary text-sm mt-0.5">{payment.payment_type}</p>
              <p className="text-gray-500 dark:text-dark-text-secondary text-[10px]">Method: {payment.payment_method}</p>
            </div>
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-dark-border text-gray-500 dark:text-dark-text-secondary uppercase text-[10px]">
                <th className="py-2 font-bold">Description</th>
                <th className="py-2 text-right font-bold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-divider">
              <tr>
                <td className="py-3 font-medium text-gray-800 dark:text-dark-text-primary">
                  {payment.payment_type} Collection
                  {payment.transaction_id && (
                    <span className="block text-[10px] text-gray-400 dark:text-dark-text-muted font-mono">
                      TRX ID: {payment.transaction_id}
                    </span>
                  )}
                </td>
                <td className="py-3 text-right font-bold text-[#173F3A] dark:text-dark-text-primary">
                  ৳{Number(payment.amount).toLocaleString()}
                </td>
              </tr>
              {payment.notes && (
                <tr>
                  <td colSpan={2} className="py-2 text-[10px] text-gray-500 dark:text-dark-text-secondary italic">
                    Note: {payment.notes}
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[#173F3A] text-sm font-bold text-[#173F3A] dark:text-dark-text-primary">
                <td className="py-3 uppercase text-xs">Total Amount Paid</td>
                <td className="py-3 text-right text-base">
                  ৳{Number(payment.amount).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="pt-8 flex justify-between items-end border-t border-gray-100 dark:border-dark-border text-[10px] text-gray-400 dark:text-dark-text-muted">
            <div>
              <p className="font-semibold text-gray-600 dark:text-dark-text-secondary">Executive Home Accounts</p>
              <p>System Generated Official Receipt</p>
            </div>
            <div className="text-center">
              <div className="w-28 border-b border-gray-300 dark:border-dark-border-strong mb-1"></div>
              <p className="font-semibold text-gray-600 dark:text-dark-text-secondary">Authorized Signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
