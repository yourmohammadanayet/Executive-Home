import { useState } from 'react';
import { FileBarChart2 } from 'lucide-react';
import ReportViewerModal from '../components/ReportViewerModal';

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const reports = [
    { title: 'Monthly Rent Report', desc: 'Summary of collected and due rent by month.' },
    { title: 'Member Payment Statement', desc: 'Individual ledger for each member.' },
    { title: 'Room-wise Rent Report', desc: 'Financial performance segmented by room.' },
    { title: 'Paid, Partial, Due Report', desc: 'Current snapshot of who owes what.' },
    { title: 'One-time Joining Charge Report', desc: 'Collection status of joining charges.' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#F5F8F7] dark:bg-dark-canvas">
      <ReportViewerModal
        isOpen={selectedReport !== null}
        onClose={() => setSelectedReport(null)}
        reportTitle={selectedReport || ''}
      />

      <div className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div
              key={report.title}
              onClick={() => setSelectedReport(report.title)}
              className="bg-white dark:bg-dark-surface rounded-xl border border-[#D5E2DF] dark:border-dark-border p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
            >
              <div className="w-10 h-10 bg-[#F5F8F7] dark:bg-dark-canvas text-[#23796F] dark:text-dark-teal rounded flex items-center justify-center mb-4">
                <FileBarChart2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#173F3A] dark:text-dark-text-primary mb-2">{report.title}</h3>
              <p className="text-xs text-gray-500 dark:text-dark-text-secondary mb-6 flex-1">{report.desc}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedReport(report.title);
                }}
                className="text-left text-[#23796F] dark:text-dark-teal text-[10px] font-bold uppercase tracking-widest hover:text-[#173F3A] dark:hover:text-dark-text-primary dark:text-dark-text-primary transition-colors mt-auto"
              >
                Generate &rarr;
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
