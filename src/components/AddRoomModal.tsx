import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Loader2, DoorClosed } from 'lucide-react';
import { Room } from '../types';

interface AddRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddRoomModal({ isOpen, onClose, onSuccess }: AddRoomModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState('Double Bed');
  const [capacity, setCapacity] = useState(2);
  const [status, setStatus] = useState<Room['status']>('Available');

  if (!isOpen) return null;

  const handleSubmit = async (e: import('react').FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const newRoom: Room = {
      id: `room-${Date.now()}`,
      room_code: name.toLowerCase().replace(/\s+/g, '_'),
      name,
      type,
      capacity,
      status,
    };

    try {
      const { error: dbError } = await supabase.from('rooms').insert([{
        name,
        type,
        capacity,
        status,
      }]);

      if (dbError) {
        console.warn('Supabase insert room fallback to local cache:', dbError.message);
      }

      // Also update local cache
      const cached = JSON.parse(localStorage.getItem('eh_rooms') || '[]');
      cached.unshift(newRoom);
      localStorage.setItem('eh_rooms', JSON.stringify(cached));

      onSuccess();
      onClose();
      setName('');
      setType('Double Bed');
      setCapacity(2);
      setStatus('Available');
    } catch (err: any) {
      setError(err.message || 'Failed to add room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-xl bg-white dark:bg-dark-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-[#D5E2DF] dark:border-dark-border px-6 py-4">
          <div className="flex items-center gap-2">
            <DoorClosed className="h-5 w-5 text-[#23796F] dark:text-dark-teal" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">Add New Room</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 dark:text-dark-text-muted hover:text-gray-500 dark:text-dark-text-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-dark-red/10 p-3 text-xs text-red-700 border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-dark-text-secondary uppercase tracking-wide">
              Room Name / Number
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Room 103"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 dark:text-dark-text-primary shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-dark-border-strong focus:ring-2 focus:ring-[#23796F] dark:focus:ring-dark-teal text-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-dark-text-secondary uppercase tracking-wide">
              Room Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 dark:text-dark-text-primary shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-dark-border-strong focus:ring-2 focus:ring-[#23796F] dark:focus:ring-dark-teal text-sm outline-none"
            >
              <option value="Single Executive">Single Executive</option>
              <option value="Double Bed">Double Bed</option>
              <option value="Deluxe Triple">Deluxe Triple</option>
              <option value="Master Suite">Master Suite</option>
              <option value="VIP Single">VIP Single</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-dark-text-secondary uppercase tracking-wide">
              Capacity (Persons)
            </label>
            <input
              type="number"
              required
              min="1"
              max="10"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 dark:text-dark-text-primary shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-dark-border-strong focus:ring-2 focus:ring-[#23796F] dark:focus:ring-dark-teal text-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-dark-text-secondary uppercase tracking-wide">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Room['status'])}
              className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 dark:text-dark-text-primary shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-dark-border-strong focus:ring-2 focus:ring-[#23796F] dark:focus:ring-dark-teal text-sm outline-none"
            >
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Partially Occupied">Partially Occupied</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[#D5E2DF] dark:border-dark-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-white dark:bg-dark-surface px-4 py-2 text-xs font-semibold text-gray-700 dark:text-dark-text-secondary shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-dark-border-strong hover:bg-gray-50 dark:hover:bg-dark-hover dark:bg-dark-canvas/50 dark:hover:bg-dark-hover/50 dark:bg-dark-surface/50 outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center rounded-md bg-[#23796F] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#173F3A] disabled:opacity-70 items-center outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
