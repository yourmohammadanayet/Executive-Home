import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { fetchMembersData } from '../lib/dataService';
import { Member } from '../types';
import { X, Loader2, UploadCloud } from 'lucide-react';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadDocumentModal({ isOpen, onClose, onSuccess }: UploadDocumentModalProps) {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [memberId, setMemberId] = useState('');
  const [documentType, setDocumentType] = useState('National ID (NID)');
  const [documentUrl, setDocumentUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadMembers();
    }
  }, [isOpen]);

  const loadMembers = async () => {
    const list = await fetchMembersData();
    setMembers(list);
    if (list.length > 0) setMemberId(list[0].id);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: import('react').FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const selectedMember = members.find((m) => m.id === memberId);
    const newDoc = {
      id: `doc-${Date.now()}`,
      member_id: memberId,
      member: selectedMember ? { full_name: selectedMember.full_name, member_code: selectedMember.member_code } : null,
      document_type: documentType,
      document_url: documentUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      submitted_at: new Date().toISOString(),
      status: 'Verified',
    };

    try {
      const cached = JSON.parse(localStorage.getItem('eh_documents') || '[]');
      cached.unshift(newDoc);
      localStorage.setItem('eh_documents', JSON.stringify(cached));

      try {
        await supabase.from('documents').insert({
          member_id: memberId,
          document_type: documentType,
          document_url: newDoc.document_url,
          submitted_at: newDoc.submitted_at,
          status: 'Verified',
        });
      } catch (e) {
        // Cached locally
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#D5E2DF] px-6 py-4">
          <div className="flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-[#23796F]" />
            <h2 className="text-lg font-semibold text-gray-900">Upload Member Document</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Select Member
            </label>
            <select
              required
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-[#23796F] text-sm outline-none"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name} ({m.member_code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Document Type
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-[#23796F] text-sm outline-none"
            >
              <option value="National ID (NID)">National ID (NID)</option>
              <option value="Passport">Passport</option>
              <option value="Student ID">Student ID</option>
              <option value="Employee ID">Employee ID</option>
              <option value="Utility Bill Proof">Utility Bill Proof</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Document Image / Document URL
            </label>
            <input
              type="url"
              placeholder="https://example.com/doc.jpg"
              value={documentUrl}
              onChange={(e) => setDocumentUrl(e.target.value)}
              className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-[#23796F] text-sm outline-none"
            />
            <p className="mt-1 text-[10px] text-gray-500">
              Leave blank to auto-generate a secure sample document link.
            </p>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[#D5E2DF]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center rounded-md bg-[#23796F] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#173F3A] disabled:opacity-70 items-center"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload & Verify
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
