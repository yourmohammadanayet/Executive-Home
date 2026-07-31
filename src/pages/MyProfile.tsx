import React, { useState, useEffect } from 'react';
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
  Droplet,
  Edit2
} from 'lucide-react';
import { 
  submitProfileUpdateRequest, 
  getProfileUpdateRequests, 
  updateDirectUserProfile, 
  addAuditEntry 
} from '../lib/accessControlService';

export default function MyProfile() {
  const { userAccess, refreshUserAccess, isAdmin } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullName, setFullName] = useState(userAccess?.full_name || '');
  const [phone, setPhone] = useState(userAccess?.phone || '');
  const [email, setEmail] = useState(userAccess?.email || '');
  const [profession, setProfession] = useState('Senior Software Engineer');
  const [institution, setInstitution] = useState('Brain Station 23');
  const [emergencyContactName, setEmergencyContactName] = useState('MD. Rafiqul Islam (Father)');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('01819000000');
  const [permanentAddress, setPermanentAddress] = useState('House 42, Road 5, Mirpur, Dhaka');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Load from members table dynamically to show actual values
  useEffect(() => {
    try {
      const membersStr = localStorage.getItem('eh_members');
      if (membersStr) {
        const members = JSON.parse(membersStr);
        const match = members.find((m: any) => 
          m.member_code === userAccess?.member_code || 
          m.id === userAccess?.id || 
          m.full_name?.toLowerCase() === userAccess?.full_name?.toLowerCase()
        );
        if (match) {
          if (match.full_name) setFullName(match.full_name);
          if (match.phone) setPhone(match.phone);
          if (match.email) setEmail(match.email);
          if (match.profession) setProfession(match.profession);
          if (match.institution) setInstitution(match.institution);
          if (match.emergency_contact_name) setEmergencyContactName(match.emergency_contact_name);
          if (match.emergency_contact_phone) setEmergencyContactPhone(match.emergency_contact_phone);
          if (match.permanent_address) setPermanentAddress(match.permanent_address);
          if (match.blood_group) setBloodGroup(match.blood_group);
        }
      }
    } catch (e) {
      console.error('Error reading member details:', e);
    }
  }, [userAccess]);

  const requests = getProfileUpdateRequests().filter(r => 
    r.member_code === userAccess?.member_code || r.member_id === userAccess?.id
  );

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    submitProfileUpdateRequest({
      member_id: userAccess?.id || 'mem-1',
      member_name: fullName || userAccess?.full_name || 'Member User',
      member_code: userAccess?.member_code || 'EH-001',
      requested_fields: {
        phone,
        email,
        profession,
        institution,
        emergency_contact_name: emergencyContactName,
        emergency_contact_phone: emergencyContactPhone,
        permanent_address: permanentAddress,
        blood_group: bloodGroup,
      },
      notes,
    });

    setSubmitting(false);
    setIsModalOpen(false);
    setMessage('Your profile update request has been submitted to the Admin for review.');
    setTimeout(() => setMessage(null), 5000);
  };

  const handleDirectSave = () => {
    setSubmitting(true);
    
    updateDirectUserProfile(
      userAccess?.id || 'mem-1',
      {
        full_name: fullName,
        email,
        phone,
      },
      {
        profession,
        institution,
        emergency_contact_name: emergencyContactName,
        emergency_contact_phone: emergencyContactPhone,
        permanent_address: permanentAddress,
        blood_group: bloodGroup,
      }
    );

    addAuditEntry({
      actor_name: userAccess?.full_name || 'System User',
      actor_email: userAccess?.email || '',
      action: 'Direct Profile Self-Update Saved',
      target_user: `${fullName} (${userAccess?.member_code || 'EH-001'})`,
      new_value: `Saved updated contact & personal info directly`,
    });

    refreshUserAccess();
    setSubmitting(false);
    setIsModalOpen(false);
    setMessage('Your profile has been updated and saved directly to the database.');
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F8F7] dark:bg-dark-canvas">
      {/* Header */}
      <header className="shrink-0 bg-white dark:bg-dark-surface border-b border-[#D5E2DF] dark:border-dark-border px-4 py-3 sm:px-8 flex items-center justify-end">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#23796F] text-white rounded-lg font-semibold text-xs uppercase tracking-wider hover:bg-[#173F3A] transition-colors shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
        >
          <Edit2 className="w-4 h-4" /> Edit Profile & Settings
        </button>
      </header>

      <div className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto max-w-6xl mx-auto w-full">
        {message && (
          <div className="p-4 bg-teal-50 dark:bg-dark-teal/10 border border-teal-200 text-teal-900 rounded-xl text-sm font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#23796F] dark:text-dark-teal" />
              <span>{message}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-teal-700 text-xs font-bold hover:underline">Dismiss</button>
          </div>
        )}

        {/* Profile Card Header */}
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-[#D5E2DF] dark:border-dark-border p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#173F3A] text-white text-2xl font-bold flex items-center justify-center border-2 border-[#23796F] dark:border-emerald-500">
              {fullName?.charAt(0) || 'M'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#173F3A] dark:text-dark-text-primary">{fullName || 'MD. Ismail Hossain'}</h2>
                <span className="px-2.5 py-0.5 bg-[#EBF3F2] text-[#173F3A] dark:text-dark-text-primary border border-[#23796F] dark:border-emerald-500/30 text-xs font-bold rounded-full">
                  {userAccess?.member_code || 'EH-001'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-dark-text-secondary font-medium mt-1">
                {email || 'ismail@exechome.com'} • {phone || '01700112233'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Approval Status: Approved
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 dark:bg-dark-teal/10 text-teal-800 border border-teal-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Login: Enabled
            </span>
          </div>
        </div>

        {/* Read-Only Information Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Room & Rent Details */}
          <div className="bg-white dark:bg-dark-surface rounded-xl border border-[#D5E2DF] dark:border-dark-border p-6 shadow-sm space-y-4">
            <h3 className="text-base font-semibold text-[#173F3A] dark:text-dark-text-primary flex items-center gap-2 border-b border-[#D5E2DF] dark:border-dark-border pb-3">
              <DoorClosed className="w-5 h-5 text-[#23796F] dark:text-dark-teal" /> Room & Financial Assignment
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-dark-border">
                <span className="text-gray-500 dark:text-dark-text-secondary font-medium">Assigned Room</span>
                <span className="font-bold text-[#173F3A] dark:text-dark-text-primary">{userAccess?.room_name || 'Attached Master Bedroom'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-dark-border">
                <span className="text-gray-500 dark:text-dark-text-secondary font-medium">Monthly Rent</span>
                <span className="font-bold text-[#23796F] dark:text-dark-teal">৳3,450 / month</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-dark-border">
                <span className="text-gray-500 dark:text-dark-text-secondary font-medium">One-time Joining Charge</span>
                <span className="font-bold text-gray-800 dark:text-dark-text-primary">৳1,500 (Separately Payable)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-500 dark:text-dark-text-secondary font-medium">Move-in Date</span>
                <span className="font-semibold text-gray-700 dark:text-dark-text-secondary">01 Jan 2025</span>
              </div>
            </div>
          </div>

          {/* Personal & Identification Details */}
          <div className="bg-white dark:bg-dark-surface rounded-xl border border-[#D5E2DF] dark:border-dark-border p-6 shadow-sm space-y-4">
            <h3 className="text-base font-semibold text-[#173F3A] dark:text-dark-text-primary flex items-center gap-2 border-b border-[#D5E2DF] dark:border-dark-border pb-3">
              <User className="w-5 h-5 text-[#23796F] dark:text-dark-teal" /> Personal & Contact Info
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-dark-border">
                <span className="text-gray-500 dark:text-dark-text-secondary font-medium">Profession</span>
                <span className="font-semibold text-gray-800 dark:text-dark-text-primary">{profession}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-dark-border">
                <span className="text-gray-500 dark:text-dark-text-secondary font-medium">Institution / Employer</span>
                <span className="font-semibold text-gray-800 dark:text-dark-text-primary">{institution}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-dark-border">
                <span className="text-gray-500 dark:text-dark-text-secondary font-medium">Blood Group</span>
                <span className="font-bold text-red-600 dark:text-dark-red">{bloodGroup}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-500 dark:text-dark-text-secondary font-medium">Emergency Contact</span>
                <span className="font-semibold text-gray-800 dark:text-dark-text-primary">{emergencyContactName} ({emergencyContactPhone})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Update Requests History */}
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-[#D5E2DF] dark:border-dark-border p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#D5E2DF] dark:border-dark-border pb-3">
            <h3 className="text-base font-semibold text-[#173F3A] dark:text-dark-text-primary flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#23796F] dark:text-dark-teal" /> Update Requests History
            </h3>
            <span className="text-xs text-gray-500 dark:text-dark-text-secondary">Sent directly to Admin for review</span>
          </div>

          {requests.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-dark-text-secondary py-4 text-center">
              No profile update requests submitted yet. Click "Request Profile Update" above if you need to update any info.
            </p>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div key={req.id} className="p-3.5 bg-gray-50 dark:bg-dark-canvas/50 dark:bg-dark-surface/50 rounded-lg border border-gray-200 dark:border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-[#173F3A] dark:text-dark-text-primary">Requested Fields Update</div>
                    <div className="text-gray-600 dark:text-dark-text-secondary mt-0.5">
                      {Object.entries(req.requested_fields || {}).map(([k, v]) => `${k.replace('_', ' ')}: ${v}`).join(' • ')}
                    </div>
                    {req.notes && <div className="text-gray-500 dark:text-dark-text-secondary italic mt-1">Note: "{req.notes}"</div>}
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 dark:text-dark-text-muted">
                      {new Date(req.created_at).toLocaleDateString()}
                    </span>
                    <span className={`px-2.5 py-1 rounded text-[11px] font-bold border ${
                      req.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                      req.status === 'Rejected' ? 'bg-red-50 dark:bg-dark-red/10 text-red-700 border-red-200 dark:border-red-800' :
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
          <div className="bg-white dark:bg-dark-surface rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-[#D5E2DF] dark:border-dark-border animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-[#D5E2DF] dark:border-dark-border pb-3">
              <h3 className="text-lg font-bold text-[#173F3A] dark:text-dark-text-primary">Edit Profile & Settings</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 dark:text-dark-text-muted hover:text-gray-600 dark:hover:text-dark-text-secondary dark:text-dark-text-secondary">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 dark:text-dark-text-secondary bg-teal-50 dark:bg-dark-teal/10 p-3 rounded-md border border-teal-100">
              Update your personal and contact details. You can **Save Changes Directly** to apply them instantly, or **Submit Admin Request** to queue them for formal approval.
            </p>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-dark-text-secondary mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-md border border-gray-300 dark:border-dark-border-strong p-2 text-xs focus:ring-2 focus:ring-[#23796F] dark:focus:ring-dark-teal outline-none"
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-dark-text-secondary mb-1">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full rounded-md border border-gray-300 dark:border-dark-border-strong p-2 text-xs focus:ring-2 focus:ring-[#23796F] dark:focus:ring-dark-teal outline-none bg-white dark:bg-dark-surface font-semibold"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-dark-text-secondary mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-md border border-gray-300 dark:border-dark-border-strong p-2 text-xs focus:ring-2 focus:ring-[#23796F] dark:focus:ring-dark-teal outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-dark-text-secondary mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border border-gray-300 dark:border-dark-border-strong p-2 text-xs focus:ring-2 focus:ring-[#23796F] dark:focus:ring-dark-teal outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-dark-text-secondary mb-1">Profession</label>
                  <input
                    type="text"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="w-full rounded-md border border-gray-300 dark:border-dark-border-strong p-2 text-xs focus:ring-2 focus:ring-[#23796F] dark:focus:ring-dark-teal outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-dark-text-secondary mb-1">Company / Institution</label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full rounded-md border border-gray-300 dark:border-dark-border-strong p-2 text-xs focus:ring-2 focus:ring-[#23796F] dark:focus:ring-dark-teal outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-dark-text-secondary mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    className="w-full rounded-md border border-gray-300 dark:border-dark-border-strong p-2 text-xs focus:ring-2 focus:ring-[#23796F] dark:focus:ring-dark-teal outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-dark-text-secondary mb-1">Emergency Phone</label>
                  <input
                    type="text"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    className="w-full rounded-md border border-gray-300 dark:border-dark-border-strong p-2 text-xs focus:ring-2 focus:ring-[#23796F] dark:focus:ring-dark-teal outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-dark-text-secondary mb-1">Permanent Address</label>
                <input
                  type="text"
                  value={permanentAddress}
                  onChange={(e) => setPermanentAddress(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-dark-border-strong p-2 text-xs focus:ring-2 focus:ring-[#23796F] dark:focus:ring-dark-teal outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-dark-text-secondary mb-1">Reason / Notes for Request (Optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  placeholder="e.g. Moved to a new permanent address, updated my mobile number..."
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-dark-border-strong p-2 text-xs focus:ring-2 focus:ring-[#23796F] dark:focus:ring-dark-teal outline-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-3 border-t border-[#D5E2DF] dark:border-dark-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-dark-border-strong text-gray-700 dark:text-dark-text-secondary rounded-lg font-semibold text-xs hover:bg-gray-50 dark:hover:bg-dark-hover dark:bg-dark-canvas/50 dark:hover:bg-dark-hover/50 dark:bg-dark-surface/50 order-last sm:order-first outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitRequest}
                  disabled={submitting}
                  className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg font-bold text-xs uppercase tracking-wider outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                >
                  Submit Admin Request
                </button>
                <button
                  type="button"
                  onClick={handleDirectSave}
                  disabled={submitting}
                  className="px-5 py-2 bg-[#23796F] text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-[#173F3A] outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                >
                  Save Changes Directly
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
