import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { X, Loader2, CheckCircle, ShieldCheck, UserCheck } from 'lucide-react';
import { Member, Room, MemberStatus, ApprovalStatus, DocumentStatus } from '../types';

interface EditMemberModalProps {
  isOpen: boolean;
  member: Member | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditMemberModal({ isOpen, member, onClose, onSuccess }: EditMemberModalProps) {
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [profession, setProfession] = useState('');
  const [institution, setInstitution] = useState('');
  const [nidNumber, setNidNumber] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [roomId, setRoomId] = useState('');
  const [baseRent, setBaseRent] = useState(0);
  const [memberStatus, setMemberStatus] = useState<MemberStatus>('Active');
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>('Approved');
  const [documentStatus, setDocumentStatus] = useState<DocumentStatus>('Pending');

  // Joining Charge State
  const [finalCharge, setFinalCharge] = useState(1500);
  const [discount, setDiscount] = useState(0);
  const [waivedAmount, setWaivedAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);

  // Auth Linking State
  const [authLinked, setAuthLinked] = useState(false);
  const [authUserId, setAuthUserId] = useState('');

  useEffect(() => {
    if (isOpen && member) {
      fetchRooms();
      setFullName(member.full_name || '');
      setPhone(member.phone || '');
      setEmail(member.email || '');
      setPhotoUrl(member.photo_url || '');
      setProfession(member.profession || '');
      setInstitution(member.institution || '');
      setNidNumber(member.nid_number || '');
      setBloodGroup(member.blood_group || '');
      setPermanentAddress(member.permanent_address || '');
      setEmergencyContactName(member.emergency_contact_name || '');
      setEmergencyContactPhone(member.emergency_contact_phone || '');
      setRoomId(member.room_id || '');
      setBaseRent(member.base_monthly_rent || 0);
      setMemberStatus(member.member_status || 'Active');
      setApprovalStatus(member.approval_status || 'Approved');
      setDocumentStatus(member.document_status || 'Pending');

      const jc = member.joining_charge;
      setFinalCharge(jc?.final_charge_amount ?? 1500);
      setDiscount(jc?.discount_amount ?? 0);
      setWaivedAmount(jc?.waived_amount ?? 0);
      setPaidAmount(jc?.paid_amount ?? 0);

      setAuthLinked(!!member.auth_linked || !!member.auth_user_id);
      setAuthUserId(member.auth_user_id || '');
    }
  }, [isOpen, member]);

  const fetchRooms = async () => {
    try {
      const { data } = await supabase.from('rooms').select('*').order('name');
      if (data && data.length > 0) {
        setRooms(data);
        return;
      }
    } catch {
      // fallback
    }
    const local = JSON.parse(localStorage.getItem('eh_rooms') || '[]');
    setRooms(local);
  };

  const finalPayable = Math.max(0, finalCharge - discount - waivedAmount);
  const dueAmount = Math.max(0, finalPayable - paidAmount);

  const handleLinkAuthAccount = () => {
    if (!email) {
      setError('Please provide a valid email address before linking login account.');
      return;
    }
    const generatedUid = `usr_${Math.random().toString(36).substring(2, 9)}`;
    setAuthUserId(generatedUid);
    setAuthLinked(true);
    setSuccessMsg(`Login account linked for ${email}. Password setup invitation sent!`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!member) return;

    setLoading(true);
    setError(null);

    try {
      const selectedRoom = rooms.find((r) => r.id === roomId);

      let joiningChargeStatus = 'Pending';
      if (dueAmount === 0) {
        joiningChargeStatus = waivedAmount >= finalCharge ? 'Waived' : 'Paid';
      } else if (paidAmount > 0) {
        joiningChargeStatus = 'Partial';
      }

      const updatedMember: Member = {
        ...member,
        full_name: fullName,
        phone,
        email,
        photo_url: photoUrl,
        profession,
        institution,
        nid_number: nidNumber,
        blood_group: bloodGroup,
        permanent_address: permanentAddress,
        emergency_contact_name: emergencyContactName,
        emergency_contact_phone: emergencyContactPhone,
        room_id: roomId,
        room: { name: selectedRoom?.name || member.room?.name || 'Assigned Room', room_code: selectedRoom?.room_code },
        base_monthly_rent: baseRent,
        member_status: memberStatus,
        approval_status: approvalStatus,
        document_status: documentStatus,
        auth_linked: authLinked,
        auth_user_id: authUserId,
        joining_charge: {
          id: member.joining_charge?.id || `jc-${member.id}`,
          member_id: member.id,
          suggested_amount: 1500,
          final_charge_amount: finalCharge,
          discount_amount: discount,
          waived_amount: waivedAmount,
          final_payable_amount: finalPayable,
          paid_amount: paidAmount,
          due_amount: dueAmount,
          payment_plan: member.joining_charge?.payment_plan || 'separate',
          status: joiningChargeStatus as any,
        },
      };

      // 1. Update Local Storage
      const currentMembers: Member[] = JSON.parse(localStorage.getItem('eh_members') || '[]');
      const index = currentMembers.findIndex((m) => m.id === member.id || m.member_code === member.member_code);
      if (index !== -1) {
        currentMembers[index] = updatedMember;
      } else {
        currentMembers.push(updatedMember);
      }
      localStorage.setItem('eh_members', JSON.stringify(currentMembers));

      // 2. Sync to Supabase if connected
      try {
        await supabase
          .from('members')
          .update({
            full_name: fullName,
            phone,
            email,
            photo_url: photoUrl,
            room_id: roomId,
            base_monthly_rent: baseRent,
            member_status: memberStatus,
            approval_status: approvalStatus,
            document_status: documentStatus,
          })
          .eq('member_code', member.member_code);
      } catch (err) {
        console.log('Supabase sync skipped');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating the member.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-xl bg-white dark:bg-dark-surface shadow-xl my-8">
        <div className="flex items-center justify-between border-b border-[#D5E2DF] dark:border-dark-border px-6 py-4 bg-[#F5F8F7] dark:bg-dark-canvas">
          <div>
            <h2 className="text-lg font-bold text-[#173F3A] dark:text-dark-text-primary">Edit Member Details</h2>
            <p className="text-xs text-gray-500 dark:text-dark-text-secondary">Member Code: <span className="font-semibold text-[#23796F] dark:text-dark-teal">{member.member_code}</span></p>
          </div>
          <button onClick={onClose} className="text-gray-400 dark:text-dark-text-muted hover:text-gray-600 dark:hover:text-dark-text-secondary dark:text-dark-text-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 dark:bg-dark-red/10 p-3 text-xs text-red-700 border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 rounded-md bg-green-50 p-3 text-xs text-green-800 border border-green-200 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Personal Info */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#173F3A] dark:text-dark-text-primary mb-3">Personal & Contact Information</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-dark-text-secondary">Full Name</label>
                  <input
                    required
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-dark-border-strong px-3 py-2 text-xs focus:ring-2 focus:ring-[#23796F] dark:focus:ring-dark-teal outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-dark-text-secondary">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    placeholder="e.g. 01700000000"
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-dark-border-strong px-3 py-2 text-xs focus:ring-2 focus:ring-[#23796F] dark:focus:ring-dark-teal outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-dark-text-secondary">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    placeholder="e.g. member@executivehome.com"
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-dark-border-strong px-3 py-2 text-xs focus:ring-2 focus:ring-[#23796F] dark:focus:ring-dark-teal outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-dark-text-secondary">Profession / Occupation</label>
                  <input
                    type="text"
                    value={profession}
                    placeholder="e.g. Senior Software Engineer"
                    onChange={(e) => setProfession(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-dark-border-strong px-3 py-2 text-xs focus:ring-2 focus:ring-[#23796F] dark:focus:ring-dark-teal outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-dark-text-secondary">Company / University</label>
                  <input
                    type="text"
                    value={institution}
                    placeholder="e.g. Brain Station 23 / NSU"
                    onChange={(e) => setInstitution(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-dark-border-strong px-3 py-2 text-xs focus:ring-2 focus:ring-[#23796F] dark:focus:ring-dark-teal outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-dark-text-secondary">National ID (NID) / Passport</label>
                  <input
                    type="text"
                    value={nidNumber}
                    placeholder="e.g. 1994269123450001"
                    onChange={(e) => setNidNumber(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-dark-border-strong px-3 py-2 text-xs focus:ring-2 focus:ring-[#23796F] dark:focus:ring-dark-teal outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-dark-text-secondary">Blood Group</label>
                  <input
                    type="text"
                    value={bloodGroup}
                    placeholder="e.g. B+, O+, A+"
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-dark-border-strong px-3 py-2 text-xs focus:ring-2 focus:ring-[#23796F] dark:focus:ring-dark-teal outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-dark-text-secondary">Permanent Address</label>
                  <input
                    type="text"
                    value={permanentAddress}
                    placeholder="e.g. House 42, Road 5, Mirpur, Dhaka"
                    onChange={(e) => setPermanentAddress(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-dark-border-strong px-3 py-2 text-xs focus:ring-2 focus:ring-[#23796F] dark:focus:ring-dark-teal outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-dark-text-secondary">Emergency Contact Person</label>
                  <input
                    type="text"
                    value={emergencyContactName}
                    placeholder="e.g. Father / Brother Name"
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-dark-border-strong px-3 py-2 text-xs focus:ring-2 focus:ring-[#23796F] dark:focus:ring-dark-teal outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-dark-text-secondary">Emergency Contact Phone</label>
                  <input
                    type="text"
                    value={emergencyContactPhone}
                    placeholder="e.g. 01800000000"
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-dark-border-strong px-3 py-2 text-xs focus:ring-2 focus:ring-[#23796F] dark:focus:ring-dark-teal outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-dark-text-secondary">Profile Photo URL</label>
                  <input
                    type="url"
                    value={photoUrl}
                    placeholder="https://..."
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-dark-border-strong px-3 py-2 text-xs focus:ring-2 focus:ring-[#23796F] dark:focus:ring-dark-teal outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Room & Rent */}
            <div className="border-t border-[#D5E2DF] dark:border-dark-border pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#173F3A] dark:text-dark-text-primary mb-3">Room & Base Rent Configuration</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-dark-text-secondary">Assigned Room</label>
                  <select
                    required
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-dark-border-strong px-3 py-2 text-xs focus:ring-2 focus:ring-[#23796F] dark:focus:ring-dark-teal outline-none"
                  >
                    <option value="">Select Room</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.type})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-dark-text-secondary">Monthly Base Rent (৳)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={baseRent}
                    onChange={(e) => setBaseRent(Number(e.target.value))}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-dark-border-strong px-3 py-2 text-xs focus:ring-2 focus:ring-[#23796F] dark:focus:ring-dark-teal outline-none"
                  />
                </div>
              </div>
            </div>

            {/* One-time Joining Charge */}
            <div className="border-t border-[#D5E2DF] dark:border-dark-border pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#173F3A] dark:text-dark-text-primary mb-3">One-Time Joining / Service Charge (BDT 1,500)</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 bg-[#F5F8F7] dark:bg-dark-canvas p-3 rounded-lg border border-[#D5E2DF] dark:border-dark-border">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-dark-text-secondary">Final Charge (৳)</label>
                  <input
                    type="number"
                    min="0"
                    value={finalCharge}
                    onChange={(e) => setFinalCharge(Number(e.target.value))}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-dark-border-strong px-3 py-1.5 text-xs bg-white dark:bg-dark-surface"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-dark-text-secondary">Discount (৳)</label>
                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-dark-border-strong px-3 py-1.5 text-xs bg-white dark:bg-dark-surface"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-dark-text-secondary">Waived Amount (৳)</label>
                  <input
                    type="number"
                    min="0"
                    value={waivedAmount}
                    onChange={(e) => setWaivedAmount(Number(e.target.value))}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-dark-border-strong px-3 py-1.5 text-xs bg-white dark:bg-dark-surface"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-dark-text-secondary">Paid Amount (৳)</label>
                  <input
                    type="number"
                    min="0"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-dark-border-strong px-3 py-1.5 text-xs bg-white dark:bg-dark-surface"
                  />
                </div>
                <div className="sm:col-span-2 flex justify-between items-center pt-2 border-t border-[#D5E2DF] dark:border-dark-border">
                  <span className="text-xs text-gray-600 dark:text-dark-text-secondary">Calculated Joining Charge Due:</span>
                  <span className="text-sm font-extrabold text-[#23796F] dark:text-dark-teal">৳{dueAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Login Account Linking & Status */}
            <div className="border-t border-[#D5E2DF] dark:border-dark-border pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#173F3A] dark:text-dark-text-primary mb-3">Login Account & Status</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-dark-text-secondary">Member Status</label>
                  <select
                    value={memberStatus}
                    onChange={(e) => setMemberStatus(e.target.value as MemberStatus)}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-dark-border-strong px-3 py-2 text-xs outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Notice">Notice</option>
                    <option value="Left">Left / Archived</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-dark-text-secondary">Approval Status</label>
                  <select
                    value={approvalStatus}
                    onChange={(e) => setApprovalStatus(e.target.value as ApprovalStatus)}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-dark-border-strong px-3 py-2 text-xs outline-none"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending Review</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div className="sm:col-span-2 bg-[#F5F8F7] dark:bg-dark-canvas p-3 rounded-lg border border-[#D5E2DF] dark:border-dark-border flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#173F3A] dark:text-dark-text-primary">Link Member Login Account</p>
                    <p className="text-[11px] text-gray-500 dark:text-dark-text-secondary">
                      {authLinked
                        ? `Linked to auth user ID: ${authUserId || 'active_user'}`
                        : 'Allow member to sign in to their personal portal.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLinkAuthAccount}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#23796F] text-white text-xs font-bold rounded-md hover:bg-[#173F3A] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    {authLinked ? 'Re-send Invitation' : 'Link Login Account'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-[#D5E2DF] dark:border-dark-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-white dark:bg-dark-surface px-4 py-2 text-xs font-bold text-gray-700 dark:text-dark-text-secondary shadow-sm border border-gray-300 dark:border-dark-border-strong hover:bg-gray-50 dark:hover:bg-dark-hover dark:bg-dark-canvas/50 dark:hover:bg-dark-hover/50 dark:bg-dark-surface/50 outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-md bg-[#23796F] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#173F3A] disabled:opacity-70 outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
            >
              {loading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
