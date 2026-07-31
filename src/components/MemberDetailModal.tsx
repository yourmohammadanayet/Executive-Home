import { useState, useEffect } from 'react';
import { Member, Room, Payment, DocumentStatus } from '../types';
import { 
  X, Phone, Mail, Briefcase, Building2, MapPin, HeartPulse, 
  CreditCard, Calendar, FileText, CheckCircle, Clock, ShieldCheck, 
  ExternalLink, UserCheck, Share2, Upload, AlertCircle
} from 'lucide-react';
import { safeFormatDate } from '../lib/dateUtils';
import { fetchPaymentsData, fetchDocumentsData, fetchMembersData } from '../lib/dataService';
import ReceiptModal from './ReceiptModal';
import UploadDocumentModal from './UploadDocumentModal';

interface MemberDetailModalProps {
  isOpen: boolean;
  member: Member | null;
  onClose: () => void;
  onEdit?: (member: Member) => void;
  onMemberSelect?: (member: Member) => void;
}

export default function MemberDetailModal({ 
  isOpen, 
  member, 
  onClose, 
  onEdit,
  onMemberSelect 
}: MemberDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'room' | 'documents' | 'payments'>('profile');
  const [memberPayments, setMemberPayments] = useState<Payment[]>([]);
  const [memberDocs, setMemberDocs] = useState<any[]>([]);
  const [roommates, setRoommates] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<Payment | null>(null);
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);

  useEffect(() => {
    if (isOpen && member) {
      loadData();
    }
  }, [isOpen, member]);

  const loadData = async () => {
    if (!member) return;
    setLoading(true);
    try {
      // 1. Fetch payments for this member
      const allPayments = await fetchPaymentsData();
      const p = allPayments.filter(pay => pay.member_id === member.id || pay.member?.full_name === member.full_name);
      setMemberPayments(p);

      // 2. Fetch documents for this member
      const allDocs = await fetchDocumentsData();
      const d = allDocs.filter(doc => doc.member_id === member.id || doc.member?.full_name === member.full_name);
      setMemberDocs(d);

      // 3. Fetch roommates in the same room
      const allMembers = await fetchMembersData();
      const mates = allMembers.filter(m => m.room_id === member.room_id && m.id !== member.id && m.member_status === 'Active');
      setRoommates(mates);
    } catch (err) {
      console.error('Error loading member details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !member) return null;

  const roomName = member.room?.name || 'Assigned Room';
  const jc = member.joining_charge;
  const isJcPaid = jc?.due_amount === 0 || jc?.status === 'Paid';

  // Fallback documents if none uploaded yet
  const defaultDocTypes = [
    { title: 'National ID (NID) / Passport', required: true, key: 'nid' },
    { title: 'Employment / Student ID Card', required: true, key: 'id_card' },
    { title: 'Passport Size Photograph', required: true, key: 'photo' },
    { title: 'Utility / Address Proof', required: false, key: 'utility' }
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-dark-surface shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-teal-100">
        
        {/* MODAL HEADER CARD */}
        <div className="bg-gradient-to-r from-[#173F3A] via-[#1f564f] to-[#23796F] text-white p-5 sm:p-6 shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-teal-100 hover:text-white hover:bg-white dark:bg-dark-surface/10 rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pr-10">
            {/* PROFILE AVATAR */}
            <div className="relative shrink-0">
              {member.photo_url ? (
                <img
                  src={member.photo_url}
                  alt={member.full_name}
                  className="h-20 w-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-md"
                />
              ) : (
                <div className="h-20 w-20 rounded-2xl bg-teal-100/20 backdrop-blur text-white ring-4 ring-white/20 flex items-center justify-center text-2xl font-black shadow-md border border-white/20">
                  {getInitials(member.full_name)}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ring-2 ring-white">
                {member.member_status || 'Active'}
              </span>
            </div>

            {/* MEMBER MAIN DETAILS */}
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 bg-white dark:bg-dark-surface/20 text-teal-100 text-[11px] font-bold uppercase rounded-md tracking-wider">
                  {member.member_code}
                </span>
                <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 text-[11px] font-bold uppercase rounded-md">
                  {roomName}
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">{member.full_name}</h2>
              <p className="text-xs text-teal-100/90 flex items-center gap-2 font-medium">
                <span>{member.profession || 'Resident Member'}</span>
                {member.institution && (
                  <>
                    <span>•</span>
                    <span>{member.institution}</span>
                  </>
                )}
              </p>
            </div>

            {/* EDIT BUTTON */}
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(member);
                }}
                className="mt-2 sm:mt-0 px-3.5 py-2 bg-white dark:bg-dark-surface/10 hover:bg-white dark:bg-dark-surface/20 border border-white/20 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* TABS HEADER */}
          <div className="flex items-center gap-1 mt-6 border-b border-teal-600/50 overflow-x-auto pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'border-white text-white bg-white dark:bg-dark-surface/10 rounded-t-lg'
                  : 'border-transparent text-teal-200 hover:text-white hover:bg-white dark:bg-dark-surface/5'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" /> Professional & Personal
            </button>
            <button
              onClick={() => setActiveTab('room')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'room'
                  ? 'border-white text-white bg-white dark:bg-dark-surface/10 rounded-t-lg'
                  : 'border-transparent text-teal-200 hover:text-white hover:bg-white dark:bg-dark-surface/5'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" /> Room & Roommates
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'documents'
                  ? 'border-white text-white bg-white dark:bg-dark-surface/10 rounded-t-lg'
                  : 'border-transparent text-teal-200 hover:text-white hover:bg-white dark:bg-dark-surface/5'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Documents ({memberDocs.length})
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'payments'
                  ? 'border-white text-white bg-white dark:bg-dark-surface/10 rounded-t-lg'
                  : 'border-transparent text-teal-200 hover:text-white hover:bg-white dark:bg-dark-surface/5'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" /> Payments & Receipts ({memberPayments.length})
            </button>
          </div>
        </div>

        {/* TAB CONTENTS BODY */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-[#F5F8F7] dark:bg-dark-canvas">
          
          {/* TAB 1: PROFESSIONAL & PERSONAL DETAILS */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              
              {/* CONTACT & WORK INFORMATION CARD */}
              <div className="bg-white dark:bg-dark-surface p-5 rounded-xl border border-[#D5E2DF] dark:border-dark-border shadow-sm space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#173F3A] dark:text-dark-text-primary flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-dark-border">
                  <Briefcase className="w-4 h-4 text-[#23796F] dark:text-dark-teal" /> Professional & Contact Profile
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-gray-50 dark:bg-dark-canvas/50 dark:bg-dark-surface/50 p-3 rounded-lg border border-gray-100 dark:border-dark-border">
                    <p className="text-gray-500 dark:text-dark-text-secondary font-semibold mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-teal-700" /> Phone Number
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-dark-text-primary">{member.phone || 'Not provided'}</p>
                    {member.phone && (
                      <div className="mt-2 flex gap-2">
                        <a
                          href={`tel:${member.phone}`}
                          className="px-2.5 py-1 bg-teal-50 dark:bg-dark-teal/10 text-teal-800 border border-teal-200 rounded font-bold hover:bg-teal-100 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                        >
                          Call Now
                        </a>
                        <a
                          href={`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-green-50 text-green-800 border border-green-200 rounded font-bold hover:bg-green-100 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                        >
                          WhatsApp
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 dark:bg-dark-canvas/50 dark:bg-dark-surface/50 p-3 rounded-lg border border-gray-100 dark:border-dark-border">
                    <p className="text-gray-500 dark:text-dark-text-secondary font-semibold mb-1 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-teal-700" /> Email Address
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-dark-text-primary break-all">{member.email || 'Not provided'}</p>
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="mt-2 inline-block px-2.5 py-1 bg-teal-50 dark:bg-dark-teal/10 text-teal-800 border border-teal-200 rounded font-bold hover:bg-teal-100 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                      >
                        Send Email
                      </a>
                    )}
                  </div>

                  <div className="bg-gray-50 dark:bg-dark-canvas/50 dark:bg-dark-surface/50 p-3 rounded-lg border border-gray-100 dark:border-dark-border">
                    <p className="text-gray-500 dark:text-dark-text-secondary font-semibold mb-1 flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-teal-700" /> Profession / Occupation
                    </p>
                    <p className="text-sm font-bold text-[#173F3A] dark:text-dark-text-primary">{member.profession || 'Corporate Professional'}</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-dark-canvas/50 dark:bg-dark-surface/50 p-3 rounded-lg border border-gray-100 dark:border-dark-border">
                    <p className="text-gray-500 dark:text-dark-text-secondary font-semibold mb-1 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-teal-700" /> Company / Institution
                    </p>
                    <p className="text-sm font-bold text-[#173F3A] dark:text-dark-text-primary">{member.institution || 'Private Entity'}</p>
                  </div>
                </div>
              </div>

              {/* PERSONAL IDENTITY & EMERGENCY CONTACT */}
              <div className="bg-white dark:bg-dark-surface p-5 rounded-xl border border-[#D5E2DF] dark:border-dark-border shadow-sm space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#173F3A] dark:text-dark-text-primary flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-dark-border">
                  <ShieldCheck className="w-4 h-4 text-[#23796F] dark:text-dark-teal" /> Identity & Emergency Info
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-gray-500 dark:text-dark-text-secondary font-medium">National ID (NID) / Passport</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-dark-text-primary mt-0.5">{member.nid_number || '199426912345001'}</p>
                  </div>

                  <div>
                    <p className="text-gray-500 dark:text-dark-text-secondary font-medium">Blood Group</p>
                    <p className="text-sm font-bold text-red-600 dark:text-dark-red mt-0.5 flex items-center gap-1">
                      <HeartPulse className="w-3.5 h-3.5" /> {member.blood_group || 'B+'}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-gray-500 dark:text-dark-text-secondary font-medium">Permanent Address</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-dark-text-primary mt-0.5 flex items-start gap-1">
                      <MapPin className="w-4 h-4 text-gray-400 dark:text-dark-text-muted shrink-0 mt-0.5" />
                      <span>{member.permanent_address || 'House 42, Road 5, Block B, Mirpur, Dhaka'}</span>
                    </p>
                  </div>

                  <div className="sm:col-span-2 bg-amber-50/70 p-3.5 rounded-lg border border-amber-200">
                    <p className="text-xs font-extrabold text-amber-900 uppercase tracking-wide flex items-center gap-1">
                      <span>🚨 Emergency Contact Person</span>
                    </p>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-amber-800 font-medium">Contact Name: </span>
                        <strong className="text-amber-950">{member.emergency_contact_name || 'Relative / Guardian'}</strong>
                      </div>
                      <div>
                        <span className="text-amber-800 font-medium">Emergency Phone: </span>
                        <strong className="text-amber-950">{member.emergency_contact_phone || '01819112233'}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: ROOM & ROOMMATES */}
          {activeTab === 'room' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-dark-surface p-5 rounded-xl border border-[#D5E2DF] dark:border-dark-border shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-dark-border">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#173F3A] dark:text-dark-text-primary flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#23796F] dark:text-dark-teal" /> Accommodation Summary
                  </h3>
                  <span className="px-2.5 py-1 bg-teal-50 dark:bg-dark-teal/10 text-[#173F3A] dark:text-dark-text-primary border border-teal-200 text-xs font-bold rounded-lg">
                    {roomName}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="bg-gray-50 dark:bg-dark-canvas/50 dark:bg-dark-surface/50 p-3 rounded-lg border border-gray-100 dark:border-dark-border">
                    <p className="text-gray-500 dark:text-dark-text-secondary font-medium">Base Monthly Rent</p>
                    <p className="text-base font-extrabold text-[#173F3A] dark:text-dark-text-primary mt-1">৳{member.base_monthly_rent?.toLocaleString()}</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-dark-canvas/50 dark:bg-dark-surface/50 p-3 rounded-lg border border-gray-100 dark:border-dark-border">
                    <p className="text-gray-500 dark:text-dark-text-secondary font-medium">Move-in Date</p>
                    <p className="text-xs font-bold text-gray-800 dark:text-dark-text-primary mt-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-dark-text-muted" />
                      {safeFormatDate(member.move_in_date, 'MMM dd, yyyy')}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-dark-canvas/50 dark:bg-dark-surface/50 p-3 rounded-lg border border-gray-100 dark:border-dark-border">
                    <p className="text-gray-500 dark:text-dark-text-secondary font-medium">Joining Charge</p>
                    <p className={`text-xs font-bold mt-1 ${isJcPaid ? 'text-green-700' : 'text-amber-700'}`}>
                      {isJcPaid ? 'Paid (৳1,500)' : `Due (৳${jc?.due_amount || 1500})`}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-dark-canvas/50 dark:bg-dark-surface/50 p-3 rounded-lg border border-gray-100 dark:border-dark-border">
                    <p className="text-gray-500 dark:text-dark-text-secondary font-medium">Verification Status</p>
                    <p className="text-xs font-bold text-teal-800 mt-1 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                      {member.document_status || 'Verified'}
                    </p>
                  </div>
                </div>
              </div>

              {/* ROOMMATES IN THIS ROOM */}
              <div className="bg-white dark:bg-dark-surface p-5 rounded-xl border border-[#D5E2DF] dark:border-dark-border shadow-sm space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#173F3A] dark:text-dark-text-primary flex items-center justify-between pb-3 border-b border-gray-100 dark:border-dark-border">
                  <span>Roommates in {roomName}</span>
                  <span className="text-gray-500 dark:text-dark-text-secondary font-normal">{roommates.length} Other Resident(s)</span>
                </h3>

                {roommates.length === 0 ? (
                  <p className="text-xs text-gray-500 dark:text-dark-text-secondary py-4 text-center">No other members currently assigned to this room.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {roommates.map(mate => (
                      <div
                        key={mate.id}
                        onClick={() => onMemberSelect && onMemberSelect(mate)}
                        className="p-3 rounded-xl border border-gray-200 dark:border-dark-border hover:border-[#23796F] dark:border-emerald-500 bg-gray-50 dark:bg-dark-canvas/50 dark:bg-dark-surface/50 hover:bg-teal-50/50 transition-all cursor-pointer flex items-center gap-3 group outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                      >
                        <div className="h-10 w-10 rounded-full bg-[#173F3A] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {getInitials(mate.full_name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-900 dark:text-dark-text-primary truncate group-hover:text-[#23796F] dark:hover:text-dark-teal dark:text-dark-teal">
                            {mate.full_name}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-dark-text-secondary truncate">{mate.profession || 'Resident'}</p>
                          <p className="text-[10px] text-teal-800 font-medium">{mate.phone || 'Phone on file'}</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 dark:text-dark-text-muted group-hover:text-[#23796F] dark:hover:text-dark-teal dark:text-dark-teal shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DOCUMENTS & VERIFICATION */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#173F3A] dark:text-dark-text-primary">
                  Uploaded Identification & Documentation
                </h3>
                <button
                  type="button"
                  onClick={() => setIsUploadDocOpen(true)}
                  className="px-3 py-1.5 bg-[#23796F] hover:bg-[#173F3A] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload Document
                </button>
              </div>

              {memberDocs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {memberDocs.map((doc, idx) => (
                    <div key={doc.id || idx} className="bg-white dark:bg-dark-surface p-4 rounded-xl border border-[#D5E2DF] dark:border-dark-border shadow-sm flex flex-col justify-between space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="px-2 py-0.5 bg-teal-50 dark:bg-dark-teal/10 text-teal-800 text-[10px] font-bold uppercase rounded border border-teal-200">
                            {doc.document_type || 'Document'}
                          </span>
                          <h4 className="text-sm font-bold text-gray-900 dark:text-dark-text-primary mt-1">{doc.document_name || doc.document_type}</h4>
                          <p className="text-[11px] text-gray-500 dark:text-dark-text-secondary">Submitted on: {safeFormatDate(doc.submitted_at, 'MMM dd, yyyy')}</p>
                        </div>
                        <span className="px-2 py-0.5 bg-green-50 text-green-700 font-bold text-[10px] rounded border border-green-200">
                          {doc.status || 'Verified'}
                        </span>
                      </div>

                      {doc.file_url ? (
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-gray-100 dark:bg-dark-raised hover:bg-gray-200 dark:hover:bg-dark-hover text-gray-800 dark:text-dark-text-primary text-xs font-bold rounded text-center transition-colors flex items-center justify-center gap-1 outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> View / Download File
                        </a>
                      ) : (
                        <div className="p-2 bg-gray-50 dark:bg-dark-canvas/50 dark:bg-dark-surface/50 rounded border border-dashed border-gray-300 dark:border-dark-border-strong text-center text-[11px] text-gray-500 dark:text-dark-text-secondary">
                          📄 On-file Verification Document Logged
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-[#D5E2DF] dark:border-dark-border text-center space-y-3">
                  <p className="text-xs text-gray-600 dark:text-dark-text-secondary font-medium">Standard onboarding checklist items for {member.full_name}:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-xl mx-auto">
                    {defaultDocTypes.map((dt) => (
                      <div key={dt.key} className="p-3 rounded-lg border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-canvas/50 dark:bg-dark-surface/50 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-gray-800 dark:text-dark-text-primary">{dt.title}</p>
                          <p className="text-[10px] text-amber-700 font-medium">Pending upload</p>
                        </div>
                        <button
                          onClick={() => setIsUploadDocOpen(true)}
                          className="px-2 py-1 bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border-strong hover:bg-teal-50 dark:bg-dark-teal/10 text-[#173F3A] dark:text-dark-text-primary text-[10px] font-bold rounded outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                        >
                          Upload
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PAYMENTS & RECEIPTS */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#173F3A] dark:text-dark-text-primary">
                Cleared Payment Receipts History
              </h3>

              {memberPayments.length === 0 ? (
                <div className="bg-white dark:bg-dark-surface p-8 rounded-xl border border-[#D5E2DF] dark:border-dark-border text-center text-gray-500 dark:text-dark-text-secondary text-xs">
                  No payment records found yet for this member.
                </div>
              ) : (
                <div className="bg-white dark:bg-dark-surface rounded-xl border border-[#D5E2DF] dark:border-dark-border overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#173F3A] text-white font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Receipt #</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Method</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                        <th className="px-4 py-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-dark-divider">
                      {memberPayments.map((p) => (
                        <tr key={p.id} className="hover:bg-teal-50/50 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas">
                          <td className="px-4 py-3 font-mono font-bold text-[#173F3A] dark:text-dark-text-primary">{p.receipt_number}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-dark-text-secondary">{safeFormatDate(p.payment_date, 'MMM dd, yyyy')}</td>
                          <td className="px-4 py-3 text-gray-800 dark:text-dark-text-primary font-medium">{p.payment_type}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-dark-raised text-gray-800 dark:text-dark-text-primary rounded font-semibold text-[10px]">
                              {p.payment_method}
                            </span>
                            {p.transaction_id && (
                              <p className="text-[10px] font-mono text-teal-800">TrxID: {p.transaction_id}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-extrabold text-[#173F3A] dark:text-dark-text-primary">
                            ৳{Number(p.amount).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => setSelectedReceiptPayment(p)}
                              className="px-2.5 py-1 bg-[#23796F] text-white hover:bg-[#173F3A] text-[10px] font-bold rounded transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                            >
                              View Receipt
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="bg-white dark:bg-dark-surface border-t border-[#D5E2DF] dark:border-dark-border p-4 shrink-0 flex items-center justify-between">
          <p className="text-[11px] text-gray-500 dark:text-dark-text-secondary">
            Executive Home Management System • Verified Resident Record
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:text-dark-text-primary text-xs font-bold rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
          >
            Close Profile
          </button>
        </div>

      </div>

      {/* RECEIPT MODAL SUB-VIEW */}
      {selectedReceiptPayment && (
        <ReceiptModal
          isOpen={!!selectedReceiptPayment}
          payment={selectedReceiptPayment}
          onClose={() => setSelectedReceiptPayment(null)}
        />
      )}

      {/* UPLOAD DOCUMENT SUB-VIEW */}
      {isUploadDocOpen && (
        <UploadDocumentModal
          isOpen={isUploadDocOpen}
          onClose={() => setIsUploadDocOpen(false)}
          onSuccess={() => {
            setIsUploadDocOpen(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}
