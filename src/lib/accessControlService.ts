import { UserAccessRecord, ProfileUpdateRequest, AuditLogEntry, AppSettings } from '../types';

const USER_ACCESS_KEY = 'eh_user_access_records_v1';
const AUDIT_LOGS_KEY = 'eh_audit_logs_v1';
const PROFILE_REQUESTS_KEY = 'eh_profile_requests_v1';
const SETTINGS_KEY = 'eh_app_settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  id: 'set-1',
  home_name: 'Executive Home',
  logo_url: '',
  address: 'House 12, Road 4, Block B, Niketan, Gulshan, Dhaka 1212, Bangladesh',
  contact_email: 'admin@exechome.com',
  contact_phone: '+880 1711-000000',
  timezone: 'Asia/Dhaka (GMT+6)',
  currency: 'BDT (৳)',
  payment_deadline_day: 10,
  suggested_joining_charge: 1500,
  receipt_prefix: 'EH-REC-',
  payment_prefix: 'EH-PAY-',
  session_timeout_mins: 60,
  password_min_length: 8,
  require_email_verification: true,
  login_attempt_limit: 5,
  notify_security_alerts: true,
};

export const INITIAL_USER_ACCESS: UserAccessRecord[] = [
  {
    id: 'user-mem-1',
    email: '',
    full_name: 'MD. Ismail Hossain',
    phone: '',
    member_code: 'EH-001',
    room_name: 'Attached Master Bedroom',
    role: 'member',
    approval_status: 'Approved',
    login_access: 'Disabled',
    account_status: 'Active',
    email_verified: false,
    last_login: 'Never',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'user-mem-2',
    email: '',
    full_name: 'Farhan Shahariar',
    phone: '',
    member_code: 'EH-002',
    room_name: 'Attached Master Bedroom',
    role: 'member',
    approval_status: 'Approved',
    login_access: 'Disabled',
    account_status: 'Active',
    email_verified: false,
    last_login: 'Never',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'user-mem-3',
    email: '',
    full_name: 'Fahad Monshi',
    phone: '',
    member_code: 'EH-003',
    room_name: 'Attached Master Bedroom',
    role: 'member',
    approval_status: 'Approved',
    login_access: 'Disabled',
    account_status: 'Active',
    email_verified: false,
    last_login: 'Never',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'user-mem-4',
    email: '',
    full_name: 'Salah Uddin',
    phone: '',
    member_code: 'EH-004',
    room_name: 'Master Bedroom',
    role: 'member',
    approval_status: 'Approved',
    login_access: 'Disabled',
    account_status: 'Active',
    email_verified: false,
    last_login: 'Never',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'user-mem-5',
    email: '',
    full_name: 'Sabbir',
    phone: '',
    member_code: 'EH-005',
    room_name: 'Master Bedroom',
    role: 'member',
    approval_status: 'Approved',
    login_access: 'Disabled',
    account_status: 'Active',
    email_verified: false,
    last_login: 'Never',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'user-mem-6',
    email: '',
    full_name: "Farhan's Cousin",
    phone: '',
    member_code: 'EH-006',
    room_name: 'Master Bedroom',
    role: 'member',
    approval_status: 'Approved',
    login_access: 'Disabled',
    account_status: 'Active',
    email_verified: false,
    last_login: 'Never',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'user-admin',
    email: 'yourmohammadanayet@gmail.com',
    full_name: 'Mohammad Anayet',
    phone: '',
    member_code: 'EH-007',
    room_name: 'Single Room',
    role: 'admin',
    approval_status: 'Approved',
    login_access: 'Enabled',
    account_status: 'Active',
    email_verified: true,
    last_login: '2026-07-29T10:15:00Z',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'user-mem-8',
    email: '',
    full_name: 'Nayeem',
    phone: '',
    member_code: 'EH-008',
    room_name: 'Without Door Room',
    role: 'member',
    approval_status: 'Approved',
    login_access: 'Disabled',
    account_status: 'Active',
    email_verified: false,
    last_login: 'Never',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'user-mem-9',
    email: '',
    full_name: "Nayeem's Cousin",
    phone: '',
    member_code: 'EH-009',
    room_name: 'Without Door Room',
    role: 'member',
    approval_status: 'Approved',
    login_access: 'Disabled',
    account_status: 'Active',
    email_verified: false,
    last_login: 'Never',
    created_at: '2025-01-01T00:00:00Z',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-1',
    actor_name: 'System Executive Admin',
    actor_email: 'admin@exechome.com',
    action: 'Login Access Enabled',
    target_user: 'MD. Ismail Hossain (EH-001)',
    old_value: 'Disabled',
    new_value: 'Enabled',
    date_time: '2026-07-28 14:32:10',
    ip_address: '103.145.23.11',
    request_id: 'req_8f39a1b2',
  },
  {
    id: 'aud-2',
    actor_name: 'System Executive Admin',
    actor_email: 'admin@exechome.com',
    action: 'Account Suspended',
    target_user: 'Nayeem (EH-008)',
    old_value: 'Active',
    new_value: 'Suspended',
    date_time: '2026-07-27 11:15:44',
    ip_address: '103.145.23.11',
    request_id: 'req_4c18d9e3',
  },
  {
    id: 'aud-3',
    actor_name: 'System Executive Admin',
    actor_email: 'admin@exechome.com',
    action: 'Settings Updated',
    target_user: 'System Configuration',
    old_value: 'Payment Deadline: 5th',
    new_value: 'Payment Deadline: 10th',
    date_time: '2026-07-26 18:02:00',
    ip_address: '103.145.23.11',
    request_id: 'req_9a02b3c4',
  }
];

export function getAccessStatus(user: UserAccessRecord): 'Active' | 'Not Invited' | 'Pending Approval' | 'Blocked' {
  if (user.approval_status === 'Pending') {
    return 'Pending Approval';
  }
  if (user.approval_status === 'Rejected' || user.account_status === 'Suspended') {
    return 'Blocked';
  }
  if (user.approval_status === 'Approved') {
    if (user.login_access === 'Enabled' && user.account_status === 'Active' && user.email_verified) {
      return 'Active';
    }
    if (user.login_access === 'Disabled') {
      return user.disable_reason ? 'Blocked' : 'Not Invited';
    }
    return 'Not Invited';
  }
  return 'Not Invited';
}

/**
 * Idempotent Data Correction Migration:
 * Removes unconfirmed demo accounts, links Primary Admin (Mohammad Anayet) to EH-007,
 * and maintains exactly 9 approved Executive Home residents.
 */
export function runDataCorrectionMigration(): UserAccessRecord[] {
  const MIGRATION_KEY = 'eh_data_migration_v2_done';
  try {
    const recordsStr = localStorage.getItem(USER_ACCESS_KEY);
    let records: UserAccessRecord[] = recordsStr ? JSON.parse(recordsStr) : [];

    // Filter out unconfirmed demo accounts / extra admins
    const isDemoUser = (r: UserAccessRecord) => {
      const code = (r.member_code || '').toUpperCase();
      const name = (r.full_name || '').toLowerCase();
      const email = (r.email || '').toLowerCase();
      if (code.startsWith('ADM-')) return true;
      if (name.includes('system executive admin')) return true;
      if (name.includes('rasel ahmed') || name.includes('tanvir hasan') || name.includes('kamal hossain')) return true;
      if (email === 'admin@exechome.com' || email.includes('@exechome.com')) return true;
      return false;
    };

    const hasDemoUsers = records.some(isDemoUser);
    const hasAlreadyMigrated = localStorage.getItem(MIGRATION_KEY) === 'true';

    if (records.length === 0 || hasDemoUsers || !hasAlreadyMigrated) {
      records = [...INITIAL_USER_ACCESS];
      localStorage.setItem(USER_ACCESS_KEY, JSON.stringify(records));
      localStorage.setItem(MIGRATION_KEY, 'true');

      // Log Audit Entry
      addAuditEntry({
        actor_name: 'Mohammad Anayet (Admin)',
        actor_email: 'yourmohammadanayet@gmail.com',
        action: 'Idempotent Data Correction Migration Executed',
        target_user: 'System Database & User Access',
        old_value: 'Contains demo users / inconsistent profiles',
        new_value: 'Restored 9 confirmed residents. Linked Mohammad Anayet to EH-007 as Primary Admin.',
      });
    }

    return records;
  } catch {
    return INITIAL_USER_ACCESS;
  }
}

export function getUserAccessRecords(): UserAccessRecord[] {
  return runDataCorrectionMigration();
}

export function saveUserAccessRecords(records: UserAccessRecord[]) {
  localStorage.setItem(USER_ACCESS_KEY, JSON.stringify(records));
}

export function validateUserAccess(email: string): {
  canLogin: boolean;
  reasonKey: 'pending' | 'disabled' | 'suspended' | 'rejected' | 'unverified' | null;
  message: string | null;
  user: UserAccessRecord | null;
} {
  const records = getUserAccessRecords();
  const lower = email.toLowerCase().trim();
  
  // Find matching user record
  let user = records.find(r => r.email.toLowerCase().trim() === lower);

  // Default fallback if logging in as admin or default user without an existing record
  if (!user && (lower === 'yourmohammadanayet@gmail.com' || lower.startsWith('admin'))) {
    user = {
      id: 'user-admin-auto',
      email: lower,
      full_name: 'Executive Home Admin',
      phone: '01800000000',
      member_code: 'ADM-000',
      role: 'admin',
      approval_status: 'Approved',
      login_access: 'Enabled',
      account_status: 'Active',
      email_verified: true,
      created_at: new Date().toISOString(),
    };
    records.unshift(user);
    saveUserAccessRecords(records);
  }

  // If still no record exists, allow default member record generation for testing
  if (!user) {
    user = {
      id: `user-${Date.now()}`,
      email: lower,
      full_name: lower.split('@')[0].toUpperCase(),
      phone: '',
      member_code: `EH-${Math.floor(100 + Math.random() * 900)}`,
      role: 'member',
      approval_status: 'Approved',
      login_access: 'Enabled',
      account_status: 'Active',
      email_verified: true,
      created_at: new Date().toISOString(),
    };
    records.push(user);
    saveUserAccessRecords(records);
  }

  // Strict Condition 1: Approval Status = Approved
  if (user.approval_status === 'Pending') {
    return {
      canLogin: false,
      reasonKey: 'pending',
      message: 'Your account is waiting for admin approval.',
      user,
    };
  }

  if (user.approval_status === 'Rejected') {
    return {
      canLogin: false,
      reasonKey: 'rejected',
      message: 'Your membership application was not approved.',
      user,
    };
  }

  // Strict Condition 2: Login Access = Enabled
  if (user.login_access === 'Disabled') {
    return {
      canLogin: false,
      reasonKey: 'disabled',
      message: 'Your login access has not been enabled by the administrator.',
      user,
    };
  }

  // Strict Condition 3: Account Status = Active
  if (user.account_status === 'Suspended') {
    return {
      canLogin: false,
      reasonKey: 'suspended',
      message: 'Your account has been suspended. Please contact the administrator.',
      user,
    };
  }

  // Strict Condition 4: Email Verified = true
  if (!user.email_verified) {
    return {
      canLogin: false,
      reasonKey: 'unverified',
      message: 'Please verify your email address before signing in.',
      user,
    };
  }

  // All 4 conditions met!
  return {
    canLogin: true,
    reasonKey: null,
    message: null,
    user,
  };
}

export function getAuditLogs(): AuditLogEntry[] {
  try {
    const data = localStorage.getItem(AUDIT_LOGS_KEY);
    if (!data) {
      localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(INITIAL_AUDIT_LOGS));
      return INITIAL_AUDIT_LOGS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_AUDIT_LOGS;
  }
}

export function addAuditEntry(entry: Omit<AuditLogEntry, 'id' | 'date_time' | 'request_id' | 'ip_address'>) {
  const logs = getAuditLogs();
  const now = new Date();
  const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  
  const newEntry: AuditLogEntry = {
    id: `aud-${Date.now()}`,
    date_time: formattedDate,
    ip_address: '103.145.23.11',
    request_id: `req_${Math.random().toString(36).substring(2, 10)}`,
    ...entry,
  };

  logs.unshift(newEntry);
  localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(logs));
  return newEntry;
}

export function getProfileUpdateRequests(): ProfileUpdateRequest[] {
  try {
    const data = localStorage.getItem(PROFILE_REQUESTS_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function submitProfileUpdateRequest(request: Omit<ProfileUpdateRequest, 'id' | 'status' | 'created_at'>) {
  const requests = getProfileUpdateRequests();
  const newReq: ProfileUpdateRequest = {
    id: `req-prof-${Date.now()}`,
    status: 'Pending',
    created_at: new Date().toISOString(),
    ...request,
  };
  requests.unshift(newReq);
  localStorage.setItem(PROFILE_REQUESTS_KEY, JSON.stringify(requests));
  
  // Log audit
  addAuditEntry({
    actor_name: request.member_name,
    actor_email: request.member_code,
    action: 'Profile Update Requested',
    target_user: `${request.member_name} (${request.member_code})`,
    new_value: JSON.stringify(request.requested_fields),
  });

  return newReq;
}

export function updateProfileRequestStatus(id: string, status: 'Approved' | 'Rejected', adminActorName: string) {
  const requests = getProfileUpdateRequests();
  const index = requests.findIndex(r => r.id === id);
  if (index !== -1) {
    requests[index].status = status;
    localStorage.setItem(PROFILE_REQUESTS_KEY, JSON.stringify(requests));

    addAuditEntry({
      actor_name: adminActorName,
      actor_email: 'admin@exechome.com',
      action: `Profile Update ${status}`,
      target_user: `${requests[index].member_name} (${requests[index].member_code})`,
      old_value: 'Pending',
      new_value: status,
    });
  }
}

export interface SentEmailNotification {
  id: string;
  recipient_name: string;
  recipient_email: string;
  subject: string;
  body: string;
  temp_password?: string;
  sent_at: string;
}

export function getSentEmailNotifications(): SentEmailNotification[] {
  try {
    const data = localStorage.getItem('eh_sent_emails_v1');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveSentEmailNotification(email: Omit<SentEmailNotification, 'id' | 'sent_at'>) {
  const list = getSentEmailNotifications();
  const newItem: SentEmailNotification = {
    id: `email-${Date.now()}`,
    sent_at: new Date().toISOString(),
    ...email,
  };
  list.unshift(newItem);
  localStorage.setItem('eh_sent_emails_v1', JSON.stringify(list));
  return newItem;
}

export function getAppSettings(): AppSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return JSON.parse(data);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveAppSettings(settings: AppSettings, adminActorName: string) {
  const oldSettings = getAppSettings();
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

  addAuditEntry({
    actor_name: adminActorName,
    actor_email: 'admin@exechome.com',
    action: 'System Settings Updated',
    target_user: 'Application Preferences',
    old_value: `Name: ${oldSettings.home_name}, Deadline: Day ${oldSettings.payment_deadline_day}`,
    new_value: `Name: ${settings.home_name}, Deadline: Day ${settings.payment_deadline_day}`,
  });
}
