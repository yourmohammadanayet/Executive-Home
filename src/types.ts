export type RoomStatus = 'Occupied' | 'Partially Occupied' | 'Available' | 'Maintenance';

export type MemberStatus = 'Active' | 'Notice' | 'Left' | 'Suspended';

export type ApprovalStatus = 'Approved' | 'Pending' | 'Rejected';

export type DocumentStatus = 'Pending' | 'Submitted' | 'Verified' | 'Rejected' | 'Update Required' | 'Not Applicable';

export type JoiningChargeStatus = 'Not Set' | 'Pending' | 'Partial' | 'Paid' | 'Waived';

export type PaymentPlan = 'immediate' | 'first_month' | 'separate';

export type BillStatus = 'Paid' | 'Partial' | 'Due' | 'Overdue' | 'Advance';

export type PaymentType = 'Monthly Rent' | 'Joining Charge' | 'Combined Rent and Joining Charge' | 'Advance' | 'Adjustment';

export type PaymentMethod = 'Cash' | 'bKash' | 'Nagad' | 'Rocket' | 'Bank Transfer' | 'Other';

export type UserRole = 'admin' | 'member' | 'super_admin';

export type LoginAccessStatus = 'Enabled' | 'Disabled';

export type AccountStatus = 'Active' | 'Suspended';

export interface UserAccessRecord {
  id: string;
  email: string;
  photo_url?: string;
  full_name: string;
  phone: string;
  member_code?: string;
  room_name?: string;
  role: UserRole;
  approval_status: ApprovalStatus;
  login_access: LoginAccessStatus;
  account_status: AccountStatus;
  email_verified: boolean;
  last_login?: string;
  created_at: string;
  disable_reason?: string;
}

export interface ProfileUpdateRequest {
  id: string;
  member_id: string;
  member_name: string;
  member_code: string;
  requested_fields: Record<string, any>;
  status: 'Pending' | 'Approved' | 'Rejected';
  notes?: string;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  actor_name: string;
  actor_email: string;
  action: string;
  target_user: string;
  old_value?: string;
  new_value?: string;
  date_time: string;
  ip_address: string;
  request_id: string;
}

export interface AppSettings {
  id: string;
  home_name: string;
  logo_url?: string;
  address: string;
  contact_email: string;
  contact_phone: string;
  timezone: string;
  currency: string;
  payment_deadline_day: number;
  suggested_joining_charge: number;
  receipt_prefix: string;
  payment_prefix: string;
  // Security
  session_timeout_mins: number;
  password_min_length: number;
  require_email_verification: boolean;
  login_attempt_limit: number;
  notify_security_alerts: boolean;
}

export interface Room {
  id: string;
  room_code: string;
  name: string;
  type: string;
  capacity: number;
  status: RoomStatus;
  notes?: string;
}

export interface JoiningCharge {
  id: string;
  member_id: string;
  suggested_amount: number;
  final_charge_amount: number;
  discount_amount: number;
  waived_amount: number;
  final_payable_amount: number;
  paid_amount: number;
  due_amount: number;
  payment_plan: PaymentPlan;
  status: JoiningChargeStatus;
}

export interface Member {
  id: string;
  member_code: string;
  full_name: string;
  phone?: string;
  email?: string;
  photo_url?: string;
  profession?: string;
  institution?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  nid_number?: string;
  permanent_address?: string;
  blood_group?: string;
  room_id: string;
  base_monthly_rent: number;
  move_in_date: string;
  member_status: MemberStatus;
  approval_status: ApprovalStatus;
  document_status: DocumentStatus;
  auth_user_id?: string | null;
  auth_linked?: boolean;
  notes?: string;
  created_at?: string;
  room?: { name: string; room_code?: string } & Partial<Room>;
  joining_charge?: JoiningCharge;
}

export interface MonthlyBill {
  id: string;
  member_id: string;
  billing_month: string;
  base_rent: number;
  joining_charge_included: boolean;
  joining_charge_amount: number;
  total_payable: number;
  paid_amount: number;
  due_amount: number;
  due_date: string;
  status: BillStatus;
  member?: Partial<Member>;
}

export interface Payment {
  id: string;
  monthly_bill_id?: string;
  member_id: string;
  receipt_number: string;
  payment_date: string;
  amount: number;
  payment_method: PaymentMethod;
  transaction_id?: string;
  payment_type: PaymentType;
  notes?: string;
  member?: Partial<Member>;
}

