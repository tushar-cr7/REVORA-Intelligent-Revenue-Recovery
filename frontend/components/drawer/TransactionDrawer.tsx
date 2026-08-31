'use client';

import React, { useEffect, useState } from 'react';
import { X, ShieldCheck, ShieldAlert, BrainCircuit, Zap, Receipt, AlertCircle } from 'lucide-react';
import { formatINR, formatPct } from '@/lib/format';
import { Decision, Transaction } from '@/lib/types';
import { api } from '@/lib/api';

interface TransactionDrawerProps {
  transactionId: string | null;
  onClose: () => void;
  onRefresh: () => void;
}

export const TransactionDrawer: React.FC<TransactionDrawerProps> = ({
  transactionId,
  onClose,
  onRefresh,
}) => {
  const [tx, setTx] = useState<Transaction | null>(null);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [executing, setExecuting] = useState<boolean>(false);

  useEffect(() => {
    if (!transactionId) return;

    const loadDetails = async () => {
      setLoading(true);
      try {
        const txData = await api.getTransactionById(transactionId);
        setTx(txData);
        try {
          const decData = await api.getDecisionById(txData.leak_id);
          setDecision(decData);
        } catch {
          setDecision(null);
        }
      } catch (err: any) {
        console.error('Drawer Load Error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [transactionId]);

  if (!transactionId) return null;

  const handleExecute = async () => {
    if (!tx) return;
    setExecuting(true);
    try {
      const idempotencyKey = `drawer_exec_${tx.transaction_id}_${Date.now()}`;
      await api.executeIntervention(tx.transaction_id, idempotencyKey);
      onRefresh();
      onClose();
    } catch (err: any) {
      alert(`Execution Error: ${err.message}`);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-[440px] bg-panel-raised border-l border-border-strong shadow-drawer h-full flex flex-col justify-between overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-border-divider flex items-center justify-between bg-surface sticky top-0 z-10">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded bg-panel border border-border-strong flex items-center justify-center text-primary-300">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-text-primary text-sm font-semibold font-mono">{tx?.transaction_id || transactionId}</h2>
              <p className="text-text-muted text-xs">Transaction Deep Dive & Intelligence Trail</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded bg-panel hover:bg-panel-hover text-text-muted hover:text-text-primary transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {loading || !tx ? (
          <div className="p-8 text-center text-text-muted text-xs font-mono">
            Loading transaction intelligence...
          </div>
        ) : (
          <div className="p-5 space-y-5">
            {/* Amount Hero */}
            <div className="p-4 rounded-md bg-panel border border-border-subtle flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-text-muted uppercase">At Risk Amount</span>
                <div className="text-2xl font-mono font-bold text-text-primary mt-0.5">
                  {formatINR(tx.amount)}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-mono text-text-muted uppercase block">Customer</span>
                <span className="text-xs font-mono text-primary-300 font-semibold">{tx.customer_id}</span>
                <span className="text-[10px] font-mono text-text-muted block uppercase">LTV: {tx.ltv_bucket}</span>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-surface border border-border-divider">
                <span className="text-[10px] text-text-muted block uppercase">Leak Category</span>
                <span className="text-text-primary capitalize">{tx.leak_type.replace('_', ' ')}</span>
              </div>
              <div className="p-2.5 rounded bg-surface border border-border-divider">
                <span className="text-[10px] text-text-muted block uppercase">Payment Method</span>
                <span className="text-text-primary uppercase">{tx.payment_method}</span>
              </div>
              <div className="p-2.5 rounded bg-surface border border-border-divider">
                <span className="text-[10px] text-text-muted block uppercase">Failure Reason</span>
                <span className="text-risk-300">{tx.failure_code}</span>
              </div>
              <div className="p-2.5 rounded bg-surface border border-border-divider">
                <span className="text-[10px] text-text-muted block uppercase">Retries / Age</span>
                <span className="text-text-primary">{tx.retries_so_far} retries | {tx.hours_since_event}h ago</span>
              </div>
            </div>

            {/* AI Decision Panel */}
            {decision && (
              <div className="p-4 rounded-md bg-ai-muted/40 border border-ai-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-ai-300 font-semibold text-xs">
                    <BrainCircuit className="w-4 h-4" />
                    <span>AI DECISION ENGINE</span>
                  </div>
                  <span className="text-[10px] font-mono text-ai-300 bg-ai-500/20 px-2 py-0.5 rounded">
                    Score: {formatPct(decision.ai_proposed_probability)}
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-xs text-text-secondary">Proposed Action:</span>
                  <span className="text-xs font-mono font-bold uppercase text-ai-100 bg-ai-700/60 px-2 py-0.5 rounded">
                    {decision.ai_proposed_action}
                  </span>
                </div>

                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-text-muted">Expected Value (EV):</span>
                  <span className="font-mono font-semibold text-success-300">
                    {formatINR(decision.ai_proposed_ev)}
                  </span>
                </div>

                {/* Candidate EV Table */}
                <div className="pt-2 border-t border-ai-500/20">
                  <span className="text-[10px] font-mono uppercase text-ai-300 block mb-1.5">Candidate Action EV Ranking</span>
                  <div className="space-y-1 text-[11px] font-mono">
                    {decision.candidates_evaluated.map((c) => (
                      <div key={c.action} className="flex items-center justify-between text-text-muted">
                        <span className="capitalize">{c.action}:</span>
                        <span>P={formatPct(c.probability)} | EV={formatINR(c.expected_value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Policy Decision Panel */}
            {decision && (
              <div
                className={`p-4 rounded-md border text-xs space-y-2 ${
                  decision.policy_allowed
                    ? 'bg-success-muted/50 border-success-500/30'
                    : 'bg-risk-muted/60 border-risk-500/40'
                }`}
              >
                <div className="flex items-center justify-between font-mono font-semibold">
                  <div className="flex items-center space-x-2">
                    {decision.policy_allowed ? (
                      <ShieldCheck className="w-4 h-4 text-success-300" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-risk-300" />
                    )}
                    <span className={decision.policy_allowed ? 'text-success-300' : 'text-risk-300'}>
                      DETERMINISTIC POLICY GATE
                    </span>
                  </div>
                  <span
                    className={`text-[10px] uppercase px-2 py-0.5 rounded font-bold ${
                      decision.policy_allowed
                        ? 'bg-success-500/20 text-success-300'
                        : 'bg-risk-500/30 text-risk-100'
                    }`}
                  >
                    {decision.policy_allowed ? 'ALLOWED' : 'BLOCKED'}
                  </span>
                </div>

                <div className="text-text-primary font-medium pt-1">{decision.policy_reason}</div>

                {!decision.policy_allowed && (
                  <div className="pt-1.5 text-text-muted text-[11px]">
                    Authorized Final Reroute:{' '}
                    <strong className="text-warning-300 font-mono uppercase">{decision.final_action}</strong>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer Execution Trigger */}
        <div className="p-4 border-t border-border-divider bg-surface sticky bottom-0">
          <button
            onClick={handleExecute}
            disabled={executing || !tx}
            className="w-full py-2.5 px-4 rounded-sm bg-primary-500 hover:bg-primary-600 text-text-primary text-xs font-semibold flex items-center justify-center space-x-2 transition disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 ${executing ? 'animate-spin' : ''}`} />
            <span>{executing ? 'Executing Action...' : `Execute Action (${decision?.final_action || 'Authorize'})`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
