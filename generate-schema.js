import fs from 'fs';

const sql = `-- Executive Home Management System - Supabase Schema
-- Clean up existing tables
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS advance_applications CASCADE;
DROP TABLE IF EXISTS member_advances CASCADE;
DROP TABLE IF EXISTS payment_allocations CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS monthly_bills CASCADE;
DROP TABLE IF EXISTS joining_charges CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 1. profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  member_id UUID,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. rooms
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  room_type TEXT NOT NULL CHECK (room_type IN ('attached_master_bedroom', 'master_bedroom', 'single_room', 'without_door_room', 'other')),
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'partially_occupied', 'occupied', 'maintenance', 'archived')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

-- 3. members
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_code TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT UNIQUE,
  profile_photo_path TEXT,
  room_id UUID REFERENCES rooms(id),
  base_monthly_rent NUMERIC(12,2) NOT NULL CHECK (base_monthly_rent >= 0),
  move_in_date DATE NOT NULL,
  move_out_date DATE,
  member_status TEXT NOT NULL DEFAULT 'active' CHECK (member_status IN ('active', 'notice', 'left', 'suspended', 'archived')),
  document_status TEXT NOT NULL DEFAULT 'pending' CHECK (document_status IN ('pending', 'submitted', 'verified', 'rejected', 'update_required', 'not_applicable')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

ALTER TABLE profiles ADD CONSTRAINT fk_profiles_member_id FOREIGN KEY (member_id) REFERENCES members(id);

-- 4. joining_charges
CREATE TABLE joining_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) UNIQUE,
  suggested_amount NUMERIC(12,2) NOT NULL DEFAULT 1500 CHECK (suggested_amount >= 0),
  final_charge_amount NUMERIC(12,2) NOT NULL CHECK (final_charge_amount >= 0),
  discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  waived_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (waived_amount >= 0 AND waived_amount <= final_charge_amount),
  final_payable_amount NUMERIC(12,2) NOT NULL CHECK (final_payable_amount >= 0),
  payment_plan TEXT NOT NULL CHECK (payment_plan IN ('immediate', 'first_month_bill', 'separate_later')),
  include_in_first_bill BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'not_set' CHECK (status IN ('not_set', 'pending', 'partial', 'paid', 'waived')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  waived_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ
);

-- 5. monthly_bills
CREATE TABLE monthly_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id),
  billing_month DATE NOT NULL,
  base_rent NUMERIC(12,2) NOT NULL CHECK (base_rent >= 0),
  previous_rent_due NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (previous_rent_due >= 0),
  monthly_discount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (monthly_discount >= 0),
  advance_adjustment NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (advance_adjustment >= 0),
  joining_charge_included BOOLEAN NOT NULL DEFAULT FALSE,
  joining_charge_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (joining_charge_amount >= 0),
  total_payable NUMERIC(12,2) NOT NULL CHECK (total_payable >= 0),
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'due', 'partial', 'paid', 'overdue', 'advance', 'void')),
  generated_automatically BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ,
  UNIQUE(member_id, billing_month)
);

-- 6. payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_number TEXT NOT NULL UNIQUE,
  receipt_number TEXT NOT NULL UNIQUE,
  member_id UUID NOT NULL REFERENCES members(id),
  payment_date DATE NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'bkash', 'nagad', 'rocket', 'bank_transfer', 'other')),
  transaction_id TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'reversed', 'void')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reversed_at TIMESTAMPTZ,
  reversed_by UUID REFERENCES auth.users(id),
  reversal_reason TEXT
);

-- 7. payment_allocations
CREATE TABLE payment_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id),
  monthly_bill_id UUID REFERENCES monthly_bills(id),
  joining_charge_id UUID REFERENCES joining_charges(id),
  allocation_type TEXT NOT NULL CHECK (allocation_type IN ('monthly_rent', 'joining_charge', 'advance', 'adjustment')),
  allocated_amount NUMERIC(12,2) NOT NULL CHECK (allocated_amount > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    (monthly_bill_id IS NOT NULL AND joining_charge_id IS NULL) OR
    (joining_charge_id IS NOT NULL AND monthly_bill_id IS NULL) OR
    (allocation_type IN ('advance', 'adjustment'))
  )
);

-- 8. member_advances
CREATE TABLE member_advances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id),
  source_payment_id UUID REFERENCES payments(id),
  original_amount NUMERIC(12,2) NOT NULL CHECK (original_amount > 0),
  remaining_amount NUMERIC(12,2) NOT NULL CHECK (remaining_amount >= 0 AND remaining_amount <= original_amount),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'partially_used', 'fully_used', 'reversed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. advance_applications
CREATE TABLE advance_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_advance_id UUID NOT NULL REFERENCES member_advances(id),
  monthly_bill_id UUID NOT NULL REFERENCES monthly_bills(id),
  applied_amount NUMERIC(12,2) NOT NULL CHECK (applied_amount > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id),
  document_type TEXT NOT NULL CHECK (document_type IN ('profile_photo', 'nid_or_birth_registration', 'student_or_office_id', 'passport', 'guardian_id', 'rental_agreement', 'other')),
  private_file_path TEXT NOT NULL,
  original_file_name TEXT,
  mime_type TEXT,
  file_size INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'verified', 'rejected', 'update_required', 'not_applicable')),
  submitted_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

-- 11. settings
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_name TEXT NOT NULL DEFAULT 'Executive Home',
  home_address TEXT,
  phone TEXT,
  email TEXT,
  currency TEXT NOT NULL DEFAULT 'BDT',
  timezone TEXT NOT NULL DEFAULT 'Asia/Dhaka',
  suggested_joining_charge NUMERIC(12,2) NOT NULL DEFAULT 1500,
  payment_deadline_day INTEGER NOT NULL DEFAULT 10,
  receipt_prefix TEXT NOT NULL DEFAULT 'EH-RCP',
  payment_prefix TEXT NOT NULL DEFAULT 'EH-PAY',
  file_upload_limit_mb INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- 12. notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  member_id UUID REFERENCES members(id),
  notification_type TEXT NOT NULL CHECK (notification_type IN ('payment_due_soon', 'payment_overdue', 'partial_payment', 'joining_charge_pending', 'joining_charge_partial', 'document_submitted', 'document_verification_pending', 'payment_received', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. audit_logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  request_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SEED DATA

INSERT INTO settings (home_name, currency, timezone, suggested_joining_charge, payment_deadline_day)
VALUES ('Executive Home', 'BDT', 'Asia/Dhaka', 1500, 10);

INSERT INTO rooms (id, room_code, name, room_type, capacity, status) VALUES
  ('11111111-1111-1111-1111-111111111111', 'RM-01', 'Attached Master Bedroom', 'attached_master_bedroom', 3, 'occupied'),
  ('22222222-2222-2222-2222-222222222222', 'RM-02', 'Master Bedroom', 'master_bedroom', 3, 'occupied'),
  ('33333333-3333-3333-3333-333333333333', 'RM-03', 'Single Room', 'single_room', 1, 'occupied'),
  ('44444444-4444-4444-4444-444444444444', 'RM-04', 'Without Door Room', 'without_door_room', 2, 'occupied');

INSERT INTO members (id, member_code, full_name, room_id, base_monthly_rent, move_in_date) VALUES
  ('10000000-0000-0000-0000-000000000001', 'EH-001', 'MD. Ismail Hossain', '11111111-1111-1111-1111-111111111111', 3450, '2026-08-01'),
  ('10000000-0000-0000-0000-000000000002', 'EH-002', 'Farhan Shahariar', '11111111-1111-1111-1111-111111111111', 3450, '2026-08-01'),
  ('10000000-0000-0000-0000-000000000003', 'EH-003', 'Fahad Monshi', '11111111-1111-1111-1111-111111111111', 3450, '2026-08-01'),
  ('10000000-0000-0000-0000-000000000004', 'EH-004', 'Salah Uddin', '22222222-2222-2222-2222-222222222222', 3200, '2026-08-01'),
  ('10000000-0000-0000-0000-000000000005', 'EH-005', 'Sabbir', '22222222-2222-2222-2222-222222222222', 3200, '2026-08-01'),
  ('10000000-0000-0000-0000-000000000006', 'EH-006', 'Farhan’s Cousin', '22222222-2222-2222-2222-222222222222', 3200, '2026-08-01'),
  ('10000000-0000-0000-0000-000000000007', 'EH-007', 'Mohammad Anayet', '33333333-3333-3333-3333-333333333333', 3900, '2026-08-01'),
  ('10000000-0000-0000-0000-000000000008', 'EH-008', 'Nayeem', '44444444-4444-4444-4444-444444444444', 2000, '2026-08-01'),
  ('10000000-0000-0000-0000-000000000009', 'EH-009', 'Nayeem’s Cousin', '44444444-4444-4444-4444-444444444444', 2000, '2026-08-01');
`;
fs.writeFileSync('supabase-schema.sql', sql);
