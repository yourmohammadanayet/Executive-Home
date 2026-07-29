import { useEffect, useState } from 'react';
import { 
  fetchDashboardOverview, 
  DashboardOverviewData 
} from '../lib/dataService';
import { 
  Users, 
  CreditCard, 
  AlertCircle, 
  Plus, 
  Banknote, 
  Receipt, 
  ArrowRight,
  Clock,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import RecordPaymentModal from '../components/RecordPaymentModal';
import AddMemberModal from '../components/AddMemberModal';
import ReceiptModal from '../components/ReceiptModal';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [overview, setOverview] = useState<DashboardOverviewData | null>(null);

  // Modals state
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [selectedBillForPayment, setSelectedBillForPayment] = useState<any>(null);
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, [selectedMonth]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await fetchDashboardOverview(selectedMonth);
      setOverview(data);
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPaymentForMember = (item: any) => {
    const mockBill = {
      id: `bill-${item.id}`,
      member_id: item.id,
      monthly_bill_id: `bill-${item.id}`,
      joining_charge_included: false,
      total_payable: item.due_amount,
      paid_amount: 0,
      due_amount: item.due_amount,
      due_date: '2026-08-10',
      member: {
        id: item.id,
        full_name: item.full_name,
        member_code: item.member_code,
      }
    };
    setSelectedBillForPayment(mockBill);
    setIsRecordPaymentOpen(true);
  };

  const handleOpenGeneralPayment = () => {
    const defaultBill = {
      id: 'bill-general',
      member_id: 'mem-7',
      joining_charge_included: false,
      total_payable: 3900,
      paid_amount: 0,
      due_amount: 3900,
      due_date: `${selectedMonth}-10`,
      member: {
        id: 'mem-7',
        full_name: 'Mohammad Anayet',
        member_code: 'EH-007',
      }
    };
    setSelectedBillForPayment(defaultBill);
    setIsRecordPaymentOpen(true);
  };

  if (loading && !overview) {
    return (
      <div className="flex items-center justify-center h-full bg-[#F7F9F8]">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#23796F]"></div>
      </div>
    );
  }

  const data = overview!;

  const primaryKPIs = [
    {
      name: 'Active Members',
      value: data.active_member_count.toString(),
      subtext: `${data.room_count} Rooms · ${data.available_seat_count} Seats Available`,
      valueColor: 'text-[#173F3A]',
      icon: Users,
      bgColor: 'bg-emerald-50/50',
    },
    {
      name: 'Monthly Payable',
      value: `BDT ${data.monthly_payable.toLocaleString()}`,
      subtext: `${data.selected_month_label} Recurring Rent`,
      valueColor: 'text-[#23796F]',
      icon: Banknote,
      bgColor: 'bg-teal-50/50',
    },
    {
      name: 'Total Collected',
      value: `BDT ${data.total_collected.toLocaleString()}`,
      subtext: `${data.collection_percentage}% Collected`,
      valueColor: 'text-[#2E8B67]',
      icon: CheckCircle2,
      bgColor: 'bg-green-50/50',
    },
    {
      name: 'Outstanding Due',
      value: `BDT ${data.total_due.toLocaleString()}`,
      subtext: `${data.due_member_count + data.overdue_member_count} Members Due`,
      valueColor: 'text-[#D64545]',
      icon: AlertCircle,
      bgColor: 'bg-red-50/50',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#F7F9F8]">
      {/* HEADER */}
      <header className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-8 py-4 bg-white border-b border-[#E1E8E6] gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#173F3A]">Dashboard</h1>
          <p className="text-xs text-gray-500 mt-0.5">Executive Home monthly overview</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Month Selector */}
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-white border border-[#E1E8E6] text-[#173F3A] text-xs font-semibold rounded-lg px-3 py-2 shadow-sm focus:ring-2 focus:ring-[#23796F] outline-none cursor-pointer pr-8"
            >
              <option value="2026-08">August 2026</option>
              <option value="2026-09">September 2026</option>
              <option value="2026-10">October 2026</option>
              <option value="2026-11">November 2026</option>
              <option value="2026-12">December 2026</option>
            </select>
          </div>

          {/* Record Payment Primary Button */}
          <button
            onClick={handleOpenGeneralPayment}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#23796F] hover:bg-[#173F3A] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
          >
            <CreditCard className="w-3.5 h-3.5" /> Record Payment
          </button>

          {/* Add Member Secondary Button */}
          <button
            onClick={() => setIsAddMemberOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#E1E8E6] text-[#173F3A] hover:bg-[#F7F9F8] text-xs font-bold rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-[#23796F]" /> Add Member
          </button>
        </div>
      </header>

      {/* MODALS */}
      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
        onSuccess={loadDashboardData}
        bill={selectedBillForPayment}
      />

      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onSuccess={loadDashboardData}
      />

      <ReceiptModal
        isOpen={selectedPaymentForReceipt !== null}
        onClose={() => setSelectedPaymentForReceipt(null)}
        payment={selectedPaymentForReceipt}
      />

      {/* DASHBOARD CONTENT BODY */}
      <div className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto">
        {/* UPCOMING MONTH BANNER (When selecting future billing period > August 2026) */}
        {data.is_upcoming && (
          <div className="bg-gradient-to-r from-[#173F3A] to-[#23796F] text-white p-6 rounded-xl shadow-md border border-teal-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 font-bold text-[10px] uppercase rounded-full">
                  Upcoming Soon
                </span>
                <span className="text-xs font-semibold text-teal-100">
                  Unlocks 1 Day Prior ({data.upcoming_unlock_date})
                </span>
              </div>
              <h2 className="text-lg font-bold">Upcoming Billing Cycle: {data.selected_month_label}</h2>
              <p className="text-xs text-teal-100/90 leading-relaxed">
                Official billing starts from <strong>August 2026</strong>. Details and automated bills for {data.selected_month_label} will activate automatically on <strong>{data.upcoming_unlock_date}</strong>. Estimated base rent pool: <strong>BDT {data.monthly_payable.toLocaleString()}</strong>.
              </p>
            </div>

            <button
              onClick={() => setSelectedMonth('2026-08')}
              className="px-4 py-2 bg-white text-[#173F3A] hover:bg-teal-50 font-bold text-xs rounded-lg shadow transition-colors shrink-0 flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-[#23796F]" /> Switch to Active (August 2026)
            </button>
          </div>
        )}

        {/* 1. PRIMARY KPI CARDS (Four in one row) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {primaryKPIs.map((kpi) => (
            <div
              key={kpi.name}
              className="p-5 bg-white rounded-xl border border-[#E1E8E6] shadow-sm flex flex-col justify-between transition-all hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{kpi.name}</p>
                  <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                    <kpi.icon className="w-4 h-4 text-[#173F3A]" />
                  </div>
                </div>
                <p className={`text-2xl font-bold mt-2 ${kpi.valueColor}`}>{kpi.value}</p>
              </div>
              <p className="text-xs text-gray-500 font-medium mt-3 pt-2 border-t border-gray-100">{kpi.subtext}</p>
            </div>
          ))}
        </div>

        {/* 2. MAIN SECTION: CHART & NEEDS ATTENTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart (2/3 width) */}
          <div className="col-span-1 lg:col-span-2 rounded-xl bg-white p-6 shadow-sm border border-[#E1E8E6] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-[#173F3A]">Monthly Payment Overview</h2>
                  <p className="text-xs text-gray-500">Paid vs Due breakdown across billing periods</p>
                </div>
                <span className="text-xs font-bold text-[#23796F] bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
                  {data.selected_month_label}
                </span>
              </div>

              <div className="h-64 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.monthly_payment_trend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E1E8E6" />
                    <XAxis dataKey="month_label" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <Tooltip
                      cursor={{ fill: '#F7F9F8' }}
                      formatter={(value: any) => [`BDT ${Number(value).toLocaleString()}`, '']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #E1E8E6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                    <Bar dataKey="paid" name="Paid (BDT)" fill="#2E8B67" radius={[4, 4, 0, 0]} maxBarSize={36} />
                    <Bar dataKey="due" name="Due (BDT)" fill="#D64545" radius={[4, 4, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E1E8E6] flex items-center justify-between text-xs text-gray-500">
              <span>Collection Performance: <strong className="text-[#2E8B67]">{data.collection_percentage}%</strong></span>
              <span>Total Rent Pool: <strong className="text-[#173F3A]">BDT {data.monthly_payable.toLocaleString()}</strong></span>
            </div>
          </div>

          {/* Needs Attention Panel (1/3 width) */}
          <div className="col-span-1 rounded-xl bg-white p-6 shadow-sm border border-[#E1E8E6] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-[#173F3A]">Needs Attention</h2>
                  <p className="text-xs text-gray-500">Members with pending or overdue balances</p>
                </div>
                <span className="text-xs font-bold text-[#D64545] bg-red-50 px-2 py-0.5 rounded border border-red-100">
                  {data.members_needing_attention.length} Action Needed
                </span>
              </div>

              <div className="space-y-3">
                {data.members_needing_attention.map((item) => (
                  <div key={item.id} className="p-3 bg-[#F7F9F8] rounded-lg border border-[#E1E8E6] flex items-center justify-between hover:border-[#23796F] transition-colors">
                    <div>
                      <p className="text-xs font-bold text-[#173F3A]">{item.full_name}</p>
                      <p className="text-[11px] text-gray-500">{item.room_name} · Due: {item.due_date}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            item.status === 'Overdue'
                              ? 'bg-red-50 text-[#D64545] border-red-200'
                              : item.status === 'Partial'
                              ? 'bg-amber-50 text-[#D5803B] border-amber-200'
                              : 'bg-red-50 text-[#D64545] border-red-200'
                          }`}
                        >
                          {item.status}
                        </span>
                        <span className="text-xs font-bold text-[#173F3A]">BDT {item.due_amount.toLocaleString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRecordPaymentForMember(item)}
                      className="px-2.5 py-1 bg-[#23796F] hover:bg-[#173F3A] text-white text-[11px] font-bold rounded transition-colors shrink-0 shadow-sm"
                    >
                      Record
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#E1E8E6]">
              <a
                href="/payments"
                className="text-xs font-bold text-[#23796F] hover:text-[#173F3A] flex items-center justify-center gap-1 transition-colors"
              >
                View All Payments <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* 3. RECENT PAYMENTS TABLE */}
        <div className="bg-white rounded-xl border border-[#E1E8E6] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#E1E8E6] flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#173F3A]">Recent Payments</h2>
              <p className="text-xs text-gray-500">Latest completed transaction records</p>
            </div>
            <a href="/payments" className="text-xs font-bold text-[#23796F] hover:underline flex items-center gap-1">
              All History <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F7F9F8] text-[11px] uppercase font-bold text-gray-600 border-b border-[#E1E8E6]">
                  <th scope="col" className="px-6 py-3">Member</th>
                  <th scope="col" className="px-4 py-3">Room</th>
                  <th scope="col" className="px-4 py-3 text-right">Amount</th>
                  <th scope="col" className="px-4 py-3">Payment Date</th>
                  <th scope="col" className="px-4 py-3">Method</th>
                  <th scope="col" className="px-4 py-3 text-center">Status</th>
                  <th scope="col" className="px-4 py-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-[#E1E8E6]">
                {data.recent_payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-gray-500 font-medium">
                      No payments recorded for {data.selected_month_label}.
                    </td>
                  </tr>
                ) : (
                  data.recent_payments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-3 font-semibold text-[#173F3A]">
                        {p.member?.full_name || 'Resident Member'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {p.member?.room?.name || 'Executive Suite'}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-[#2E8B67]">
                        BDT {p.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {p.payment_date}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {p.payment_method}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                          Completed
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedPaymentForReceipt(p)}
                          className="inline-flex items-center gap-1 text-[#23796F] hover:text-[#173F3A] font-bold text-xs"
                        >
                          <Receipt className="w-3.5 h-3.5" /> View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. PENDING JOINING CHARGES (Small secondary section) */}
        {data.pending_joining_charge_count > 0 && (
          <div className="bg-white p-4 rounded-xl border border-[#E1E8E6] shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg text-[#D5803B]">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#173F3A]">Pending One-Time Joining Charges</p>
                <p className="text-xs text-gray-600 mt-0.5">
                  <strong>{data.pending_joining_charge_count} Members</strong> with pending joining charge balance total of{' '}
                  <strong className="text-[#23796F]">BDT {data.pending_joining_charge_total.toLocaleString()}</strong>.
                </p>
              </div>
            </div>

            <a
              href="/members"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#23796F] hover:text-[#173F3A] bg-[#F7F9F8] hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-[#E1E8E6] transition-colors shrink-0"
            >
              View Details <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
