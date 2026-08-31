'use client';

import React, { useState } from 'react';
import { Target, ArrowUpRight, ShieldCheck, ShieldAlert, Zap } from 'lucide-react';
import { formatINR, formatPct } from '@/lib/format';
import { Opportunity } from '@/lib/types';
import { api } from '@/lib/api';

interface TopOpportunitiesProps {
  opportunities: Opportunity[];
  onSelectTransaction: (txId: string) => void;
  onRefresh: () => void;
}

export const TopOpportunities: React.FC<TopOpportunitiesProps> = ({
  opportunities,
  onSelectTransaction,
  onRefresh,
}) => {
  const [executingId, setExecutingId] = useState<string | null>(null);

  const handleExecute = async (e: React.MouseEvent, opp: Opportunity) => {
    e.stopPropagation();
    setExecutingId(opp.transaction_id);
    try {
      const idempotencyKey = `ui_exec_${opp.transaction_id}_${Date.now()}`;
      await api.executeIntervention(opp.transaction_id, idempotencyKey);
      onRefresh();
    } catch (err: any) {
      alert(`Execution Error: ${err.message}`);
    } finally {
      setExecutingId(null);
    }
  };

  return (
    <div className="bg-panel border border-border-subtle rounded-md p-4 shadow-panel">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border-divider">
        <div className="flex items-center space-x-2.5">
          <div className="w-6 h-6 rounded bg-primary-muted border border-primary-500/30 flex items-center justify-center text-primary-300">
            <Target className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-text-primary text-sm font-semibold tracking-tight">Top Recovery Opportunities</h3>
            <p className="text-text-muted text-xs">High expected value interventions authorized for execution</p>
          </div>
        </div>
        <span className="text-xs font-mono text-text-muted bg-surface px-2 py-0.5 rounded border border-border-subtle">
          Showing {opportunities.length} opportunities
        </span>
      </div>

      {/* Opportunities Table */}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-divider text-[11px] font-mono text-text-muted uppercase">
              <th className="py-2.5 px-3">Transaction & Customer</th>
              <th className="py-2.5 px-3">Leak Type</th>
              <th className="py-2.5 px-3 text-right">Amount</th>
              <th className="py-2.5 px-3 text-center">P(Recovery)</th>
              <th className="py-2.5 px-3 text-right">Expected Recovery</th>
              <th className="py-2.5 px-3 text-center">Policy Status</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-divider text-xs">
            {opportunities.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-text-muted italic font-sans">
                  No pending opportunities. Run scan & intelligence pass.
                </td>
              </tr>
            ) : (
              opportunities.map((opp) => {
                const isExecuting = executingId === opp.transaction_id;

                return (
                  <tr
                    key={opp.transaction_id}
                    onClick={() => onSelectTransaction(opp.transaction_id)}
                    className="hover:bg-panel-hover transition cursor-pointer group"
                  >
                    {/* Transaction ID & Customer */}
                    <td className="py-3 px-3">
                      <div className="font-mono text-text-primary font-medium flex items-center space-x-1.5">
                        <span>{opp.transaction_id}</span>
                        <ArrowUpRight className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100 transition" />
                      </div>
                      <div className="text-[11px] text-text-muted font-mono">{opp.customer_id}</div>
                    </td>

                    {/* Leak Type */}
                    <td className="py-3 px-3">
                      <span className="capitalize text-text-secondary font-sans">
                        {opp.leak_type.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3 text-right font-mono font-semibold text-text-primary">
                      {formatINR(opp.amount)}
                    </td>

                    {/* Recovery Probability Ring/Pill */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block font-mono text-[11px] font-bold px-2 py-0.5 rounded-pill ${
                          opp.recovery_probability >= 0.7
                            ? 'bg-success-muted text-success-300 border border-success-500/30'
                            : opp.recovery_probability >= 0.4
                            ? 'bg-ai-muted text-ai-300 border border-ai-500/30'
                            : 'bg-risk-muted text-risk-300 border border-risk-500/30'
                        }`}
                      >
                        {formatPct(opp.recovery_probability)}
                      </span>
                    </td>

                    {/* Expected Recovery */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-success-300">
                      {formatINR(opp.expected_recovery)}
                    </td>

                    {/* Policy Status */}
                    <td className="py-3 px-3 text-center">
                      {opp.policy_allowed ? (
                        <span className="inline-flex items-center space-x-1 text-[11px] text-success-300 bg-success-muted/50 px-2 py-0.5 rounded border border-success-500/20">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Allowed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-[11px] text-risk-300 bg-risk-muted/50 px-2 py-0.5 rounded border border-risk-500/20">
                          <ShieldAlert className="w-3 h-3" />
                          <span>Blocked</span>
                        </span>
                      )}
                    </td>

                    {/* Action Button */}
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => handleExecute(e, opp)}
                        disabled={isExecuting}
                        className={`px-3 py-1 rounded-sm text-[11px] font-semibold transition inline-flex items-center space-x-1.5 ${
                          opp.recommended_action === 'retry'
                            ? 'bg-primary-500 hover:bg-primary-600 text-text-primary'
                            : opp.recommended_action === 'payment_link'
                            ? 'bg-ai-700 hover:bg-ai-600 text-text-primary'
                            : opp.recommended_action === 'escalate'
                            ? 'border border-risk-500 text-risk-300 hover:bg-risk-500 hover:text-text-primary'
                            : 'border border-border-subtle text-text-secondary hover:bg-surface'
                        } disabled:opacity-50`}
                      >
                        <Zap className={`w-3 h-3 ${isExecuting ? 'animate-spin' : ''}`} />
                        <span>
                          {isExecuting
                            ? 'Executing...'
                            : opp.recommended_action === 'retry'
                            ? 'Retry Now'
                            : opp.recommended_action === 'payment_link'
                            ? 'Send Link'
                            : opp.recommended_action === 'reminder'
                            ? 'Send Reminder'
                            : opp.recommended_action === 'escalate'
                            ? 'Escalate'
                            : 'Suppress'}
                        </span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
