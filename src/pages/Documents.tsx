import { useEffect, useState } from 'react';
import { fetchDocumentsData } from '../lib/dataService';
import { Search, UploadCloud } from 'lucide-react';
import { safeFormatDate } from '../lib/dateUtils';
import clsx from 'clsx';
import UploadDocumentModal from '../components/UploadDocumentModal';

export default function Documents() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await fetchDocumentsData();
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    'Verified': 'bg-green-50 text-green-700 ring-green-600/20',
    'Submitted': 'bg-blue-50 text-blue-700 ring-blue-600/20',
    'Pending': 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
    'Rejected': 'bg-red-50 dark:bg-dark-red/10 text-red-700 ring-red-600/20',
  };

  const filteredDocs = documents.filter(d => 
    d.member?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.document_type?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#F5F8F7] dark:bg-dark-canvas">
      <header className="h-14 shrink-0 flex items-center justify-end px-4 sm:px-8 bg-white dark:bg-dark-surface border-b border-[#D5E2DF] dark:border-dark-border">
        <button
          onClick={() => setIsUploadOpen(true)}
          className="px-4 py-2 bg-[#23796F] text-white text-xs font-bold rounded-lg hover:bg-[#173F3A] transition-colors uppercase tracking-widest shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
        >
          Upload Document
        </button>
      </header>

      <UploadDocumentModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={fetchDocuments}
      />

      <div className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto">
        <div className="flex items-center justify-between bg-white dark:bg-dark-surface p-4 rounded-xl border border-[#D5E2DF] dark:border-dark-border shadow-sm">
          <div className="relative w-full max-w-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400 dark:text-dark-text-muted" aria-hidden="true" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-md border-0 py-2 pl-10 text-gray-900 dark:text-dark-text-primary shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-dark-border-strong focus:ring-2 focus:ring-inset focus:ring-[#23796F] dark:focus:ring-dark-teal sm:text-sm sm:leading-6 outline-none"
              placeholder="Search documents..."
            />
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface rounded-xl border border-[#D5E2DF] dark:border-dark-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-dark-canvas/50 dark:bg-dark-surface/50 text-[11px] uppercase text-gray-500 dark:text-dark-text-secondary border-b border-[#D5E2DF] dark:border-dark-border">
                  <th scope="col" className="px-6 py-3 font-semibold">Member</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Document Type</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Submitted Date</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                  <th scope="col" className="relative px-4 py-3 sm:pr-6"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-[#D5E2DF] dark:divide-dark-border">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#23796F] dark:border-emerald-500"></div>
                    </td>
                  </tr>
                ) : filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-sm text-gray-500 dark:text-dark-text-secondary">
                      No documents found.
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50/50 outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas">
                      <td className="px-6 py-3">
                        <div className="font-medium text-[#173F3A] dark:text-dark-text-primary text-xs">{doc.member?.full_name}</div>
                        <div className="text-[10px] text-gray-500 dark:text-dark-text-secondary">{doc.member?.member_code}</div>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-[#173F3A] dark:text-dark-text-primary uppercase tracking-wide">
                        {doc.document_type}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-dark-text-secondary">
                        {safeFormatDate(doc.submitted_at, 'MMM dd, yyyy')}
                      </td>
                      <td className="px-4 py-3 text-[10px]">
                        <span className={clsx(
                          'inline-block px-2 py-0.5 rounded font-bold uppercase',
                          statusColors[doc.status as keyof typeof statusColors] || statusColors['Pending']
                        )}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="relative px-4 py-3 text-right text-[10px] font-bold uppercase tracking-widest sm:pr-6">
                        <button className="text-[#23796F] dark:text-dark-teal hover:text-[#173F3A] dark:hover:text-dark-text-primary dark:text-dark-text-primary transition-colors">
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
