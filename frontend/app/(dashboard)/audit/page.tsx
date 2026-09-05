'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FileSpreadsheet, RefreshCw, ShieldCheck, ShieldAlert, Search, ChevronDown } from 'lucide-react';
import { api } from '@/lib/api';
import { AuditEvent } from '@/lib/types';
import { formatINR, formatTimeAgo } from '@/lib/format';

const EVENT_TYPES = [
  '', 'DECISION_CREATED', 'ACTION_BLOCKED', 'EXECUTION_SUCCEEDED',
  'EXECUTION_FAILED', 'ESCALATION_CREATED', 'SUPPRESSION_CREATED',
];

const EVENT_META: Record<string, { color: string; bg: string }> = {
  DECISION_CREATED:   { color: 'text-primary-300', bg: 'bg-primary-muted border-primary-500/30' },
  ACTION_BLOCKED:     { color: 'text-risk-300',    bg: 'bg-risk-muted border-risk-500/30' },
  EXECUTION_SUCCEEDED:{ color: 'text-success-300', bg: 'bg-success-muted border-success-500/30' },
  EXECUTION_FAILED:   { color: 'text-risk-300',    bg: 'bg-risk-muted border-risk-500/30' },
  ESCALATION_CREATED: { color: 'text-warning-300', bg: 'bg-warning-muted border-warning-500/30' },
  SUPPRESSION_CREATED:{ color: 'text-text-muted',  bg: 'bg-surface border-border-subtle' },
};

export default function AuditPage() {
  const [auditLog, setAuditLog] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('');

  const loadAuditLog = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.getAuditLog(1000, undefined, eventTypeFilter || undefined);
      setAuditLog(res.entries);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setErrorMsg(`Failed to load audit log: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [eventTypeFilter]);

  useEffect(() => {
    loadAuditLog();
  }, [loadAuditLog]);

  const filtered = auditLog.filter((evt) =>
    search === '' ||
    evt.event_id.toLowerCase().includes(search.toLowerCase()) ||
    evt.transaction_id.toLowerCase().includes(search.toLowerCase()) ||
    evt.action.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-sm bg-surface border border-border-strong flex items-center justify-center text-text-secondary">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-text-primary tracking-tight">Audit Trail</h2>
            <p className="text-xs text-text-muted mt-0.5">Verifiable, immutable-style record of all decisions, policy gates & outcomes</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs font-mono text-text-muted">{filtered.length} entries</span>
          <button
            id="btn-refresh-audit"
            onClick={loadAuditLog}
            disabled={loading}
            className="p-2 rounded-sm bg-panel border border-border-strong text-text-muted hover:text-text-primary transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded bg-risk-muted border border-risk-500/40 text-risk-300 text-xs font-mono">{errorMsg}</div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
          <input
            id="input-audit-search"
            type="text"
            placeholder="Search by Event ID, Transaction ID, Action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-panel border border-border-strong rounded-sm text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-500/60 font-mono"
          />
        </div>
        <div className="relative">
          <select
            id="select-event-type"
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 bg-panel border border-border-strong rounded-sm text-xs text-text-secondary focus:outline-none focus:border-primary-500/60 font-mono"
          >
            <option value="">All Event Types</option>
            {EVENT_TYPES.slice(1).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-panel border border-border-subtle rounded-md shadow-panel overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border-divider text-[11px] font-mono text-text-muted uppercase">
              <th className="py-3 px-4">Event ID / Timestamp</th>
              <th className="py-3 px-4">Transaction</th>
              <th className="py-3 px-4">Event Type</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Policy Gate</th>
              <th className="py-3 px-4">Model / Provider</th>
              <th className="py-3 px-4 text-right">Outcome</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-divider font-mono">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-text-muted italic font-sans">Loading audit log...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center font-sans">
                  <FileSpreadsheet className="w-8 h-8 text-text-muted mx-auto mb-2" />
                  <p className="text-text-muted text-xs">
                    {auditLog.length === 0
                      ? 'No audit events recorded yet. Run a scan and batch recovery to populate the audit trail.'
                      : 'No events match your search.'}
                  </p>
                </td>
              </tr>
            ) : (
              filtered.slice(0, 500).map((evt) => {
                const meta = EVENT_META[evt.event_type] || { color: 'text-text-secondary', bg: 'bg-surface border-border-subtle' };
                return (
                  <tr key={evt.event_id} className="hover:bg-panel-hover transition">
                    <td className="py-3 px-4">
                      <div className="text-text-primary font-medium truncate max-w-[120px]" title={evt.event_id}>{evt.event_id}</div>
                      <div className="text-[11px] text-text-muted">{formatTimeAgo(evt.timestamp)}</div>
                    </td>
                    <td className="py-3 px-4 text-primary-300 font-semibold">{evt.transaction_id}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded border ${meta.bg} ${meta.color}`}>
                        {evt.event_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 capitalize font-sans text-text-primary">{evt.action}</td>
                    <td className="py-3 px-4 font-sans">
                      {evt.policy_result?.allowed ? (
                        <span className="text-success-300 flex items-center space-x-1 text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                          <span>Allowed</span>
                        </span>
                      ) : (
                        <span className="text-risk-300 flex items-center space-x-1 text-[11px]" title={evt.policy_result?.reason}>
                          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate max-w-[120px]">{evt.policy_result?.reason || 'Blocked'}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-text-muted">
                      <div>{evt.model_version}</div>
                      <div className="uppercase">{evt.provider}</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {evt.outcome?.recovered_amount ? (
                        <span className="font-bold text-success-300">+{formatINR(evt.outcome.recovered_amount)}</span>
                      ) : (
                        <span className="text-text-muted text-[11px] uppercase">{evt.outcome?.status || 'recorded'}</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {filtered.length > 500 && (
          <div className="px-4 py-2 border-t border-border-divider text-xs text-text-muted font-mono">
            Showing first 500 of {filtered.length} entries.
          </div>
        )}
      </div>
    </div>
  );
}
