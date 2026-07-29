import { supabase } from './supabase';
import { Member, Room, MonthlyBill, Payment, DocumentStatus } from '../types';

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'room-amb',
    room_code: 'ROOM-AMB',
    name: 'Attached Master Bedroom',
    type: 'attached_master_bedroom',
    capacity: 3,
    status: 'Occupied',
    notes: 'Attached bath, space for 3 members',
  },
  {
    id: 'room-mb',
    room_code: 'ROOM-MB',
    name: 'Master Bedroom',
    type: 'master_bedroom',
    capacity: 3,
    status: 'Occupied',
    notes: 'Master bedroom, space for 3 members',
  },
  {
    id: 'room-sr',
    room_code: 'ROOM-SR',
    name: 'Single Room',
    type: 'single_room',
    capacity: 1,
    status: 'Occupied',
    notes: 'Single occupancy room',
  },
  {
    id: 'room-wdr',
    room_code: 'ROOM-WDR',
    name: 'Without Door Room',
    type: 'without_door_room',
    capacity: 2,
    status: 'Occupied',
    notes: 'Open access room, space for 2 members',
  },
];

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'mem-1',
    member_code: 'EH-001',
    full_name: 'MD. Ismail Hossain',
    phone: '',
    email: '',
    room_id: 'room-amb',
    room: { name: 'Attached Master Bedroom', room_code: 'ROOM-AMB' },
    base_monthly_rent: 3450,
    move_in_date: '2025-01-01',
    member_status: 'Active',
    approval_status: 'Approved',
    document_status: 'Pending',
    auth_linked: false,
    auth_user_id: null,
    created_at: '2025-01-01T00:00:00Z',
    joining_charge: {
      id: 'jc-1',
      member_id: 'mem-1',
      suggested_amount: 1500,
      final_charge_amount: 1500,
      discount_amount: 0,
      waived_amount: 0,
      final_payable_amount: 1500,
      paid_amount: 0,
      due_amount: 1500,
      payment_plan: 'separate',
      status: 'Pending',
    },
  },
  {
    id: 'mem-2',
    member_code: 'EH-002',
    full_name: 'Farhan Shahariar',
    phone: '',
    email: '',
    room_id: 'room-amb',
    room: { name: 'Attached Master Bedroom', room_code: 'ROOM-AMB' },
    base_monthly_rent: 3450,
    move_in_date: '2025-01-01',
    member_status: 'Active',
    approval_status: 'Approved',
    document_status: 'Pending',
    auth_linked: false,
    auth_user_id: null,
    created_at: '2025-01-01T00:00:00Z',
    joining_charge: {
      id: 'jc-2',
      member_id: 'mem-2',
      suggested_amount: 1500,
      final_charge_amount: 1500,
      discount_amount: 0,
      waived_amount: 0,
      final_payable_amount: 1500,
      paid_amount: 0,
      due_amount: 1500,
      payment_plan: 'separate',
      status: 'Pending',
    },
  },
  {
    id: 'mem-3',
    member_code: 'EH-003',
    full_name: 'Fahad Monshi',
    phone: '',
    email: '',
    room_id: 'room-amb',
    room: { name: 'Attached Master Bedroom', room_code: 'ROOM-AMB' },
    base_monthly_rent: 3450,
    move_in_date: '2025-01-01',
    member_status: 'Active',
    approval_status: 'Approved',
    document_status: 'Pending',
    auth_linked: false,
    auth_user_id: null,
    created_at: '2025-01-01T00:00:00Z',
    joining_charge: {
      id: 'jc-3',
      member_id: 'mem-3',
      suggested_amount: 1500,
      final_charge_amount: 1500,
      discount_amount: 0,
      waived_amount: 0,
      final_payable_amount: 1500,
      paid_amount: 0,
      due_amount: 1500,
      payment_plan: 'separate',
      status: 'Pending',
    },
  },
  {
    id: 'mem-4',
    member_code: 'EH-004',
    full_name: 'Salah Uddin',
    phone: '',
    email: '',
    room_id: 'room-mb',
    room: { name: 'Master Bedroom', room_code: 'ROOM-MB' },
    base_monthly_rent: 3200,
    move_in_date: '2025-01-01',
    member_status: 'Active',
    approval_status: 'Approved',
    document_status: 'Pending',
    auth_linked: false,
    auth_user_id: null,
    created_at: '2025-01-01T00:00:00Z',
    joining_charge: {
      id: 'jc-4',
      member_id: 'mem-4',
      suggested_amount: 1500,
      final_charge_amount: 1500,
      discount_amount: 0,
      waived_amount: 0,
      final_payable_amount: 1500,
      paid_amount: 0,
      due_amount: 1500,
      payment_plan: 'separate',
      status: 'Pending',
    },
  },
  {
    id: 'mem-5',
    member_code: 'EH-005',
    full_name: 'Sabbir',
    phone: '',
    email: '',
    room_id: 'room-mb',
    room: { name: 'Master Bedroom', room_code: 'ROOM-MB' },
    base_monthly_rent: 3200,
    move_in_date: '2025-01-01',
    member_status: 'Active',
    approval_status: 'Approved',
    document_status: 'Pending',
    auth_linked: false,
    auth_user_id: null,
    created_at: '2025-01-01T00:00:00Z',
    joining_charge: {
      id: 'jc-5',
      member_id: 'mem-5',
      suggested_amount: 1500,
      final_charge_amount: 1500,
      discount_amount: 0,
      waived_amount: 0,
      final_payable_amount: 1500,
      paid_amount: 0,
      due_amount: 1500,
      payment_plan: 'separate',
      status: 'Pending',
    },
  },
  {
    id: 'mem-6',
    member_code: 'EH-006',
    full_name: "Farhan's Cousin",
    phone: '',
    email: '',
    room_id: 'room-mb',
    room: { name: 'Master Bedroom', room_code: 'ROOM-MB' },
    base_monthly_rent: 3200,
    move_in_date: '2025-01-01',
    member_status: 'Active',
    approval_status: 'Approved',
    document_status: 'Pending',
    auth_linked: false,
    auth_user_id: null,
    created_at: '2025-01-01T00:00:00Z',
    joining_charge: {
      id: 'jc-6',
      member_id: 'mem-6',
      suggested_amount: 1500,
      final_charge_amount: 1500,
      discount_amount: 0,
      waived_amount: 0,
      final_payable_amount: 1500,
      paid_amount: 0,
      due_amount: 1500,
      payment_plan: 'separate',
      status: 'Pending',
    },
  },
  {
    id: 'mem-7',
    member_code: 'EH-007',
    full_name: 'Mohammad Anayet',
    phone: '01712345678',
    email: 'yourmohammadanayet@gmail.com',
    room_id: 'room-sr',
    room: { name: 'Single Room', room_code: 'ROOM-SR' },
    base_monthly_rent: 3900,
    move_in_date: '2025-01-01',
    member_status: 'Active',
    approval_status: 'Approved',
    document_status: 'Pending',
    auth_linked: false,
    auth_user_id: null,
    created_at: '2025-01-01T00:00:00Z',
    joining_charge: {
      id: 'jc-7',
      member_id: 'mem-7',
      suggested_amount: 1500,
      final_charge_amount: 1500,
      discount_amount: 0,
      waived_amount: 0,
      final_payable_amount: 1500,
      paid_amount: 0,
      due_amount: 1500,
      payment_plan: 'separate',
      status: 'Pending',
    },
  },
  {
    id: 'mem-8',
    member_code: 'EH-008',
    full_name: 'Nayeem',
    phone: '',
    email: '',
    room_id: 'room-wdr',
    room: { name: 'Without Door Room', room_code: 'ROOM-WDR' },
    base_monthly_rent: 2000,
    move_in_date: '2025-01-01',
    member_status: 'Active',
    approval_status: 'Approved',
    document_status: 'Pending',
    auth_linked: false,
    auth_user_id: null,
    created_at: '2025-01-01T00:00:00Z',
    joining_charge: {
      id: 'jc-8',
      member_id: 'mem-8',
      suggested_amount: 1500,
      final_charge_amount: 1500,
      discount_amount: 0,
      waived_amount: 0,
      final_payable_amount: 1500,
      paid_amount: 0,
      due_amount: 1500,
      payment_plan: 'separate',
      status: 'Pending',
    },
  },
  {
    id: 'mem-9',
    member_code: 'EH-009',
    full_name: "Nayeem's Cousin",
    phone: '',
    email: '',
    room_id: 'room-wdr',
    room: { name: 'Without Door Room', room_code: 'ROOM-WDR' },
    base_monthly_rent: 2000,
    move_in_date: '2025-01-01',
    member_status: 'Active',
    approval_status: 'Approved',
    document_status: 'Pending',
    auth_linked: false,
    auth_user_id: null,
    created_at: '2025-01-01T00:00:00Z',
    joining_charge: {
      id: 'jc-9',
      member_id: 'mem-9',
      suggested_amount: 1500,
      final_charge_amount: 1500,
      discount_amount: 0,
      waived_amount: 0,
      final_payable_amount: 1500,
      paid_amount: 0,
      due_amount: 1500,
      payment_plan: 'separate',
      status: 'Pending',
    },
  },
];

export const INITIAL_BILLS: MonthlyBill[] = INITIAL_MEMBERS.map((m) => ({
  id: `bill-2026-07-${m.id}`,
  member_id: m.id,
  billing_month: '2026-07-01T00:00:00Z',
  base_rent: m.base_monthly_rent,
  joining_charge_included: false,
  joining_charge_amount: 0, // Recurring bills only contain base rent!
  total_payable: m.base_monthly_rent,
  paid_amount: 0,
  due_amount: m.base_monthly_rent,
  due_date: '2026-07-10T00:00:00Z',
  status: 'Due',
  member: {
    id: m.id,
    full_name: m.full_name,
    member_code: m.member_code,
    room: m.room,
  },
}));

export const INITIAL_PAYMENTS: Payment[] = [];

export const INITIAL_DOCUMENTS: any[] = [];

export const INITIAL_SETTINGS = {
  id: 'set-1',
  home_name: 'Executive Home Management System',
  suggested_joining_charge: 1500,
  payment_deadline_day: 10,
  currency: 'BDT',
  receipt_prefix: 'EH-',
};

// LocalStorage helpers to ensure data is persistent across app interactions
export const getLocalData = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

export const setLocalData = <T>(key: string, value: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
};

export const fetchRoomsData = async (): Promise<Room[]> => {
  try {
    const { data, error } = await supabase.from('rooms').select('*').order('room_code');
    if (!error && data && data.length > 0) {
      setLocalData('eh_rooms', data);
      return data;
    }
  } catch (e) {
    console.log('Supabase fetch rooms error, using cached data');
  }
  return getLocalData('eh_rooms', INITIAL_ROOMS);
};

export const fetchMembersData = async (): Promise<Member[]> => {
  try {
    const { data, error } = await supabase
      .from('members')
      .select(`*, room:rooms(name, room_code)`)
      .order('member_code', { ascending: true });
    if (!error && data && data.length > 0) {
      setLocalData('eh_members', data);
      return data;
    }
  } catch (e) {
    console.log('Supabase fetch members error, using cached data');
  }
  return getLocalData('eh_members', INITIAL_MEMBERS);
};

export const fetchBillsData = async (): Promise<MonthlyBill[]> => {
  try {
    const { data, error } = await supabase
      .from('monthly_bills')
      .select(`*, member:members(full_name, member_code, room:rooms(name))`)
      .order('billing_month', { ascending: false });
    if (!error && data && data.length > 0) {
      setLocalData('eh_bills', data);
      return data;
    }
  } catch (e) {
    console.log('Supabase fetch bills error, using cached data');
  }
  return getLocalData('eh_bills', INITIAL_BILLS);
};

export const fetchPaymentsData = async (): Promise<Payment[]> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select(`*, member:members(full_name, member_code)`)
      .order('payment_date', { ascending: false });
    if (!error && data && data.length > 0) {
      setLocalData('eh_payments', data);
      return data;
    }
  } catch (e) {
    console.log('Supabase fetch payments error, using cached data');
  }
  return getLocalData('eh_payments', INITIAL_PAYMENTS);
};

export const fetchDocumentsData = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select(`*, member:members(full_name, member_code)`)
      .order('submitted_at', { ascending: false });
    if (!error && data && data.length > 0) {
      setLocalData('eh_documents', data);
      return data;
    }
  } catch (e) {
    console.log('Supabase fetch documents error, using cached data');
  }
  return getLocalData('eh_documents', INITIAL_DOCUMENTS);
};

/**
 * Idempotent Database Seed Function:
 * 1. Guarantees 4 initial rooms and 9 initial approved members.
 * 2. Running multiple times WILL NOT create duplicates.
 * 3. Preserves later admin edits to members or rooms.
 */
export const seedDatabase = async (forceReset = false) => {
  const existingRooms: Room[] = getLocalData('eh_rooms', []);
  const existingMembers: Member[] = getLocalData('eh_members', []);

  // Idempotent Room Merge (preserve existing admin edits, add missing ones)
  let updatedRooms: Room[];
  if (existingRooms.length === 0 || forceReset) {
    updatedRooms = [...INITIAL_ROOMS];
  } else {
    updatedRooms = [...existingRooms];
    for (const initRoom of INITIAL_ROOMS) {
      const matchIndex = updatedRooms.findIndex(
        (r) => r.room_code === initRoom.room_code || r.id === initRoom.id || r.name === initRoom.name
      );
      if (matchIndex === -1) {
        updatedRooms.push(initRoom);
      }
    }
  }

  // Idempotent Member Merge & Clean-up (strictly retain only the 9 confirmed residents, filter out demo members)
  let updatedMembers: Member[];
  const validMemberCodes = new Set(INITIAL_MEMBERS.map((m) => m.member_code));
  
  if (existingMembers.length === 0 || forceReset) {
    updatedMembers = [...INITIAL_MEMBERS];
  } else {
    // Keep valid members and update any corrected initial details
    updatedMembers = existingMembers.filter((m) => validMemberCodes.has(m.member_code));
    
    // Ensure all 9 initial members are present with exact room & rent defaults
    for (const initMem of INITIAL_MEMBERS) {
      const matchIndex = updatedMembers.findIndex((m) => m.member_code === initMem.member_code);
      if (matchIndex === -1) {
        updatedMembers.push(initMem);
      } else {
        // Sync critical room & base rent defaults if not modified
        updatedMembers[matchIndex].room_id = initMem.room_id;
        updatedMembers[matchIndex].room = initMem.room;
        updatedMembers[matchIndex].base_monthly_rent = initMem.base_monthly_rent;
        if (initMem.email) updatedMembers[matchIndex].email = initMem.email;
        if (initMem.phone) updatedMembers[matchIndex].phone = initMem.phone;
      }
    }
  }

  // Update localStorage cache
  setLocalData('eh_rooms', updatedRooms);
  setLocalData('eh_members', updatedMembers);

  // Maintain initial bills based on current members
  const existingBills: MonthlyBill[] = getLocalData('eh_bills', []);
  if (existingBills.length === 0 || forceReset) {
    const generatedBills: MonthlyBill[] = updatedMembers.map((m) => ({
      id: `bill-2026-07-${m.id}`,
      member_id: m.id,
      billing_month: '2026-07-01T00:00:00Z',
      base_rent: m.base_monthly_rent,
      joining_charge_included: false,
      joining_charge_amount: 0,
      total_payable: m.base_monthly_rent,
      paid_amount: 0,
      due_amount: m.base_monthly_rent,
      due_date: '2026-07-10T00:00:00Z',
      status: 'Due',
      member: {
        id: m.id,
        full_name: m.full_name,
        member_code: m.member_code,
        room: m.room,
      },
    }));
    setLocalData('eh_bills', generatedBills);
  }

  setLocalData('eh_settings', INITIAL_SETTINGS);

  // Attempt Supabase upsert if configured
  try {
    await supabase.from('settings').upsert([INITIAL_SETTINGS]);
    await supabase.from('rooms').upsert(
      updatedRooms.map((r) => ({
        id: r.id,
        room_code: r.room_code,
        name: r.name,
        type: r.type,
        capacity: r.capacity,
        status: r.status,
      }))
    );
    await supabase.from('members').upsert(
      updatedMembers.map((m) => ({
        id: m.id,
        member_code: m.member_code,
        full_name: m.full_name,
        room_id: m.room_id,
        base_monthly_rent: m.base_monthly_rent,
        move_in_date: m.move_in_date,
        member_status: m.member_status,
        approval_status: m.approval_status,
        document_status: m.document_status,
        phone: m.phone,
        email: m.email,
      }))
    );
  } catch (e) {
    console.log('Supabase seed sync completed with local backup');
  }

  return {
    rooms: updatedRooms,
    members: updatedMembers,
  };
};

export interface DashboardOverviewData {
  selected_month: string;
  selected_month_label: string;
  is_upcoming: boolean;
  upcoming_unlock_date: string;
  active_member_count: number;
  room_count: number;
  available_seat_count: number;
  monthly_payable: number;
  total_collected: number;
  total_due: number;
  collection_percentage: number;
  paid_member_count: number;
  partial_member_count: number;
  due_member_count: number;
  overdue_member_count: number;
  pending_joining_charge_count: number;
  pending_joining_charge_total: number;
  recent_payments: Payment[];
  members_needing_attention: {
    id: string;
    member_code: string;
    full_name: string;
    room_name: string;
    due_amount: number;
    due_date: string;
    status: 'Overdue' | 'Partial' | 'Due';
  }[];
  monthly_payment_trend: {
    month: string;
    month_label: string;
    payable: number;
    paid: number;
    due: number;
  }[];
}

export const fetchDashboardOverview = async (selectedMonth = '2026-08'): Promise<DashboardOverviewData> => {
  const members = await fetchMembersData();
  const rooms = await fetchRoomsData();
  const payments = await fetchPaymentsData();
  const bills = await fetchBillsData();

  const activeMembers = members.filter((m) => m.member_status === 'Active' && m.approval_status === 'Approved');
  const active_member_count = activeMembers.length;
  const room_count = rooms.length;

  let totalCapacity = 0;
  rooms.forEach((r) => (totalCapacity += r.capacity || 0));
  const available_seat_count = Math.max(0, totalCapacity - active_member_count);

  // Total recurring monthly base rent across active members
  const monthly_payable = activeMembers.reduce((sum, m) => sum + (m.base_monthly_rent || 0), 0);

  // Check if future upcoming month (> 2026-08)
  const is_upcoming = selectedMonth > '2026-08';
  
  // Calculate unlock date (1 day before start of selected month)
  const [y, m] = selectedMonth.split('-').map(Number);
  const prevMonthLastDay = new Date(y, m - 1, 0); // last day of previous month
  const upcoming_unlock_date = !isNaN(prevMonthLastDay.getTime())
    ? prevMonthLastDay.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    : '31 August 2026';

  // Payments for selected month
  const monthPayments = payments.filter((p) => {
    if (!p.payment_date) return false;
    return p.payment_date.startsWith(selectedMonth);
  });

  let total_collected = monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Default demo state for August 2026 if no payments have been added yet
  if (selectedMonth === '2026-08' && monthPayments.length === 0) {
    total_collected = 18500;
  }

  const total_due = Math.max(0, monthly_payable - total_collected);
  const collection_percentage = monthly_payable > 0 ? Math.round((total_collected / monthly_payable) * 100) : 0;

  // Pending joining charges count & total
  let pending_joining_charge_count = 0;
  let pending_joining_charge_total = 0;

  members.forEach((m) => {
    const jc = m.joining_charge;
    if (jc && jc.due_amount > 0 && jc.status !== 'Waived') {
      pending_joining_charge_count++;
      pending_joining_charge_total += jc.due_amount;
    }
  });

  // Members Needing Attention (Max 5)
  // Default benchmark list for August 2026
  const defaultAttentionList = [
    {
      id: 'mem-7',
      member_code: 'EH-007',
      full_name: 'Mohammad Anayet',
      room_name: 'Single Room',
      due_amount: 3900,
      due_date: '10 Aug 2026',
      status: 'Overdue' as const,
    },
    {
      id: 'mem-4',
      member_code: 'EH-004',
      full_name: 'Salah Uddin',
      room_name: 'Master Bedroom',
      due_amount: 1500,
      due_date: '10 Aug 2026',
      status: 'Partial' as const,
    },
    {
      id: 'mem-8',
      member_code: 'EH-008',
      full_name: 'Nayeem',
      room_name: 'Without Door Room',
      due_amount: 2000,
      due_date: '10 Aug 2026',
      status: 'Due' as const,
    },
  ];

  let members_needing_attention = defaultAttentionList;

  // Recent 5 completed payments
  const recent_payments = payments.slice(0, 5);

  // Monthly trend Aug to Dec 2026
  const monthNames = [
    { key: '2026-08', label: 'Aug 2026' },
    { key: '2026-09', label: 'Sep 2026' },
    { key: '2026-10', label: 'Oct 2026' },
    { key: '2026-11', label: 'Nov 2026' },
    { key: '2026-12', label: 'Dec 2026' },
  ];

  const monthly_payment_trend = monthNames.map((m) => {
    if (m.key === selectedMonth) {
      return {
        month: m.key,
        month_label: m.label,
        payable: monthly_payable,
        paid: total_collected,
        due: total_due,
      };
    }
    return {
      month: m.key,
      month_label: m.label,
      payable: monthly_payable,
      paid: m.key < selectedMonth ? monthly_payable : 0,
      due: m.key < selectedMonth ? 0 : monthly_payable,
    };
  });

  const [yearNum, monthNum] = selectedMonth.split('-').map(Number);
  const monthDate = new Date(yearNum || 2026, (monthNum || 8) - 1, 1);
  const monthLabel = !isNaN(monthDate.getTime())
    ? monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'August 2026';

  return {
    selected_month: selectedMonth,
    selected_month_label: monthLabel,
    is_upcoming,
    upcoming_unlock_date,
    active_member_count,
    room_count,
    available_seat_count,
    monthly_payable,
    total_collected,
    total_due,
    collection_percentage,
    paid_member_count: 5,
    partial_member_count: 1,
    due_member_count: 3,
    overdue_member_count: 1,
    pending_joining_charge_count,
    pending_joining_charge_total,
    recent_payments,
    members_needing_attention,
    monthly_payment_trend,
  };
};

// Automatically run seed at app startup to ensure 9 members & 4 rooms exist instantly
seedDatabase();
