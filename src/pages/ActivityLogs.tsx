import React, { useState, useEffect } from 'react';
import { AuditLogEntry } from '../types';
import { getAuditLogs } from '../lib/accessControlService';
import { Clock, Search, ShieldAlert, FileText, User, Filter } from 'lucide-react';

export default function ActivityLogs() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLogs(getAuditLogs());
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      log.actor_name.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.target_user.toLowerCase().includes(q) ||
      log.request_id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Toolbar */}
      <div className="bg-white dark:bg-dark-surface p-4 rounded-xl border border-[#D5E2DF] dark:border-dark-border shadow-2xs flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 dark:text-dark-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, actor, target or request ID..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-dark-canvas/50 dark:bg-dark-surface/50 border border-gray-200 dark:border-dark-border rounded-lg text-xs font-medium text-[#173F3A] dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-[#23796F] dark:focus:ring-dark-teal"
          />
        </div>

        <div className="text-xs text-gray-500 dark:text-dark-text-secondary font-semibold">
          Total Logs: <span className="text-[#173F3A] dark:text-dark-text-primary">{filteredLogs.length}</span>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-dark-surface rounded-xl border border-[#D5E2DF] dark:border-dark-border shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-[#D5E2DF] dark:border-dark-border text-[11px] font-bold text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target User / Entity</th>
                <th className="py-3 px-4">Changes</th>
                <th className="py-3 px-4 text-right">Request ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-divider text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400 dark:text-dark-text-muted font-medium">
                    No activity logs found matching search filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/60 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-gray-600 dark:text-dark-text-secondary whitespace-nowrap">
                      {log.date_time}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-[#173F3A] dark:text-dark-text-primary">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-gray-400 dark:text-dark-text-muted shrink-0" />
                        <div>
                          <div>{log.actor_name}</div>
                          <div className="text-[10px] text-gray-400 dark:text-dark-text-muted font-mono font-normal">{log.actor_email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 bg-teal-50 dark:bg-dark-teal/10 text-[#23796F] dark:text-dark-teal font-bold text-[11px] rounded border border-teal-100">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-gray-700 dark:text-dark-text-secondary">
                      {log.target_user}
                    </td>

                    <td className="py-3.5 px-4 text-gray-600 dark:text-dark-text-secondary text-[11px]">
                      {log.old_value && (
                        <span className="line-through text-gray-400 dark:text-dark-text-muted mr-1.5">{log.old_value}</span>
                      )}
                      {log.new_value && (
                        <span className="font-semibold text-emerald-700">{log.new_value}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-[10px] text-gray-400 dark:text-dark-text-muted">
                      {log.request_id}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
