'use client';

import React from 'react';
import { FileSpreadsheet, ShieldCheck, ShieldAlert } from 'lucide-react';
import { formatINR, formatTimeAgo } from '@/lib/format';
import { AuditEvent } from '@/lib/types';

interface AuditLedgerTableProps {
  auditLog: AuditEvent[];
}

export const AuditLedgerTable: React.FC<AuditLedgerTableProps> = ({ auditLog }) => {
  return (
    <div className="bg-panel border border-border-subtle rounded-md p-4 shadow-panel">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border-divider">
        <div className="flex items-center space-x-2.5">
          <div className="w-6 h-6 rounded bg-surface border border-border-strong flex items-center justify-center text-text-secondary">
            <FileSpreadsheet className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-text-primary text-sm font-semibold tracking-tight">Audit Trail Ledger</h3>
            <p className="text-text-muted text-xs">Verifiable, immutable-style record of all decisions, policy gates, & outcomes</p>
          </div>
        </div>
        <span className="text-xs font-mono text-text-muted bg-surface px-2 py-0.5 rounded border border-border-subtle">
          Total Logged: {auditLog.length} events
        </span>
      </div>

      {/* Ledger Table */}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-divider text-[11px] font-mono text-text-muted uppercase">
              <th className="py-2.5 px-3">Event ID & Timestamp</th>
              <th className="py-2.5 px-3">Transaction</th>
              <th className="py-2.5 px-3">Event Type</th>
              <th className="py-2.5 px-3 font-center">Action</th>
              <th className="py-2.5 px-3">Policy Gate</th>
              <th className="py-2.5 px-3 text-right">Outcome / Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-divider text-xs font-mono">
            {auditLog.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-text-muted italic font-sans">
                  No audit log entries recorded yet.
                </td>
              </tr>
            ) : (
              auditLog.map((evt) => (
                <tr key={evt.event_id} className="hover:bg-panel-hover transition">
                  {/* Event ID & Time */}
                  <td className="py-3 px-3">
                    <div className="text-text-primary font-medium">{evt.event_id}</div>
                    <div className="text-[11px] text-text-muted font-sans">{formatTimeAgo(evt.timestamp)}</div>
                  </td>

                  {/* Transaction */}
                  <td className="py-3 px-3 text-primary-300 font-semibold">{evt.transaction_id}</td>

                  {/* Event Type */}
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${
                        evt.event_type === 'ACTION_BLOCKED'
                          ? 'bg-risk-muted text-risk-300 border border-risk-500/30'
                          : evt.event_type === 'EXECUTION_SUCCEEDED'
                          ? 'bg-success-muted text-success-300 border border-success-500/30'
                          : 'bg-surface text-text-secondary border border-border-subtle'
                      }`}
                    >
                      {evt.event_type}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-3 capitalize font-sans text-text-primary">{evt.action}</td>

                  {/* Policy Gate */}
                  <td className="py-3 px-3 font-sans">
                    {evt.policy_result?.allowed ? (
                      <span className="text-success-300 flex items-center space-x-1 text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                        <span>Allowed</span>
                      </span>
                    ) : (
                      <span className="text-risk-300 flex items-center space-x-1 text-[11px]" title={evt.policy_result?.reason}>
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate max-w-[140px]">{evt.policy_result?.reason || 'Blocked'}</span>
                      </span>
                    )}
                  </td>

                  {/* Outcome Amount */}
                  <td className="py-3 px-3 text-right">
                    {evt.outcome?.recovered_amount ? (
                      <span className="font-bold text-success-300">+{formatINR(evt.outcome.recovered_amount)}</span>
                    ) : (
                      <span className="text-text-muted text-[11px] uppercase">{evt.outcome?.status || 'recorded'}</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
