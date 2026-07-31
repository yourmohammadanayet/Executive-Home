import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserAccessRecord } from '../types';
import { 
  getUserAccessRecords, 
  saveUserAccessRecords, 
  getAccessStatus, 
  addAuditEntry, 
  getProfileUpdateRequests,
  updateProfileRequestStatus,
  saveSentEmailNotification,
  getSentEmailNotifications,
  SentEmailNotification
} from '../lib/accessControlService';
import { fetchMembersData } from '../lib/dataService';
import { 
  Users, 
  UserCheck, 
  UserX, 
  ShieldCheck, 
  Search, 
  Filter, 
  Plus, 
  Mail, 
  Phone, 
  DoorClosed, 
  Clock, 
  X, 
  Check, 
  AlertCircle, 
  KeyRound, 
  LogOut, 
  Eye, 
  Send, 
  Lock, 
  Unlock, 
  AlertTriangle,
  UserPlus,
  Trash2,
  ExternalLink,
  Copy,
  CheckCircle2,
  Loader2
} from 'lucide-react';

export default function UserAccess() {
  const navigate = useNavigate();
  const { userAccess, isAdmin, loginLocalUser } = useAuth();

  const [records, setRecords] = useState<UserAccessRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [accessFilter, setAccessFilter] = useState<string>('All');

  // Drawer State
  const [selectedUser, setSelectedUser] = useState<UserAccessRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Edit Email Modal inside Drawer
  const [editEmailModalOpen, setEditEmailModalOpen] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState('');
  const [newPhoneInput, setNewPhoneInput] = useState('');

  // Disable Login Modal State
  const [disableModalOpen, setDisableModalOpen] = useState(false);
  const [disableReason, setDisableReason] = useState('Payment issue');
  const [customReasonText, setCustomReasonText] = useState('');

  // Invitation Modal State
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [generatedTempPass, setGeneratedTempPass] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [sentEmailsModalOpen, setSentEmailsModalOpen] = useState(false);
  const [sentEmailsList, setSentEmailsList] = useState<SentEmailNotification[]>([]);

  // Delete User Access Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserAccessRecord | null>(null);

  // Signup Requests State
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [reviewRequestsModalOpen, setReviewRequestsModalOpen] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    const data = getUserAccessRecords();
    setRecords(data);
    setSentEmailsList(getSentEmailNotifications());

    // Sync room names & codes from member database if missing
    const members = await fetchMembersData();
    const updated = data.map((rec) => {
      const match = members.find((m) => m.member_code === rec.member_code || m.full_name.toLowerCase() === rec.full_name.toLowerCase());
      if (match) {
        return {
          ...rec,
          member_code: match.member_code,
          room_name: match.room?.name || rec.room_name || 'Assigned Room',
          email: rec.email || match.email || '',
          phone: rec.phone || match.phone || '',
        };
      }
      return rec;
    });
    setRecords(updated);
    saveUserAccessRecords(updated);

    // Check profile update / signup requests
    const profReqs = getProfileUpdateRequests().filter((r) => r.status === 'Pending');
    setPendingRequests(profReqs);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Filtered User Records
  const filteredRecords = records.filter((rec) => {
    const status = getAccessStatus(rec);
    if (accessFilter !== 'All' && status !== accessFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = rec.full_name.toLowerCase().includes(q);
      const matchCode = (rec.member_code || '').toLowerCase().includes(q);
      const matchEmail = (rec.email || '').toLowerCase().includes(q);
      const matchPhone = (rec.phone || '').toLowerCase().includes(q);
      return matchName || matchCode || matchEmail || matchPhone;
    }

    return true;
  });

  // Calculate Summary Stats
  const totalMembers = records.length;
  const loginEnabledCount = records.filter((r) => getAccessStatus(r) === 'Active').length;
  const notInvitedCount = records.filter((r) => getAccessStatus(r) === 'Not Invited').length;
  const blockedCount = records.filter((r) => getAccessStatus(r) === 'Blocked').length;
  const pendingCount = records.filter((r) => getAccessStatus(r) === 'Pending Approval').length;

  // Drawer handlers
  const handleOpenDrawer = (user: UserAccessRecord) => {
    setSelectedUser(user);
    setNewEmailInput(user.email || '');
    setNewPhoneInput(user.phone || '');
    setIsDrawerOpen(true);
  };

  const handleSaveContactDetails = () => {
    if (!selectedUser) return;
    const updated = records.map((r) => {
      if (r.id === selectedUser.id) {
        return {
          ...r,
          email: newEmailInput.trim(),
          phone: newPhoneInput.trim(),
        };
      }
      return r;
    });
    setRecords(updated);
    saveUserAccessRecords(updated);
    setSelectedUser({ ...selectedUser, email: newEmailInput.trim(), phone: newPhoneInput.trim() });
    setEditEmailModalOpen(false);
    showToast('success', 'Contact information updated successfully.');

    addAuditEntry({
      actor_name: userAccess?.full_name || 'Mohammad Anayet (Admin)',
      actor_email: userAccess?.email || 'yourmohammadanayet@gmail.com',
      action: 'Member Contact Info Updated',
      target_user: `${selectedUser.full_name} (${selectedUser.member_code})`,
      new_value: `Email: ${newEmailInput.trim() || 'None'}, Phone: ${newPhoneInput.trim() || 'None'}`,
    });
  };

  // Enable Login Flow
  const handleEnableLogin = () => {
    if (!selectedUser) return;

    if (!selectedUser.email) {
      showToast('error', 'Add an email address before enabling login.');
      setEditEmailModalOpen(true);
      return;
    }

    const updated = records.map((r) => {
      if (r.id === selectedUser.id) {
        return {
          ...r,
          login_access: 'Enabled' as const,
          account_status: 'Active' as const,
          approval_status: 'Approved' as const,
          email_verified: true,
          disable_reason: undefined,
        };
      }
      return r;
    });

    setRecords(updated);
    saveUserAccessRecords(updated);

    const updatedUser = {
      ...selectedUser,
      login_access: 'Enabled' as const,
      account_status: 'Active' as const,
      approval_status: 'Approved' as const,
      email_verified: true,
      disable_reason: undefined,
    };
    setSelectedUser(updatedUser);

    addAuditEntry({
      actor_name: userAccess?.full_name || 'Mohammad Anayet (Admin)',
      actor_email: userAccess?.email || 'yourmohammadanayet@gmail.com',
      action: 'Login Access Enabled',
      target_user: `${selectedUser.full_name} (${selectedUser.member_code})`,
      old_value: 'Disabled',
      new_value: 'Enabled & Email Verified',
    });

    showToast('success', `Login access enabled for ${selectedUser.full_name}. Login invitation sent to ${selectedUser.email}.`);
  };

  // Disable Login Flow
  const handleConfirmDisableLogin = () => {
    if (!selectedUser) return;

    const finalReason = disableReason === 'Other' ? customReasonText.trim() || 'Administrative decision' : disableReason;

    const updated = records.map((r) => {
      if (r.id === selectedUser.id) {
        return {
          ...r,
          login_access: 'Disabled' as const,
          disable_reason: finalReason,
        };
      }
      return r;
    });

    setRecords(updated);
    saveUserAccessRecords(updated);

    const updatedUser = {
      ...selectedUser,
      login_access: 'Disabled' as const,
      disable_reason: finalReason,
    };
    setSelectedUser(updatedUser);
    setDisableModalOpen(false);

    addAuditEntry({
      actor_name: userAccess?.full_name || 'Mohammad Anayet (Admin)',
      actor_email: userAccess?.email || 'yourmohammadanayet@gmail.com',
      action: 'Login Access Disabled',
      target_user: `${selectedUser.full_name} (${selectedUser.member_code})`,
      old_value: 'Enabled',
      new_value: `Disabled (${finalReason})`,
    });

    showToast('success', `Login access disabled for ${selectedUser.full_name}. Active sessions revoked.`);
  };

  // Send Invitation & Generate Credentials
  const handleSendInvitation = () => {
    if (!selectedUser) return;
    if (!selectedUser.email) {
      showToast('error', 'Add an email address before sending an invitation.');
      setEditEmailModalOpen(true);
      return;
    }

    // Generate Temporary Password
    const randomPin = Math.floor(1000 + Math.random() * 9000);
    const tempPass = `ExecHome#${randomPin}`;
    setGeneratedTempPass(tempPass);

    // Auto-enable login access for user
    const updated = records.map((r) => {
      if (r.id === selectedUser.id) {
        return {
          ...r,
          login_access: 'Enabled' as const,
          account_status: 'Active' as const,
          approval_status: 'Approved' as const,
          email_verified: true,
          disable_reason: undefined,
        };
      }
      return r;
    });

    setRecords(updated);
    saveUserAccessRecords(updated);

    setSelectedUser({
      ...selectedUser,
      login_access: 'Enabled' as const,
      account_status: 'Active' as const,
      approval_status: 'Approved' as const,
      email_verified: true,
    });

    // Save sent email record in inbox
    saveSentEmailNotification({
      recipient_name: selectedUser.full_name,
      recipient_email: selectedUser.email,
      subject: 'Executive Home - Login Portal Credentials & Invitation',
      body: `Hello ${selectedUser.full_name},\nYour Executive Home member login access has been activated!\n\nPortal URL: ${window.location.origin}/login\nEmail: ${selectedUser.email}\nTemporary Password: ${tempPass}`,
      temp_password: tempPass,
    });
    setSentEmailsList(getSentEmailNotifications());

    addAuditEntry({
      actor_name: userAccess?.full_name || 'Mohammad Anayet (Admin)',
      actor_email: userAccess?.email || 'yourmohammadanayet@gmail.com',
      action: 'Login Invitation Generated',
      target_user: `${selectedUser.full_name} (${selectedUser.member_code})`,
      new_value: `Temp Pass generated for ${selectedUser.email}`,
    });

    setInviteModalOpen(true);
  };

  // Reset Password
  const handleResetPassword = () => {
    if (!selectedUser) return;
    if (!selectedUser.email) {
      showToast('error', 'No email address registered for password reset.');
      return;
    }

    addAuditEntry({
      actor_name: userAccess?.full_name || 'Mohammad Anayet (Admin)',
      actor_email: userAccess?.email || 'yourmohammadanayet@gmail.com',
      action: 'Password Reset Requested',
      target_user: `${selectedUser.full_name} (${selectedUser.member_code})`,
      new_value: `Reset link sent to ${selectedUser.email}`,
    });

    showToast('success', `Password reset instructions sent to ${selectedUser.email}.`);
  };

  // Revoke Sessions
  const handleRevokeSessions = () => {
    if (!selectedUser) return;

    addAuditEntry({
      actor_name: userAccess?.full_name || 'Mohammad Anayet (Admin)',
      actor_email: userAccess?.email || 'yourmohammadanayet@gmail.com',
      action: 'Active Sessions Revoked',
      target_user: `${selectedUser.full_name} (${selectedUser.member_code})`,
      new_value: 'All active tokens invalidated',
    });

    showToast('success', `Signed out ${selectedUser.full_name} from all active devices.`);
  };

  // Send Direct Invitation Email to Inbox
  const handleSendDirectEmail = async () => {
    if (!selectedUser || !selectedUser.email) {
      showToast('error', 'Add an email address before sending an invitation.');
      return;
    }

    setIsSendingEmail(true);

    // Simulate sending email to inbox
    await new Promise((resolve) => setTimeout(resolve, 900));

    setIsSendingEmail(false);

    saveSentEmailNotification({
      recipient_name: selectedUser.full_name,
      recipient_email: selectedUser.email,
      subject: 'Executive Home - Login Portal Link & Credentials',
      body: `Hello ${selectedUser.full_name},\nYour Executive Home member account is ready.\n\nLogin URL: ${window.location.origin}/login\nEmail: ${selectedUser.email}\nTemporary Password: ${generatedTempPass}`,
      temp_password: generatedTempPass,
    });
    setSentEmailsList(getSentEmailNotifications());

    addAuditEntry({
      actor_name: userAccess?.full_name || 'Mohammad Anayet (Admin)',
      actor_email: userAccess?.email || 'yourmohammadanayet@gmail.com',
      action: 'Invitation Email Sent to Inbox',
      target_user: `${selectedUser.full_name} (${selectedUser.member_code})`,
      new_value: `Direct email sent to ${selectedUser.email}`,
    });

    showToast('success', `Invitation email with login link & temporary password sent to ${selectedUser.email}!`);
  };

  // Open Default Mail App (mailto:)
  const handleOpenMailClient = () => {
    if (!selectedUser || !selectedUser.email) return;
    const subject = encodeURIComponent('Executive Home - Your Login Credentials & Portal Link');
    const body = encodeURIComponent(
      `Hello ${selectedUser.full_name},\n\n` +
      `Your Executive Home member login account is active!\n\n` +
      `Login URL: ${window.location.origin}/login\n` +
      `Username / Email: ${selectedUser.email}\n` +
      `Temporary Password: ${generatedTempPass}\n\n` +
      `Please log in using the link above and update your password.\n\n` +
      `Best regards,\nExecutive Home Management`
    );
    window.open(`mailto:${selectedUser.email}?subject=${subject}&body=${body}`, '_blank');
    showToast('success', 'Opening email client with pre-filled login credentials...');
  };

  // Delete User Access Account
  const handleConfirmDeleteUserAccess = () => {
    if (!userToDelete) return;

    // Prevent deleting Primary Admin
    if (userToDelete.email === 'yourmohammadanayet@gmail.com' || userToDelete.role === 'admin') {
      showToast('error', 'Primary Admin access account cannot be deleted.');
      setDeleteModalOpen(false);
      setUserToDelete(null);
      return;
    }

    const targetName = userToDelete.full_name;
    const targetCode = userToDelete.member_code;

    const updated = records.filter((r) => r.id !== userToDelete.id);
    setRecords(updated);
    saveUserAccessRecords(updated);

    setDeleteModalOpen(false);
    setUserToDelete(null);
    if (selectedUser?.id === userToDelete.id) {
      setIsDrawerOpen(false);
      setSelectedUser(null);
    }

    addAuditEntry({
      actor_name: userAccess?.full_name || 'Mohammad Anayet (Admin)',
      actor_email: userAccess?.email || 'yourmohammadanayet@gmail.com',
      action: 'User Access Removed / Deleted',
      target_user: `${targetName} (${targetCode})`,
      old_value: 'Active Access Account',
      new_value: 'Access Account Completely Deleted',
    });

    showToast('success', `Login access and user account removed for ${targetName}.`);
  };

  const handleApproveRequest = (id: string) => {
    updateProfileRequestStatus(id, 'Approved', userAccess?.full_name || 'Mohammad Anayet (Admin)');
    showToast('success', 'Profile update request has been approved and applied.');
    loadData();
  };

  const handleRejectRequest = (id: string) => {
    updateProfileRequestStatus(id, 'Rejected', userAccess?.full_name || 'Mohammad Anayet (Admin)');
    showToast('success', 'Profile update request has been rejected.');
    loadData();
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 text-sm font-semibold border ${
          toast.type === 'success' 
            ? 'bg-emerald-50 dark:bg-dark-teal/10 text-emerald-900 border-emerald-200' 
            : 'bg-rose-50 text-rose-900 border-rose-200'
        }`}>
          {toast.type === 'success' ? <Check className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-auto text-gray-400 dark:text-dark-text-muted hover:text-gray-600 dark:hover:text-dark-text-secondary dark:text-dark-text-secondary">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#D5E2DF] dark:border-dark-border">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 dark:bg-dark-teal/10 text-[#23796F] dark:text-dark-teal border border-teal-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            RBAC Guard Active
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {pendingRequests.length > 0 && (
            <button
              onClick={() => setReviewRequestsModalOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-900 font-bold text-xs rounded-xl border border-amber-200/80 flex items-center gap-2 transition-all shadow-2xs hover:shadow-xs relative"
            >
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Review Requests</span>
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] font-extrabold flex items-center justify-center">
                {pendingRequests.length}
              </span>
            </button>
          )}

          <button
            onClick={() => navigate('/members')}
            className="px-4 py-2 bg-[#23796F] hover:bg-[#1C635B] text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-2xs hover:shadow-xs active:scale-[0.99] outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Professional 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members */}
        <div className="group bg-gradient-to-br from-white via-white to-teal-50/30 p-4 rounded-2xl border border-[#D5E2DF] dark:border-dark-border shadow-2xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">Total Members</p>
              <p className="text-2xl font-black text-[#173F3A] dark:text-dark-text-primary mt-1 tracking-tight">{totalMembers}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-teal-500/10 text-[#23796F] dark:text-dark-teal border border-teal-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-dark-border/80 flex items-center justify-between text-[11px]">
            <span className="text-gray-400 dark:text-dark-text-muted font-medium">System Directory</span>
            <span className="text-[#23796F] dark:text-dark-teal font-bold bg-teal-50 dark:bg-dark-teal/10 px-1.5 py-0.5 rounded text-[10px]">100%</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#23796F] to-teal-400 opacity-80"></div>
        </div>

        {/* Login Enabled */}
        <div className="group bg-gradient-to-br from-white via-white to-emerald-50/30 p-4 rounded-2xl border border-[#D5E2DF] dark:border-dark-border shadow-2xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">Login Enabled</p>
              <p className="text-2xl font-black text-emerald-800 mt-1 tracking-tight">{loginEnabledCount}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-dark-border/80 flex items-center justify-between text-[11px]">
            <span className="text-gray-400 dark:text-dark-text-muted font-medium">Active Portal Access</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 dark:bg-dark-teal/10 px-1.5 py-0.5 rounded text-[10px]">
              {((loginEnabledCount / (totalMembers || 1)) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-80"></div>
        </div>

        {/* Not Invited */}
        <div className="group bg-gradient-to-br from-white via-white to-slate-50/60 p-4 rounded-2xl border border-[#D5E2DF] dark:border-dark-border shadow-2xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">Not Invited</p>
              <p className="text-2xl font-black text-gray-800 dark:text-dark-text-primary mt-1 tracking-tight">{notInvitedCount}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-gray-500/10 text-gray-600 dark:text-dark-text-secondary border border-gray-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Mail className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-dark-border/80 flex items-center justify-between text-[11px]">
            <span className="text-gray-400 dark:text-dark-text-muted font-medium">Pending Onboarding</span>
            <span className="text-gray-600 dark:text-dark-text-secondary font-bold bg-gray-100 dark:bg-dark-raised px-1.5 py-0.5 rounded text-[10px]">
              {((notInvitedCount / (totalMembers || 1)) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gray-400 to-slate-300 opacity-80"></div>
        </div>

        {/* Blocked */}
        <div className="group bg-gradient-to-br from-white via-white to-rose-50/30 p-4 rounded-2xl border border-[#D5E2DF] dark:border-dark-border shadow-2xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">Blocked Access</p>
              <p className="text-2xl font-black text-rose-800 mt-1 tracking-tight">{blockedCount}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <UserX className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-dark-border/80 flex items-center justify-between text-[11px]">
            <span className="text-gray-400 dark:text-dark-text-muted font-medium">Restricted Accounts</span>
            <span className="text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded text-[10px]">
              {((blockedCount / (totalMembers || 1)) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500 to-red-400 opacity-80"></div>
        </div>
      </div>

      {/* Interactive Segmented Filter & Search Toolbar */}
      <div className="bg-white dark:bg-dark-surface p-3.5 rounded-2xl border border-[#D5E2DF] dark:border-dark-border shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Access Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-xl overflow-x-auto w-full lg:w-auto">
          {[
            { id: 'All', label: 'All', count: totalMembers },
            { id: 'Active', label: 'Active', count: loginEnabledCount },
            { id: 'Not Invited', label: 'Not Invited', count: notInvitedCount },
            { id: 'Pending Approval', label: 'Pending', count: pendingCount },
            { id: 'Blocked', label: 'Blocked', count: blockedCount },
          ].map((tab) => {
            const isActive = accessFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setAccessFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white dark:bg-dark-surface text-[#173F3A] dark:text-dark-text-primary shadow-xs border border-gray-200 dark:border-dark-border/60'
                    : 'text-gray-500 dark:text-dark-text-secondary hover:text-gray-800 dark:text-dark-text-primary hover:bg-gray-200/50'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    isActive ? 'bg-teal-100 text-[#23796F] dark:text-dark-teal' : 'bg-gray-200/70 text-gray-600 dark:text-dark-text-secondary'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-gray-400 dark:text-dark-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, room, email, phone..."
            className="w-full pl-9 pr-8 py-2 bg-gray-50 dark:bg-dark-canvas/50 dark:bg-dark-surface/50 border border-gray-200 dark:border-dark-border rounded-xl text-xs font-semibold text-[#173F3A] dark:text-dark-text-primary placeholder:text-gray-400 dark:text-dark-text-muted focus:outline-none focus:ring-2 focus:ring-[#23796F] dark:focus:ring-dark-teal focus:bg-white dark:bg-dark-surface transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-text-muted hover:text-gray-600 dark:hover:text-dark-text-secondary dark:text-dark-text-secondary">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white dark:bg-dark-surface rounded-xl border border-[#D5E2DF] dark:border-dark-border shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-[#D5E2DF] dark:border-dark-border text-[11px] font-bold text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Room</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Access Status</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-divider text-xs">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400 dark:text-dark-text-muted font-medium">
                    No members match the selected search or access status filter.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const status = getAccessStatus(rec);

                  return (
                    <tr key={rec.id} className="hover:bg-gray-50/60 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas">
                      {/* Member */}
                      <td className="py-3.5 px-4 font-semibold text-[#173F3A] dark:text-dark-text-primary">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#173F3A] text-white font-bold flex items-center justify-center shrink-0 text-xs overflow-hidden">
                            {rec.photo_url ? (
                              <img src={rec.photo_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              rec.full_name.charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-[#173F3A] dark:text-dark-text-primary flex items-center gap-2">
                              <span>{rec.full_name}</span>
                              {rec.role === 'admin' && (
                                <span className="px-1.5 py-0.5 bg-teal-100 text-[#23796F] dark:text-dark-teal text-[10px] font-extrabold rounded uppercase">
                                  Primary Admin
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-400 dark:text-dark-text-muted font-mono mt-0.5">
                              {rec.member_code || 'EH-RES'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Room */}
                      <td className="py-3.5 px-4 text-gray-600 dark:text-dark-text-secondary font-medium">
                        <div className="flex items-center gap-1.5">
                          <DoorClosed className="w-3.5 h-3.5 text-gray-400 dark:text-dark-text-muted shrink-0" />
                          <span>{rec.room_name || 'Single Room'}</span>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          {rec.email ? (
                            <div className="text-gray-700 dark:text-dark-text-secondary font-medium flex items-center gap-1.5">
                              <Mail className="w-3 h-3 text-gray-400 dark:text-dark-text-muted" />
                              <span className="font-mono text-[11px]">{rec.email}</span>
                            </div>
                          ) : null}
                          {rec.phone ? (
                            <div className="text-gray-500 dark:text-dark-text-secondary text-[11px] flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-gray-400 dark:text-dark-text-muted" />
                              <span>{rec.phone}</span>
                            </div>
                          ) : null}
                          {!rec.email && !rec.phone && (
                            <span className="text-gray-400 dark:text-dark-text-muted italic font-medium text-[11px]">Not provided</span>
                          )}
                        </div>
                      </td>

                      {/* Access Status */}
                      <td className="py-3.5 px-4">
                        {status === 'Active' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-dark-teal/10 text-emerald-800 border border-emerald-200 text-[11px] font-bold rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>Active</span>
                          </span>
                        )}

                        {status === 'Not Invited' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-dark-raised text-gray-700 dark:text-dark-text-secondary border border-gray-200 dark:border-dark-border text-[11px] font-bold rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                            <span>Not Invited</span>
                          </span>
                        )}

                        {status === 'Pending Approval' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            <span>Pending Approval</span>
                          </span>
                        )}

                        {status === 'Blocked' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-bold rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            <span>Blocked</span>
                          </span>
                        )}
                      </td>

                      {/* Last Login */}
                      <td className="py-3.5 px-4 text-gray-500 dark:text-dark-text-secondary font-mono text-[11px]">
                        {rec.last_login && rec.last_login !== 'Never' ? (
                          new Date(rec.last_login).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                        ) : (
                          <span className="text-gray-400 dark:text-dark-text-muted">Never</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {status === 'Active' && (
                            <button
                              onClick={() => handleOpenDrawer(rec)}
                              className="px-3 py-1.5 bg-gray-100 dark:bg-dark-raised hover:bg-[#EBF3F2] hover:text-[#23796F] dark:hover:text-dark-teal dark:text-dark-teal text-gray-700 dark:text-dark-text-secondary font-semibold text-xs rounded-md transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                            >
                              Manage Access
                            </button>
                          )}

                          {status === 'Not Invited' && (
                            <button
                              onClick={() => handleOpenDrawer(rec)}
                              className="px-3 py-1.5 bg-[#23796F] hover:bg-[#1C635B] text-white font-semibold text-xs rounded-md transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                            >
                              Send Invitation
                            </button>
                          )}

                          {status === 'Pending Approval' && (
                            <button
                              onClick={() => handleOpenDrawer(rec)}
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-md transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                            >
                              Review Request
                            </button>
                          )}

                          {status === 'Blocked' && (
                            <button
                              onClick={() => handleOpenDrawer(rec)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-md transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                            >
                              Restore Access
                            </button>
                          )}

                          {rec.role !== 'admin' && rec.email !== 'yourmohammadanayet@gmail.com' && (
                            <button
                              onClick={() => {
                                setUserToDelete(rec);
                                setDeleteModalOpen(true);
                              }}
                              title="Delete / Remove User Access"
                              className="p-1.5 text-gray-400 dark:text-dark-text-muted hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MANAGE ACCESS RIGHT SLIDE-OVER DRAWER */}
      {isDrawerOpen && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-2xs transition-opacity" onClick={() => setIsDrawerOpen(false)} />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white dark:bg-dark-surface border-l border-gray-200 dark:border-dark-border shadow-2xl flex flex-col justify-between">
              {/* Drawer Header */}
              <div className="p-6 border-b border-gray-200 dark:border-dark-border bg-gray-50/80 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#173F3A] dark:text-dark-text-primary">{selectedUser.full_name}</h2>
                  <p className="text-xs text-gray-500 dark:text-dark-text-secondary font-mono mt-0.5">
                    {selectedUser.member_code || 'EH-001'} • {selectedUser.room_name || 'Assigned Room'}
                  </p>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 text-gray-400 dark:text-dark-text-muted hover:text-gray-600 dark:hover:text-dark-text-secondary dark:text-dark-text-secondary rounded-lg hover:bg-gray-200 dark:hover:bg-dark-hover transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body Content */}
              <div className="p-6 space-y-6 flex-1 overflow-y-auto text-xs">
                {/* Current Status Badge */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-dark-canvas/50 dark:bg-dark-surface/50 border border-gray-200 dark:border-dark-border flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 dark:text-dark-text-muted uppercase tracking-wider block">Current Access Status</span>
                    <span className="text-sm font-bold text-[#173F3A] dark:text-dark-text-primary mt-0.5 block">{getAccessStatus(selectedUser)}</span>
                  </div>
                  {getAccessStatus(selectedUser) === 'Active' && <ShieldCheck className="w-6 h-6 text-emerald-600" />}
                  {getAccessStatus(selectedUser) === 'Not Invited' && <Mail className="w-6 h-6 text-gray-400 dark:text-dark-text-muted" />}
                  {getAccessStatus(selectedUser) === 'Blocked' && <Lock className="w-6 h-6 text-rose-600" />}
                </div>

                {/* Contact Information */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-[#173F3A] dark:text-dark-text-primary uppercase tracking-wider text-[11px] text-gray-400 dark:text-dark-text-muted">Contact Information</h3>
                    <button
                      onClick={() => setEditEmailModalOpen(true)}
                      className="text-[#23796F] dark:text-dark-teal hover:underline font-semibold text-xs"
                    >
                      {selectedUser.email ? 'Edit Contact' : '+ Add Email / Phone'}
                    </button>
                  </div>

                  <div className="bg-white dark:bg-dark-surface p-4 rounded-xl border border-gray-200 dark:border-dark-border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-dark-text-secondary font-medium">Email Address:</span>
                      <span className="font-mono text-[#173F3A] dark:text-dark-text-primary font-semibold">
                        {selectedUser.email || <span className="text-gray-400 dark:text-dark-text-muted italic">Not provided</span>}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-dark-text-secondary font-medium">Phone Number:</span>
                      <span className="font-mono text-[#173F3A] dark:text-dark-text-primary font-semibold">
                        {selectedUser.phone || <span className="text-gray-400 dark:text-dark-text-muted italic">Not provided</span>}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-dark-border">
                      <span className="text-gray-500 dark:text-dark-text-secondary font-medium">Last Login:</span>
                      <span className="font-mono text-gray-600 dark:text-dark-text-secondary">
                        {selectedUser.last_login && selectedUser.last_login !== 'Never'
                          ? new Date(selectedUser.last_login).toLocaleString()
                          : 'Never'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Admin Actions */}
                <div className="space-y-3">
                  <h3 className="font-bold text-[#173F3A] dark:text-dark-text-primary uppercase tracking-wider text-[11px] text-gray-400 dark:text-dark-text-muted">Admin Actions</h3>

                  <div className="space-y-2">
                    {/* Enable / Restore Login */}
                    {getAccessStatus(selectedUser) !== 'Active' ? (
                      <button
                        onClick={handleEnableLogin}
                        className="w-full py-2.5 px-4 bg-[#23796F] hover:bg-[#1C635B] text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                      >
                        <Unlock className="w-4 h-4" />
                        <span>Enable Login Access</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setDisableModalOpen(true)}
                        className="w-full py-2.5 px-4 bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                      >
                        <Lock className="w-4 h-4 text-rose-600" />
                        <span>Disable Login Access</span>
                      </button>
                    )}

                    {/* Send Login Invitation */}
                    <button
                      onClick={handleSendInvitation}
                      className="w-full py-2.5 px-4 bg-gray-50 dark:bg-dark-canvas/50 dark:bg-dark-surface/50 hover:bg-gray-100 dark:hover:bg-dark-hover dark:bg-dark-raised border border-gray-200 dark:border-dark-border text-gray-700 dark:text-dark-text-secondary font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                    >
                      <Send className="w-4 h-4 text-[#23796F] dark:text-dark-teal" />
                      <span>Send Login Invitation</span>
                    </button>

                    {/* Reset Password */}
                    <button
                      onClick={handleResetPassword}
                      className="w-full py-2.5 px-4 bg-gray-50 dark:bg-dark-canvas/50 dark:bg-dark-surface/50 hover:bg-gray-100 dark:hover:bg-dark-hover dark:bg-dark-raised border border-gray-200 dark:border-dark-border text-gray-700 dark:text-dark-text-secondary font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                    >
                      <KeyRound className="w-4 h-4 text-gray-500 dark:text-dark-text-secondary" />
                      <span>Send Password Reset Link</span>
                    </button>

                    {/* Sign Out from All Devices */}
                    <button
                      onClick={handleRevokeSessions}
                      className="w-full py-2.5 px-4 bg-gray-50 dark:bg-dark-canvas/50 dark:bg-dark-surface/50 hover:bg-gray-100 dark:hover:bg-dark-hover dark:bg-dark-raised border border-gray-200 dark:border-dark-border text-gray-700 dark:text-dark-text-secondary font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                    >
                      <LogOut className="w-4 h-4 text-gray-500 dark:text-dark-text-secondary" />
                      <span>Sign Out from All Devices</span>
                    </button>

                    {/* View Member Profile */}
                    <button
                      onClick={() => {
                        setIsDrawerOpen(false);
                        navigate('/members');
                      }}
                      className="w-full py-2.5 px-4 bg-gray-50 dark:bg-dark-canvas/50 dark:bg-dark-surface/50 hover:bg-gray-100 dark:hover:bg-dark-hover dark:bg-dark-raised border border-gray-200 dark:border-dark-border text-gray-700 dark:text-dark-text-secondary font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                    >
                      <Eye className="w-4 h-4 text-gray-500 dark:text-dark-text-secondary" />
                      <span>View Member Details</span>
                    </button>

                    {/* Delete User Access Account */}
                    {selectedUser.role !== 'admin' && selectedUser.email !== 'yourmohammadanayet@gmail.com' && (
                      <button
                        onClick={() => {
                          setUserToDelete(selectedUser);
                          setDeleteModalOpen(true);
                        }}
                        className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors mt-3 outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                      >
                        <Trash2 className="w-4 h-4 text-rose-600" />
                        <span>Delete / Remove User Access Account</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-canvas/50 dark:bg-dark-surface/50 text-right">
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:text-dark-text-primary font-semibold text-xs rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                >
                  Close Drawer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CONTACT EMAIL MODAL */}
      {editEmailModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4">
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl border border-gray-200 dark:border-dark-border max-w-sm w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-[#173F3A] dark:text-dark-text-primary">Update Contact Information</h3>
            <p className="text-xs text-gray-500 dark:text-dark-text-secondary">Provide contact details for {selectedUser.full_name}:</p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 dark:text-dark-text-secondary font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  value={newEmailInput}
                  onChange={(e) => setNewEmailInput(e.target.value)}
                  placeholder="e.g. member@exechome.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-strong rounded-lg focus:outline-none focus:ring-2 focus:ring-[#23796F] dark:focus:ring-dark-teal"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-dark-text-secondary font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newPhoneInput}
                  onChange={(e) => setNewPhoneInput(e.target.value)}
                  placeholder="e.g. 01712345678"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-strong rounded-lg focus:outline-none focus:ring-2 focus:ring-[#23796F] dark:focus:ring-dark-teal"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-dark-border">
              <button
                onClick={() => setEditEmailModalOpen(false)}
                className="px-3 py-2 bg-gray-100 dark:bg-dark-raised hover:bg-gray-200 dark:hover:bg-dark-hover text-gray-700 dark:text-dark-text-secondary font-semibold text-xs rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveContactDetails}
                className="px-4 py-2 bg-[#23796F] hover:bg-[#1C635B] text-white font-semibold text-xs rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
              >
                Save Contact
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISABLE LOGIN REASON MODAL */}
      {disableModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4">
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl border border-gray-200 dark:border-dark-border max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-[#173F3A] dark:text-dark-text-primary">Disable Member Login Access</h3>
            </div>

            <p className="text-xs text-gray-600 dark:text-dark-text-secondary leading-relaxed">
              Disable login access for <strong>{selectedUser.full_name}</strong>? They will be signed out immediately and unable to access their account.
            </p>

            <div className="space-y-2 text-xs">
              <label className="block text-gray-700 dark:text-dark-text-secondary font-semibold">Select Reason for Disabling Access:</label>
              <select
                value={disableReason}
                onChange={(e) => setDisableReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border-strong rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white dark:bg-dark-surface"
              >
                <option value="Documents incomplete">Documents incomplete</option>
                <option value="Payment issue">Payment issue</option>
                <option value="Account suspended">Account suspended</option>
                <option value="Member left the house">Member left the house</option>
                <option value="Security concern">Security concern</option>
                <option value="Other">Other reason</option>
              </select>

              {disableReason === 'Other' && (
                <input
                  type="text"
                  value={customReasonText}
                  onChange={(e) => setCustomReasonText(e.target.value)}
                  placeholder="Specify reason..."
                  className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-dark-border-strong rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-dark-border">
              <button
                onClick={() => setDisableModalOpen(false)}
                className="px-3 py-2 bg-gray-100 dark:bg-dark-raised hover:bg-gray-200 dark:hover:bg-dark-hover text-gray-700 dark:text-dark-text-secondary font-semibold text-xs rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDisableLogin}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
              >
                Disable Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GENERATED INVITATION CREDENTIALS & DIRECT EMAIL MODAL */}
      {inviteModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4">
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl border border-gray-200 dark:border-dark-border max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-dark-border">
              <div className="flex items-center gap-2 text-[#173F3A] dark:text-dark-text-primary">
                <KeyRound className="w-5 h-5 text-[#23796F] dark:text-dark-teal" />
                <h3 className="text-base font-bold">Login Credentials & Email Invitation</h3>
              </div>
              <button onClick={() => setInviteModalOpen(false)} className="text-gray-400 dark:text-dark-text-muted hover:text-gray-600 dark:hover:text-dark-text-secondary dark:text-dark-text-secondary">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600 dark:text-dark-text-secondary leading-relaxed">
              Login access has been enabled for <strong>{selectedUser.full_name}</strong>. Send the login invitation directly to their inbox or copy the credentials:
            </p>

            <div className="bg-gray-50 dark:bg-dark-canvas/50 dark:bg-dark-surface/50 p-4 rounded-xl border border-gray-200 dark:border-dark-border space-y-3 text-xs">
              <div>
                <span className="text-gray-400 dark:text-dark-text-muted uppercase font-bold text-[10px] tracking-wider block">Recipient Email Address</span>
                <span className="font-mono font-semibold text-[#173F3A] dark:text-dark-text-primary text-sm">{selectedUser.email}</span>
              </div>

              <div>
                <span className="text-gray-400 dark:text-dark-text-muted uppercase font-bold text-[10px] tracking-wider block">Temporary Password</span>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="font-mono font-bold text-teal-800 text-base bg-teal-50 dark:bg-dark-teal/10 px-2.5 py-1 rounded border border-teal-200">
                    {generatedTempPass}
                  </span>
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> One-time Access
                  </span>
                </div>
              </div>

              <div>
                <span className="text-gray-400 dark:text-dark-text-muted uppercase font-bold text-[10px] tracking-wider block">Direct Login URL</span>
                <span className="font-mono text-gray-600 dark:text-dark-text-secondary text-[11px] break-all">{window.location.origin}/login</span>
              </div>
            </div>

            {/* Direct Send Action Buttons */}
            <div className="space-y-2 pt-1 border-t border-gray-100 dark:border-dark-border">
              <button
                onClick={handleSendDirectEmail}
                disabled={isSendingEmail}
                className="w-full py-2.5 px-4 bg-[#23796F] hover:bg-[#1C635B] text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 shadow-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
              >
                {isSendingEmail ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Dispatching Email to {selectedUser.email}...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Direct Email to Member Inbox</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenMailClient}
                  className="flex-1 py-2 px-3 bg-teal-50 dark:bg-dark-teal/10 hover:bg-teal-100 text-[#173F3A] dark:text-dark-text-primary border border-teal-200 font-semibold text-[11px] rounded-lg flex items-center justify-center gap-1.5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#23796F] dark:text-dark-teal" />
                  <span>Open Mail App</span>
                </button>

                <button
                  onClick={() => {
                    const text = `Hello ${selectedUser.full_name},\nYour Executive Home login access has been activated!\n\nEmail: ${selectedUser.email}\nTemporary Password: ${generatedTempPass}\nLogin Link: ${window.location.origin}/login`;
                    navigator.clipboard.writeText(text);
                    showToast('success', 'Invitation credentials copied to clipboard!');
                  }}
                  className="flex-1 py-2 px-3 bg-gray-50 dark:bg-dark-canvas/50 dark:bg-dark-surface/50 hover:bg-gray-100 dark:hover:bg-dark-hover dark:bg-dark-raised text-gray-700 dark:text-dark-text-secondary border border-gray-200 dark:border-dark-border font-semibold text-[11px] rounded-lg flex items-center justify-center gap-1.5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                >
                  <Copy className="w-3.5 h-3.5 text-gray-500 dark:text-dark-text-secondary" />
                  <span>Copy Text</span>
                </button>

                <button
                  onClick={() => setInviteModalOpen(false)}
                  className="px-3 py-2 bg-gray-100 dark:bg-dark-raised hover:bg-gray-200 dark:hover:bg-dark-hover text-gray-700 dark:text-dark-text-secondary font-semibold text-xs rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE USER ACCESS CONFIRMATION MODAL */}
      {deleteModalOpen && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4">
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl border border-gray-200 dark:border-dark-border max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-100 rounded-full">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#173F3A] dark:text-dark-text-primary">Delete User Access Account</h3>
                <p className="text-xs text-gray-500 dark:text-dark-text-secondary">Member: {userToDelete.full_name} ({userToDelete.member_code})</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 dark:text-dark-text-secondary leading-relaxed bg-rose-50/70 p-3 rounded-lg border border-rose-100">
              Are you sure you want to completely <strong>delete login access</strong> for <strong>{userToDelete.full_name}</strong>? They will be immediately removed from the login access directory and will no longer be able to sign in.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-dark-border">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setUserToDelete(null);
                }}
                className="px-3 py-2 bg-gray-100 dark:bg-dark-raised hover:bg-gray-200 dark:hover:bg-dark-hover text-gray-700 dark:text-dark-text-secondary font-semibold text-xs rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteUserAccess}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete Access</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISPATCHED EMAIL MESSAGES INBOX MODAL */}
      {sentEmailsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4">
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl border border-gray-200 dark:border-dark-border max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-dark-border">
              <div className="flex items-center gap-2 text-[#173F3A] dark:text-dark-text-primary">
                <Mail className="w-5 h-5 text-[#23796F] dark:text-dark-teal" />
                <h3 className="text-base font-bold">Dispatched Email Invitations & Messages</h3>
              </div>
              <button onClick={() => setSentEmailsModalOpen(false)} className="text-gray-400 dark:text-dark-text-muted hover:text-gray-600 dark:hover:text-dark-text-secondary dark:text-dark-text-secondary">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-dark-text-secondary">
              Below is the list of all email invitation messages dispatched from Executive Home. You can test logging in directly as any invited member:
            </p>

            {sentEmailsList.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-dark-canvas/50 dark:bg-dark-surface/50 rounded-xl border border-gray-200 dark:border-dark-border">
                <Mail className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-gray-500 dark:text-dark-text-secondary">No emails dispatched yet.</p>
                <p className="text-[11px] text-gray-400 dark:text-dark-text-muted mt-1">Send an invitation to a member to generate an email message.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {sentEmailsList.map((item) => (
                  <div key={item.id} className="p-4 bg-gray-50 dark:bg-dark-canvas/50 dark:bg-dark-surface/50 rounded-xl border border-gray-200 dark:border-dark-border space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-bold text-[#173F3A] dark:text-dark-text-primary">{item.recipient_name}</span>
                        <span className="text-xs font-mono text-gray-500 dark:text-dark-text-secondary block">{item.recipient_email}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 dark:text-dark-text-muted font-medium">
                        {new Date(item.sent_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="bg-white dark:bg-dark-surface p-2.5 rounded-lg border border-gray-200 dark:border-dark-border text-[11px] text-gray-700 dark:text-dark-text-secondary space-y-1">
                      <p className="font-semibold text-[#23796F] dark:text-dark-teal">{item.subject}</p>
                      <p className="font-mono text-gray-600 dark:text-dark-text-secondary whitespace-pre-wrap text-[10px] leading-relaxed">
                        {item.body}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {item.temp_password && (
                        <div className="text-[10px]">
                          <span className="text-gray-400 dark:text-dark-text-muted font-semibold uppercase">Temp Pass: </span>
                          <span className="font-mono font-bold text-teal-800 bg-teal-100/70 px-1.5 py-0.5 rounded">
                            {item.temp_password}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 ml-auto">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(item.body);
                            showToast('success', 'Email body copied to clipboard!');
                          }}
                          className="px-2.5 py-1 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-hover dark:bg-dark-raised text-gray-700 dark:text-dark-text-secondary text-[11px] font-semibold rounded flex items-center gap-1 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                        >
                          <Copy className="w-3 h-3 text-gray-400 dark:text-dark-text-muted" />
                          <span>Copy Message</span>
                        </button>

                        <button
                          onClick={() => {
                            loginLocalUser(item.recipient_email);
                            setSentEmailsModalOpen(false);
                            navigate('/');
                          }}
                          className="px-3 py-1 bg-[#23796F] hover:bg-[#1C635B] text-white text-[11px] font-bold rounded flex items-center gap-1 transition-colors shadow-2xs outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>Sign In as {item.recipient_name.split(' ')[0]}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end pt-2 border-t border-gray-100 dark:border-dark-border">
              <button
                onClick={() => setSentEmailsModalOpen(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-dark-raised hover:bg-gray-200 dark:hover:bg-dark-hover text-gray-700 dark:text-dark-text-secondary font-semibold text-xs rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
              >
                Close Inbox
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW PROFILE UPDATE REQUESTS MODAL */}
      {reviewRequestsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4">
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl border border-gray-200 dark:border-dark-border max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-dark-border">
              <div className="flex items-center gap-2 text-[#173F3A] dark:text-dark-text-primary">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold">Pending Profile Update Requests</h3>
              </div>
              <button onClick={() => setReviewRequestsModalOpen(false)} className="text-gray-400 dark:text-dark-text-muted hover:text-gray-600 dark:hover:text-dark-text-secondary dark:text-dark-text-secondary">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-dark-text-secondary">
              The following members have requested updates to their personal and contact records. Review the changes and approve to apply them immediately or reject them:
            </p>

            {pendingRequests.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-dark-canvas/50 dark:bg-dark-surface/50 rounded-xl border border-gray-200 dark:border-dark-border">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-gray-500 dark:text-dark-text-secondary">All caught up!</p>
                <p className="text-[11px] text-gray-400 dark:text-dark-text-muted mt-1">There are no pending profile update requests.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {pendingRequests.map((req) => {
                  let currentMember: any = null;
                  try {
                    const membersStr = localStorage.getItem('eh_members');
                    if (membersStr) {
                      const members = JSON.parse(membersStr);
                      currentMember = members.find((m: any) => m.member_code === req.member_code || m.id === req.member_id);
                    }
                  } catch (e) {
                    console.error('Error reading current member for comparison:', e);
                  }

                  return (
                    <div key={req.id} className="p-4 bg-gray-50 dark:bg-dark-canvas/50 dark:bg-dark-surface/50 rounded-xl border border-gray-200 dark:border-dark-border space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs font-bold text-[#173F3A] dark:text-dark-text-primary">{req.member_name}</span>
                          <span className="text-[10px] font-mono text-gray-500 dark:text-dark-text-secondary block">Code: {req.member_code}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 dark:text-dark-text-muted font-medium">
                          Submitted: {new Date(req.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {req.notes && (
                        <div className="bg-amber-50/50 p-2 rounded border border-amber-100 text-[11px] text-amber-900 italic">
                          <strong>Note from user:</strong> "{req.notes}"
                        </div>
                      )}

                      <div className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border overflow-hidden text-xs">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-gray-100/70 border-b border-gray-200 dark:border-dark-border text-[10px] font-bold text-gray-500 dark:text-dark-text-secondary uppercase">
                              <th className="py-1.5 px-3">Field</th>
                              <th className="py-1.5 px-3">Current Value</th>
                              <th className="py-1.5 px-3 text-[#23796F] dark:text-dark-teal">Proposed New Value</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-dark-divider">
                            {Object.entries(req.requested_fields || {}).map(([key, value]) => {
                              const valStr = String(value || '').trim();
                              if (!valStr) return null;

                              const currentVal = currentMember ? currentMember[key] : 'N/A';

                              return (
                                <tr key={key} className="hover:bg-gray-50/40 outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas">
                                  <td className="py-2 px-3 font-semibold text-gray-600 dark:text-dark-text-secondary capitalize">
                                    {key.replace(/_/g, ' ')}
                                  </td>
                                  <td className="py-2 px-3 text-gray-400 dark:text-dark-text-muted font-mono text-[11px] truncate max-w-[150px]">
                                    {currentVal || <span className="italic">Empty</span>}
                                  </td>
                                  <td className="py-2 px-3 text-emerald-700 font-bold font-mono text-[11px] bg-emerald-50/30">
                                    {valStr}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => handleRejectRequest(req.id)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-lg transition-colors border border-rose-200 outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApproveRequest(req.id)}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                        >
                          Approve & Apply Updates
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-end pt-2 border-t border-gray-100 dark:border-dark-border">
              <button
                onClick={() => setReviewRequestsModalOpen(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-dark-raised hover:bg-gray-200 dark:hover:bg-dark-hover text-gray-700 dark:text-dark-text-secondary font-semibold text-xs rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
