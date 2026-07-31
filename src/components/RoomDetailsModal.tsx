import { useState, useEffect } from 'react';
import { Room, Member } from '../types';
import { 
  X, DoorClosed, Users, Phone, Mail, Briefcase, 
  ChevronRight, UserPlus, ShieldCheck, CheckCircle2 
} from 'lucide-react';
import { fetchMembersData } from '../lib/dataService';
import MemberDetailModal from './MemberDetailModal';

interface RoomDetailsModalProps {
  isOpen: boolean;
  room: Room | null;
  onClose: () => void;
  onOpenAddMember?: () => void;
}

export default function RoomDetailsModal({ 
  isOpen, 
  room, 
  onClose,
  onOpenAddMember
}: RoomDetailsModalProps) {
  const [occupants, setOccupants] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  useEffect(() => {
    if (isOpen && room) {
      loadOccupants();
    }
  }, [isOpen, room]);

  const loadOccupants = async () => {
    if (!room) return;
    setLoading(true);
    try {
      const members = await fetchMembersData();
      const inRoom = members.filter(
        m => m.room_id === room.id || 
             m.room?.name?.toLowerCase() === room.name.toLowerCase() ||
             (room.name.includes('Attached') && m.room_id === 'room-amb') ||
             (room.name === 'Master Bedroom' && m.room_id === 'room-mb') ||
             (room.name === 'Single Room' && m.room_id === 'room-sr') ||
             (room.name === 'Without Door Room' && m.room_id === 'room-wdr')
      );
      setOccupants(inRoom);
    } catch (err) {
      console.error('Error fetching room occupants:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !room) return null;

  const vacantSeats = Math.max(0, room.capacity - occupants.length);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const statusColors = {
    'Occupied': 'bg-gray-100 dark:bg-dark-raised text-gray-800 dark:text-dark-text-primary border-gray-300 dark:border-dark-border-strong',
    'Partially Occupied': 'bg-blue-50 text-blue-800 border-blue-200',
    'Available': 'bg-green-50 text-green-800 border-green-200',
    'Maintenance': 'bg-red-50 dark:bg-dark-red/10 text-red-800 border-red-200 dark:border-red-800',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-dark-surface shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col border border-teal-100">
        
        {/* ROOM HEADER */}
        <div className="bg-gradient-to-r from-[#173F3A] to-[#23796F] text-white p-5 sm:p-6 shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-teal-100 hover:text-white hover:bg-white dark:bg-dark-surface/10 rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-white dark:bg-dark-surface/10 backdrop-blur border border-white/20 flex items-center justify-center shrink-0">
              <DoorClosed className="h-6 w-6 text-teal-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 font-bold text-[10px] uppercase rounded-md">
                  {room.room_code || 'ROOM'}
                </span>
                <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md ${statusColors[room.status] || 'bg-white dark:bg-dark-surface/20 text-white'}`}>
                  {room.status}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mt-1">{room.name}</h2>
              <p className="text-xs text-teal-100/90 font-medium">
                Capacity: {room.capacity} Person(s) • Currently Occupied: {occupants.length} Resident(s)
              </p>
            </div>
          </div>
        </div>

        {/* ROOM OCCUPANTS CONTENT */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-[#F5F8F7] dark:bg-dark-canvas">
          
          {/* STATS OVERVIEW */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="bg-white dark:bg-dark-surface p-3.5 rounded-xl border border-[#D5E2DF] dark:border-dark-border shadow-sm">
              <p className="text-gray-500 dark:text-dark-text-secondary font-semibold">Total Seats</p>
              <p className="text-lg font-extrabold text-[#173F3A] dark:text-dark-text-primary mt-0.5">{room.capacity} Beds</p>
            </div>
            <div className="bg-white dark:bg-dark-surface p-3.5 rounded-xl border border-[#D5E2DF] dark:border-dark-border shadow-sm">
              <p className="text-gray-500 dark:text-dark-text-secondary font-semibold">Current Occupants</p>
              <p className="text-lg font-extrabold text-teal-700 mt-0.5">{occupants.length} Resident(s)</p>
            </div>
            <div className="bg-white dark:bg-dark-surface p-3.5 rounded-xl border border-[#D5E2DF] dark:border-dark-border shadow-sm">
              <p className="text-gray-500 dark:text-dark-text-secondary font-semibold">Available Seats</p>
              <p className={`text-lg font-extrabold mt-0.5 ${vacantSeats > 0 ? 'text-green-600' : 'text-gray-400 dark:text-dark-text-muted'}`}>
                {vacantSeats} Vacant
              </p>
            </div>
          </div>

          {/* OCCUPANTS LIST */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#173F3A] dark:text-dark-text-primary flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#23796F] dark:text-dark-teal" /> Resident Occupants Details ({occupants.length})
              </h3>
              {vacantSeats > 0 && onOpenAddMember && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAddMember();
                  }}
                  className="px-3 py-1 bg-[#23796F] text-white hover:bg-[#173F3A] text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Assign New Member
                </button>
              )}
            </div>

            {loading ? (
              <div className="py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#23796F] dark:border-emerald-500"></div>
              </div>
            ) : occupants.length === 0 ? (
              <div className="bg-white dark:bg-dark-surface p-8 rounded-xl border border-[#D5E2DF] dark:border-dark-border text-center space-y-2">
                <p className="text-sm font-bold text-gray-700 dark:text-dark-text-secondary">No occupants currently assigned to {room.name}.</p>
                <p className="text-xs text-gray-500 dark:text-dark-text-secondary">This room has {room.capacity} vacant seats ready for new member onboarding.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {occupants.map((member, index) => (
                  <div
                    key={member.id}
                    className="bg-white dark:bg-dark-surface p-4 rounded-xl border border-[#D5E2DF] dark:border-dark-border hover:border-[#23796F] dark:border-emerald-500 shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Member Avatar */}
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#173F3A] to-[#23796F] text-white flex items-center justify-center font-black text-sm shrink-0 shadow">
                        {getInitials(member.full_name)}
                      </div>

                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.2 bg-teal-50 dark:bg-dark-teal/10 text-teal-800 font-bold text-[10px] rounded border border-teal-200">
                            {member.member_code}
                          </span>
                          <span className="px-2 py-0.2 bg-green-50 text-green-700 font-bold text-[10px] rounded">
                            Bed #{index + 1}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#173F3A] dark:text-dark-text-primary truncate group-hover:text-[#23796F] dark:hover:text-dark-teal dark:text-dark-teal">
                          {member.full_name}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-dark-text-secondary flex-wrap">
                          <span className="flex items-center gap-1 font-medium text-gray-700 dark:text-dark-text-secondary">
                            <Briefcase className="w-3 h-3 text-[#23796F] dark:text-dark-teal" />
                            {member.profession || 'Corporate Professional'}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-semibold text-[#173F3A] dark:text-dark-text-primary">
                            ৳{member.base_monthly_rent?.toLocaleString()}/mo
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedMember(member)}
                      className="w-full sm:w-auto px-4 py-2 bg-[#F5F8F7] dark:bg-dark-canvas hover:bg-[#23796F] text-[#173F3A] dark:text-dark-text-primary hover:text-white border border-[#D5E2DF] dark:border-dark-border hover:border-transparent text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#23796F] dark:text-dark-teal group-hover:text-white" />
                      View Person Details & Docs
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* FOOTER */}
        <div className="bg-white dark:bg-dark-surface border-t border-[#D5E2DF] dark:border-dark-border p-4 shrink-0 flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-dark-text-secondary">
            Executive Home • {room.name} Management
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:text-dark-text-primary text-xs font-bold rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
          >
            Close
          </button>
        </div>

      </div>

      {/* MEMBER DETAIL MODAL SUB-VIEW */}
      {selectedMember && (
        <MemberDetailModal
          isOpen={!!selectedMember}
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onMemberSelect={(m) => setSelectedMember(m)}
        />
      )}
    </div>
  );
}
