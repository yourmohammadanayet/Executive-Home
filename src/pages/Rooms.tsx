import { useEffect, useState } from 'react';
import { fetchRoomsData, fetchMembersData } from '../lib/dataService';
import { Room, Member } from '../types';
import { DoorClosed, Search, Users, ChevronRight, Eye } from 'lucide-react';
import clsx from 'clsx';
import AddRoomModal from '../components/AddRoomModal';
import RoomDetailsModal from '../components/RoomDetailsModal';
import { useAuth } from '../context/AuthContext';

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsData, membersData] = await Promise.all([
        fetchRoomsData(),
        fetchMembersData()
      ]);
      setRooms(roomsData || []);
      setMembers(membersData || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoomMembers = (room: Room) => {
    return members.filter(
      m => m.room_id === room.id || 
           m.room?.name?.toLowerCase() === room.name.toLowerCase() ||
           (room.name.includes('Attached') && m.room_id === 'room-amb') ||
           (room.name === 'Master Bedroom' && m.room_id === 'room-mb') ||
           (room.name === 'Single Room' && m.room_id === 'room-sr') ||
           (room.name === 'Without Door Room' && m.room_id === 'room-wdr')
    );
  };

  const filteredRooms = rooms.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.type.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors = {
    'Occupied': 'bg-gray-100 text-gray-800 border-gray-300',
    'Partially Occupied': 'bg-blue-50 text-blue-800 border-blue-200',
    'Available': 'bg-green-50 text-green-800 border-green-200',
    'Maintenance': 'bg-red-50 text-red-800 border-red-200',
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F8F7]">
      <header className="h-16 shrink-0 flex items-center justify-between px-4 sm:px-8 bg-white border-b border-[#D5E2DF]">
        <h1 className="text-xl font-semibold text-[#173F3A]">Rooms & Accommodation</h1>
        {isAdmin && (
          <div className="flex space-x-4">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-[#23796F] text-white text-xs font-bold rounded-lg hover:bg-[#173F3A] transition-colors uppercase tracking-widest shadow-sm"
            >
              Add Room
            </button>
          </div>
        )}
      </header>

      <AddRoomModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchData}
      />

      <RoomDetailsModal
        isOpen={!!selectedRoom}
        room={selectedRoom}
        onClose={() => setSelectedRoom(null)}
      />

      <div className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto">
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-[#D5E2DF] shadow-sm">
          <div className="relative w-full max-w-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              name="search"
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-md border-0 py-2 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-[#23796F] sm:text-sm sm:leading-6 outline-none"
              placeholder="Search by room name or type..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading ? (
            <div className="col-span-full py-12 flex justify-center">
              <div className="inline-block animate-spin rounded-full h-7 w-7 border-b-2 border-[#23796F]"></div>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="col-span-full py-10 text-center text-sm text-gray-500">
              No rooms found.
            </div>
          ) : (
            filteredRooms.map((room) => {
              const roomOccupants = getRoomMembers(room);

              return (
                <div 
                  key={room.id} 
                  className="overflow-hidden rounded-xl bg-white shadow-sm border border-[#D5E2DF] flex flex-col hover:shadow-md transition-all group"
                >
                  <div className="p-5 flex-1 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-xl bg-[#F5F8F7] text-[#23796F] flex items-center justify-center border border-[#D5E2DF] shrink-0">
                          <DoorClosed className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#173F3A] group-hover:text-[#23796F] transition-colors">
                            {room.name}
                          </h3>
                          <p className="text-[11px] text-gray-500 font-medium">{room.type}</p>
                        </div>
                      </div>
                      <span className={clsx(
                        'inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border shrink-0',
                        statusColors[room.status] || 'bg-gray-100 text-gray-800'
                      )}>
                        {room.status}
                      </span>
                    </div>

                    {/* OCCUPANTS PREVIEW BOX */}
                    <div className="bg-[#F5F8F7] p-3 rounded-lg border border-[#D5E2DF] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-[#173F3A] flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-[#23796F]" /> Occupants ({roomOccupants.length}/{room.capacity})
                        </span>
                        <span className="text-[10px] text-gray-500 font-semibold">
                          {room.capacity - roomOccupants.length > 0 
                            ? `${room.capacity - roomOccupants.length} Vacant` 
                            : 'Full'}
                        </span>
                      </div>

                      {roomOccupants.length === 0 ? (
                        <p className="text-[11px] text-gray-400 italic">No members currently assigned</p>
                      ) : (
                        <div className="space-y-1">
                          {roomOccupants.slice(0, 3).map((m) => (
                            <div key={m.id} className="text-xs font-semibold text-gray-800 flex items-center justify-between">
                              <span className="truncate">• {m.full_name}</span>
                              <span className="text-[10px] text-teal-800 shrink-0 font-bold">৳{m.base_monthly_rent?.toLocaleString()}</span>
                            </div>
                          ))}
                          {roomOccupants.length > 3 && (
                            <p className="text-[10px] font-bold text-[#23796F]">+{roomOccupants.length - 3} more member(s)...</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* BOTTOM ACTION BUTTON */}
                  <div className="p-3 bg-gray-50 border-t border-[#D5E2DF]">
                    <button
                      type="button"
                      onClick={() => setSelectedRoom(room)}
                      className="w-full py-2 px-3 bg-[#173F3A] hover:bg-[#23796F] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Occupants & Details <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

