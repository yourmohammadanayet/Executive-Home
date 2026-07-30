import { useEffect, useState } from 'react';
import { fetchMembersData } from '../lib/dataService';
import { Member } from '../types';
import { Plus, Search, Edit3, Eye, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';
import AddMemberModal from '../components/AddMemberModal';
import EditMemberModal from '../components/EditMemberModal';
import MemberDetailModal from '../components/MemberDetailModal';
import { useAuth } from '../context/AuthContext';

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [viewingMember, setViewingMember] = useState<Member | null>(null);
  const { isAdmin, isMember } = useAuth();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const data = await fetchMembersData();
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.member_code?.toLowerCase().includes(search.toLowerCase()) ||
      m.phone?.includes(search) ||
      m.email?.toLowerCase().includes(search.toLowerCase()) ||
      m.room?.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.profession?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors = {
    Active: 'bg-green-50 text-green-700 ring-green-600/20',
    Notice: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
    Left: 'bg-gray-50 text-gray-700 ring-gray-600/20',
    Suspended: 'bg-red-50 text-red-700 ring-red-600/20',
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F8F7]">
      {isAdmin && (
        <header className="h-14 shrink-0 flex items-center justify-end px-4 sm:px-8 bg-white border-b border-[#D5E2DF]">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-[#23796F] text-white text-xs font-bold rounded-lg hover:bg-[#173F3A] transition-colors uppercase tracking-widest shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Member
          </button>
        </header>
      )}

      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchMembers}
      />

      <EditMemberModal
        isOpen={editingMember !== null}
        member={editingMember}
        onClose={() => setEditingMember(null)}
        onSuccess={fetchMembers}
      />

      <MemberDetailModal
        isOpen={viewingMember !== null}
        member={viewingMember}
        onClose={() => setViewingMember(null)}
        onEdit={(m) => setEditingMember(m)}
      />

      <div className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-xl border border-[#D5E2DF] shadow-sm gap-4">
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
              className="block w-full rounded-md border-0 py-2 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#23796F] sm:text-sm sm:leading-6 outline-none"
              placeholder="Search members by code, name, profession, room..."
            />
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Showing <span className="font-bold text-[#173F3A]">{filteredMembers.length}</span> Members
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#D5E2DF] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F5F8F7] text-[11px] uppercase text-gray-600 border-b border-[#D5E2DF]">
                  <th scope="col" className="px-4 py-3 font-bold">Code</th>
                  <th scope="col" className="px-4 py-3 font-bold">Member Name & Contact</th>
                  <th scope="col" className="px-4 py-3 font-bold">Room</th>
                  <th scope="col" className="px-3 py-3 font-bold text-right">Base Rent</th>
                  <th scope="col" className="px-3 py-3 font-bold text-right">JC Due</th>
                  <th scope="col" className="px-3 py-3 font-bold text-center">JC Status</th>
                  <th scope="col" className="px-3 py-3 font-bold text-center">Status</th>
                  <th scope="col" className="px-4 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-[#D5E2DF]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#23796F]"></div>
                    </td>
                  </tr>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-sm text-gray-500">
                      No members found matching search query.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => {
                    const jc = member.joining_charge;
                    const joiningDue = jc?.due_amount ?? 1500;
                    const jcStatus = jc?.status || (joiningDue === 0 ? 'Paid' : 'Pending');

                    return (
                      <tr 
                        key={member.id} 
                        className="hover:bg-teal-50/40 transition-colors cursor-pointer group"
                        onClick={() => setViewingMember(member)}
                      >
                        <td className="px-4 py-3 font-bold text-[#23796F] whitespace-nowrap">
                          {member.member_code}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="h-8 w-8 flex-shrink-0">
                              {member.photo_url ? (
                                <img className="h-8 w-8 rounded-full bg-gray-100 object-cover" src={member.photo_url} alt="" />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-[#173F3A] text-white flex items-center justify-center font-bold text-xs">
                                  {member.full_name?.charAt(0) || 'M'}
                                </div>
                              )}
                            </div>
                            <div className="ml-3">
                              <div className="font-bold text-[#173F3A] group-hover:text-[#23796F]">
                                {member.full_name}
                              </div>
                              <div className="text-[10px] text-gray-500 font-medium">
                                {member.profession || 'Resident'} {member.phone ? `• ${member.phone}` : ''}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700 font-medium whitespace-nowrap">
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold rounded">
                            {member.room?.name || 'Unassigned'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right font-bold text-[#173F3A]">
                          ৳{member.base_monthly_rent.toLocaleString()}
                        </td>
                        <td className="px-3 py-3 text-right text-amber-700 font-semibold">
                          ৳{joiningDue.toLocaleString()}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span
                            className={clsx(
                              'inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase',
                              jcStatus === 'Paid'
                                ? 'bg-green-100 text-green-800'
                                : jcStatus === 'Waived'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            )}
                          >
                            {jcStatus}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span
                            className={clsx(
                              'inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase',
                              statusColors[member.member_status]
                            )}
                          >
                            {member.member_status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setViewingMember(member)}
                              className="inline-flex items-center gap-1 text-[#173F3A] hover:text-white font-bold text-xs bg-[#D5E2DF] hover:bg-[#173F3A] px-2.5 py-1 rounded transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" /> Details
                            </button>
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => setEditingMember(member)}
                                className="inline-flex items-center gap-1 text-[#23796F] hover:text-[#173F3A] font-bold text-xs bg-[#F5F8F7] hover:bg-[#D5E2DF] px-2.5 py-1 rounded transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" /> Edit
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
      </div>
    </div>
  );
}


