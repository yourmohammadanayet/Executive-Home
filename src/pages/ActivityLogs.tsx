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
      {/* Header */}
      <div className="pb-2 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-[#173F3A]">Activity Logs</h1>
        <p className="text-sm text-gray-500 mt-1">Audit history of administrative actions, user access changes, and system events.</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-[#D5E2DF] shadow-2xs flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, actor, target or request ID..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-[#173F3A] focus:outline-none focus:ring-2 focus:ring-[#23796F]"
          />
        </div>

        <div className="text-xs text-gray-500 font-semibold">
          Total Logs: <span className="text-[#173F3A]">{filteredLogs.length}</span>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-[#D5E2DF] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-[#D5E2DF] text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target User / Entity</th>
                <th className="py-3 px-4">Changes</th>
                <th className="py-3 px-4 text-right">Request ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400 font-medium">
                    No activity logs found matching search filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-gray-600 whitespace-nowrap">
                      {log.date_time}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-[#173F3A]">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <div>
                          <div>{log.actor_name}</div>
                          <div className="text-[10px] text-gray-400 font-mono font-normal">{log.actor_email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 bg-teal-50 text-[#23796F] font-bold text-[11px] rounded border border-teal-100">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-gray-700">
                      {log.target_user}
                    </td>

                    <td className="py-3.5 px-4 text-gray-600 text-[11px]">
                      {log.old_value && (
                        <span className="line-through text-gray-400 mr-1.5">{log.old_value}</span>
                      )}
                      {log.new_value && (
                        <span className="font-semibold text-emerald-700">{log.new_value}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-[10px] text-gray-400">
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
