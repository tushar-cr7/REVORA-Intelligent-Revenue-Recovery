'use client';

import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';
import { formatINR } from '@/lib/format';
import { ForceRetryBlockResponse } from '@/lib/types';
import { api } from '@/lib/api';

interface ActionBlockedWowProps {
  onRefresh: () => void;
}

export const ActionBlockedWow: React.FC<ActionBlockedWowProps> = ({ onRefresh }) => {
  const [demoData, setDemoData] = useState<ForceRetryBlockResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [executedStatus, setExecutedStatus] = useState<string | null>(null);

  const fetchBlockedDemoBeat = async () => {
    setLoading(true);
    setExecutedStatus(null);
    try {
      const res = await api.forceRetryBlockDemo();
      setDemoData(res);
    } catch (err: any) {
      alert(`Demo Beat Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEscalateInstead = async () => {
    if (!demoData) return;
    setLoading(true);
    try {
      const idempotencyKey = `demo_block_escalate_${demoData.transaction_id}_${Date.now()}`;
      await api.executeIntervention(demoData.transaction_id, idempotencyKey);
      setExecutedStatus('Escalation created & recorded to Audit Ledger');
      onRefresh();
    } catch (err: any) {
      alert(`Escalation Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-panel border border-border-subtle rounded-md p-4 shadow-panel relative overflow-hidden">
      {/* Red/Coral Border Accent */}
      <div className="absolute top-0 left-0 w-1.5 h-full bg-risk-500" />

      <div className="flex items-center justify-between pb-3 border-b border-border-divider">
        <div className="flex items-center space-x-2.5">
          <div className="w-6 h-6 rounded bg-risk-muted border border-risk-500/30 flex items-center justify-center text-risk-300">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-text-primary text-sm font-semibold tracking-tight flex items-center space-x-2">
              <span>Policy Guardrail Intercept</span>
              <span className="text-[10px] font-mono uppercase bg-risk-muted text-risk-300 px-2 py-0.5 rounded border border-risk-500/30">
                Rules for Control
              </span>
            </h3>
            <p className="text-text-muted text-xs">AI recommendation stopped by merchant safety policy</p>
          </div>
        </div>

        <button
          onClick={fetchBlockedDemoBeat}
          disabled={loading}
          className="px-2.5 py-1 rounded bg-surface border border-border-strong text-text-secondary hover:text-text-primary text-xs font-mono flex items-center space-x-1.5 transition"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Test Live Policy Block</span>
        </button>
      </div>

      {!demoData ? (
        <div className="py-6 text-center text-xs text-text-muted">
          Click <span className="font-mono text-text-primary font-semibold">"Test Live Policy Block"</span> to trigger a real transaction exceeding retry limits.
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {/* Contrast: AI Recommendation vs Policy Decision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* AI Recommendation */}
            <div className="p-3 rounded bg-ai-muted/40 border border-ai-500/30 text-xs">
              <div className="flex items-center justify-between text-ai-300 font-mono font-semibold">
                <span>AI RECOMMENDATION</span>
                <span className="text-[11px] uppercase bg-ai-500/20 px-1.5 py-0.5 rounded">Intelligence</span>
              </div>
              <div className="mt-2 text-text-primary text-sm font-semibold">
                Attempt Action: <span className="capitalize font-mono text-ai-100">{demoData.attempted_action}</span>
              </div>
              <p className="text-text-muted text-[11px] mt-1">
                Transaction <span className="font-mono text-text-secondary">{demoData.transaction_id}</span> ({formatINR(demoData.amount)})
              </p>
            </div>

            {/* Policy Decision */}
            <div className="p-3 rounded bg-risk-muted/60 border border-risk-500/40 text-xs">
              <div className="flex items-center justify-between text-risk-300 font-mono font-semibold">
                <span>POLICY ENGINE GATE</span>
                <span className="text-[11px] uppercase bg-risk-500/30 text-risk-100 px-1.5 py-0.5 rounded">
                  ACTION BLOCKED
                </span>
              </div>
              <div className="mt-2 text-text-primary text-sm font-semibold text-risk-100">
                {demoData.policy_reason}
              </div>
              <p className="text-success-300 text-[11px] mt-1 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-success-500" />
                <span>Policy protected customer & merchant</span>
              </p>
            </div>
          </div>

          {/* Action Rerouting & Button */}
          <div className="p-3 rounded bg-surface border border-border-divider flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 text-text-secondary">
              <AlertTriangle className="w-4 h-4 text-warning-500 shrink-0" />
              <span>
                Deterministic Reroute: <strong className="text-text-primary uppercase font-mono">{demoData.final_action}</strong>
              </span>
            </div>

            <button
              onClick={handleEscalateInstead}
              disabled={loading || !!executedStatus}
              className="px-4 py-2 rounded-sm border border-risk-500 text-risk-300 hover:bg-risk-500 hover:text-text-primary font-semibold text-xs transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{executedStatus ? 'Escalation Created' : 'Escalate Instead'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {executedStatus && (
            <div className="p-2.5 rounded bg-success-muted border border-success-500/30 text-success-300 text-xs font-mono flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-success-500 shrink-0" />
              <span>{executedStatus}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
