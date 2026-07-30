import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Member } from '../types';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  Building2, 
  CreditCard, 
  ShieldCheck, 
  Send, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  DoorClosed,
  Droplet
} from 'lucide-react';
import { submitProfileUpdateRequest, getProfileUpdateRequests } from '../lib/accessControlService';

export default function MyProfile() {
  const { userAccess } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phone, setPhone] = useState(userAccess?.phone || '');
  const [email, setEmail] = useState(userAccess?.email || '');
  const [profession, setProfession] = useState('Senior Software Engineer');
  const [institution, setInstitution] = useState('Brain Station 23');
  const [emergencyContactName, setEmergencyContactName] = useState('MD. Rafiqul Islam (Father)');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('01819000000');
  const [permanentAddress, setPermanentAddress] = useState('House 42, Road 5, Mirpur, Dhaka');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const requests = getProfileUpdateRequests().filter(r => 
    r.member_code === userAccess?.member_code || r.member_id === userAccess?.id
  );

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    submitProfileUpdateRequest({
      member_id: userAccess?.id || 'mem-1',
      member_name: userAccess?.full_name || 'Member User',
      member_code: userAccess?.member_code || 'EH-001',
      requested_fields: {
        phone,
        email,
        profession,
        institution,
        emergency_contact_name: emergencyContactName,
        emergency_contact_phone: emergencyContactPhone,
        permanent_address: permanentAddress,
      },
      notes,
    });

    setSubmitting(false);
    setIsModalOpen(false);
    setMessage('Your profile update request has been submitted to the Admin for review.');
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F8F7]">
      {/* Header */}
      <header className="shrink-0 bg-white border-b border-[#D5E2DF] px-4 py-3 sm:px-8 flex items-center justify-end">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#23796F] text-white rounded-lg font-semibold text-xs uppercase tracking-wider hover:bg-[#173F3A] transition-colors shadow-sm"
        >
          <Send className="w-4 h-4" /> Request Profile Update
        </button>
      </header>

      <div className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto max-w-6xl mx-auto w-full">
        {message && (
          <div className="p-4 bg-teal-50 border border-teal-200 text-teal-900 rounded-xl text-sm font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#23796F]" />
              <span>{message}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-teal-700 text-xs font-bold hover:underline">Dismiss</button>
          </div>
        )}

        {/* Profile Card Header */}
        <div className="bg-white rounded-xl border border-[#D5E2DF] p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#173F3A] text-white text-2xl font-bold flex items-center justify-center border-2 border-[#23796F]">
              {userAccess?.full_name?.charAt(0) || 'M'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#173F3A]">{userAccess?.full_name || 'MD. Ismail Hossain'}</h2>
                <span className="px-2.5 py-0.5 bg-[#EBF3F2] text-[#173F3A] border border-[#23796F]/30 text-xs font-bold rounded-full">
                  {userAccess?.member_code || 'EH-001'}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium mt-1">
                {userAccess?.email || 'ismail@exechome.com'} • {userAccess?.phone || '01700112233'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Approval Status: Approved
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Login: Enabled
            </span>
          </div>
        </div>

        {/* Read-Only Information Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Room & Rent Details */}
          <div className="bg-white rounded-xl border border-[#D5E2DF] p-6 shadow-sm space-y-4">
            <h3 className="text-base font-semibold text-[#173F3A] flex items-center gap-2 border-b border-[#D5E2DF] pb-3">
              <DoorClosed className="w-5 h-5 text-[#23796F]" /> Room & Financial Assignment
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Assigned Room</span>
                <span className="font-bold text-[#173F3A]">{userAccess?.room_name || 'Attached Master Bedroom'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Monthly Rent</span>
                <span className="font-bold text-[#23796F]">৳3,450 / month</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500 font-medium">One-time Joining Charge</span>
                <span className="font-bold text-gray-800">৳1,500 (Separately Payable)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-500 font-medium">Move-in Date</span>
                <span className="font-semibold text-gray-700">01 Jan 2025</span>
              </div>
            </div>
          </div>

          {/* Personal & Identification Details */}
          <div className="bg-white rounded-xl border border-[#D5E2DF] p-6 shadow-sm space-y-4">
            <h3 className="text-base font-semibold text-[#173F3A] flex items-center gap-2 border-b border-[#D5E2DF] pb-3">
              <User className="w-5 h-5 text-[#23796F]" /> Personal & Contact Info
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Profession</span>
                <span className="font-semibold text-gray-800">Software Engineer</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Institution / Employer</span>
                <span className="font-semibold text-gray-800">Brain Station 23</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Blood Group</span>
                <span className="font-bold text-red-600">B+</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-500 font-medium">Emergency Contact</span>
                <span className="font-semibold text-gray-800">MD. Rafiqul Islam (01819000000)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Update Requests History */}
        <div className="bg-white rounded-xl border border-[#D5E2DF] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#D5E2DF] pb-3">
            <h3 className="text-base font-semibold text-[#173F3A] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#23796F]" /> Update Requests History
            </h3>
            <span className="text-xs text-gray-500">Sent directly to Admin for review</span>
          </div>

          {requests.length === 0 ? (
            <p className="text-xs text-gray-500 py-4 text-center">
              No profile update requests submitted yet. Click "Request Profile Update" above if you need to update any info.
            </p>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div key={req.id} className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-[#173F3A]">Requested Fields Update</div>
                    <div className="text-gray-600 mt-0.5">
                      {Object.entries(req.requested_fields || {}).map(([k, v]) => `${k.replace('_', ' ')}: ${v}`).join(' • ')}
                    </div>
                    {req.notes && <div className="text-gray-500 italic mt-1">Note: "{req.notes}"</div>}
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-[10px] text-gray-400">
                      {new Date(req.created_at).toLocaleDateString()}
                    </span>
                    <span className={`px-2.5 py-1 rounded text-[11px] font-bold border ${
                      req.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                      req.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Request Update Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-[#D5E2DF] animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-[#D5E2DF] pb-3">
              <h3 className="text-lg font-bold text-[#173F3A]">Request Profile Update</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 bg-teal-50 p-3 rounded-md border border-teal-100">
              Note: As a Member, your changes cannot be saved directly. Submitting this request will send your proposed updates to the Admin for review and approval.
            </p>

            <form onSubmit={handleSubmitRequest} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 text-xs focus:ring-2 focus:ring-[#23796F] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 text-xs focus:ring-2 focus:ring-[#23796F] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Profession</label>
                  <input
                    type="text"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="w-full rounded-md border border-gray-300 p-2 text-xs focus:ring-2 focus:ring-[#23796F] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Company / Institution</label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full rounded-md border border-gray-300 p-2 text-xs focus:ring-2 focus:ring-[#23796F] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    className="w-full rounded-md border border-gray-300 p-2 text-xs focus:ring-2 focus:ring-[#23796F] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Emergency Phone</label>
                  <input
                    type="text"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    className="w-full rounded-md border border-gray-300 p-2 text-xs focus:ring-2 focus:ring-[#23796F] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Permanent Address</label>
                <input
                  type="text"
                  value={permanentAddress}
                  onChange={(e) => setPermanentAddress(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 text-xs focus:ring-2 focus:ring-[#23796F] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Reason / Notes for Admin</label>
                <textarea
                  rows={2}
                  value={notes}
                  placeholder="e.g. Moved to a new permanent address, updated my mobile number..."
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 text-xs focus:ring-2 focus:ring-[#23796F] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#D5E2DF]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold text-xs hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#23796F] text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-[#173F3A]"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
