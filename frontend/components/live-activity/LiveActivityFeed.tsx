'use client';

import React from 'react';
import { Activity, CheckCircle2, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';
import { formatINR, formatTimeAgo } from '@/lib/format';
import { AuditEvent } from '@/lib/types';

interface LiveActivityFeedProps {
  events: AuditEvent[];
}

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({ events }) => {
  return (
    <div className="bg-panel border border-border-subtle rounded-md p-4 shadow-panel">
      <div className="flex items-center justify-between pb-3 border-b border-border-divider">
        <div className="flex items-center space-x-2.5">
          <div className="w-6 h-6 rounded bg-primary-muted border border-primary-500/30 flex items-center justify-center text-primary-300">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-text-primary text-sm font-semibold tracking-tight">Live Recovery Activity</h3>
            <p className="text-text-muted text-xs">Real-time operational action & recovery feed</p>
          </div>
        </div>
        <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
      </div>

      {/* Activity Feed List */}
      <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {events.length === 0 ? (
          <div className="py-6 text-center text-text-muted text-xs italic font-sans">
            No live activity recorded yet. Execute an intervention to populate feed.
          </div>
        ) : (
          events.map((evt) => {
            const isSuccess = evt.outcome?.recovered || evt.event_type === 'EXECUTION_SUCCEEDED';
            const isBlocked = evt.event_type === 'ACTION_BLOCKED';
            const isEscalated = evt.action === 'escalate' || evt.event_type === 'ESCALATION_CREATED';

            return (
              <div
                key={evt.event_id}
                className="p-2.5 rounded bg-surface border border-border-divider flex items-center justify-between text-xs hover:border-border-strong transition"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      isSuccess
                        ? 'bg-success-muted text-success-300 border border-success-500/30'
                        : isBlocked
                        ? 'bg-risk-muted text-risk-300 border border-risk-500/30'
                        : isEscalated
                        ? 'bg-warning-muted text-warning-300 border border-warning-500/30'
                        : 'bg-primary-muted text-primary-300 border border-primary-500/30'
                    }`}
                  >
                    {isSuccess ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : isBlocked ? (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 font-mono">
                      <span className="text-text-primary font-medium">{evt.transaction_id}</span>
                      <span className="text-[10px] uppercase font-sans font-semibold px-1.5 py-0.2 rounded bg-panel border border-border-subtle text-text-secondary">
                        {evt.action}
                      </span>
                    </div>
                    <div className="text-[11px] text-text-muted mt-0.5 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-text-muted" />
                      <span>{formatTimeAgo(evt.timestamp)}</span>
                    </div>
                  </div>
                </div>

                {evt.outcome?.recovered_amount ? (
                  <div className="text-right font-mono font-bold text-success-300">
                    +{formatINR(evt.outcome.recovered_amount)}
                  </div>
                ) : (
                  <div className="text-right text-[11px] font-mono text-text-muted uppercase">
                    {evt.event_type.replace('_', ' ')}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
