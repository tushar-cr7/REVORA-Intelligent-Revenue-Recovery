'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, RefreshCw, ChevronRight, ArrowDown } from 'lucide-react';
import { api } from '@/lib/api';
import { PolicyLimits } from '@/lib/types';
import { formatINR } from '@/lib/format';

export default function PoliciesPage() {
  const [policy, setPolicy] = useState<PolicyLimits | null>(null);
  const [policyVersion, setPolicyVersion] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadPolicies = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.getPolicies();
      setPolicy(res.active_policy);
      setPolicyVersion(res.policy_version);
      setDescription(res.description);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setErrorMsg(`Failed to load policies: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPolicies();
  }, [loadPolicies]);

  const policyRules = policy ? [
    {
      key: 'max_retries',
      label: 'Max Retries Per Transaction',
      value: `${policy.max_retries} attempts`,
      description: 'Transactions that have already been retried this many times will not be retried again — action is rerouted to escalate.',
      riskColor: 'text-risk-300',
    },
    {
      key: 'min_cooldown_hours',
      label: 'Minimum Cooldown Period',
      value: `${policy.min_cooldown_hours} hours`,
      description: 'A transaction cannot be acted upon again until this many hours have passed since the last attempt.',
      riskColor: 'text-warning-300',
    },
    {
      key: 'max_customer_contacts_per_day',
      label: 'Customer Contact Frequency',
      value: `${policy.max_customer_contacts_per_day} / day`,
      description: 'A customer cannot receive more than this many outbound contacts in a single calendar day across all their transactions.',
      riskColor: 'text-ai-300',
    },
    {
      key: 'max_auto_recovery_value',
      label: 'Auto-Recovery Amount Ceiling',
      value: formatINR(policy.max_auto_recovery_value),
      description: 'Transactions above this amount cannot be auto-recovered — they are escalated to the merchant for manual review.',
      riskColor: 'text-primary-300',
    },
    {
      key: 'max_subscription_consecutive_failures_for_retry',
      label: 'Subscription Failure Tolerance',
      value: `${policy.max_subscription_consecutive_failures_for_retry} consecutive failures`,
      description: 'If a subscription has failed consecutively more than this many times, retry is blocked — escalation is triggered.',
      riskColor: 'text-risk-300',
    },
    {
      key: 'invoice_escalation_age_days',
      label: 'Invoice Escalation Age',
      value: `${policy.invoice_escalation_age_days} days`,
      description: 'Overdue invoices older than this threshold are automatically escalated rather than sent reminders.',
      riskColor: 'text-warning-300',
    },
  ] : [];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-sm bg-success-muted border border-success-500/30 flex items-center justify-center text-success-300">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-text-primary tracking-tight">Policies & Guardrails</h2>
            <p className="text-xs text-text-muted mt-0.5">Deterministic safety limits — these cannot be overridden by AI</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {policyVersion && (
            <span className="text-xs font-mono text-text-muted bg-surface px-2 py-0.5 rounded border border-border-subtle">
              Policy {policyVersion}
            </span>
          )}
          <button
            id="btn-refresh-policies"
            onClick={loadPolicies}
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

      {/* Architecture Diagram */}
      <div className="bg-panel border border-border-subtle rounded-md p-5">
        <h3 className="text-text-primary text-sm font-semibold mb-4 flex items-center space-x-2">
          <span>Decision Control Flow</span>
          <span className="ml-auto text-[10px] font-mono uppercase text-text-muted tracking-wider">AI for Intelligence · Rules for Control</span>
        </h3>

        <div className="flex flex-col items-center space-y-2 text-xs font-mono">
          {[
            { label: 'ML MODEL', sub: 'XGBoost predicts P(recovery) for each transaction', color: 'border-ai-500/40 bg-ai-muted/30 text-ai-300' },
            { label: 'DECISION ENGINE', sub: 'Scores all candidate actions by Expected Value — picks highest EV action', color: 'border-ai-500/30 bg-ai-muted/20 text-ai-300' },
            { label: 'POLICY GATE', sub: 'Checks AI proposal against these deterministic limits. The AI cannot override this step.', color: 'border-risk-500/40 bg-risk-muted/30 text-risk-300' },
            { label: 'EXECUTOR', sub: 'If allowed: executes. If blocked: reroutes to escalate or suppress.', color: 'border-success-500/40 bg-success-muted/30 text-success-300' },
          ].map((step, idx, arr) => (
            <React.Fragment key={idx}>
              <div className={`w-full max-w-lg p-3 rounded border text-center ${step.color}`}>
                <div className="font-bold text-xs">{step.label}</div>
                <div className="text-text-muted font-sans text-[11px] mt-1">{step.sub}</div>
              </div>
              {idx < arr.length - 1 && <ArrowDown className="w-4 h-4 text-text-muted" />}
            </React.Fragment>
          ))}
        </div>

        {description && (
          <p className="text-xs text-text-muted mt-4 text-center leading-relaxed">{description}</p>
        )}
      </div>

      {/* Policy Rules */}
      {policy && (
        <div className="bg-panel border border-border-subtle rounded-md p-4">
          <h3 className="text-text-primary text-sm font-semibold pb-3 border-b border-border-divider flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-success-300" />
            <span>Active Policy Limits</span>
            <span className="ml-auto text-[10px] text-text-muted font-mono">Read-only — enforced server-side</span>
          </h3>

          <div className="mt-4 space-y-3">
            {policyRules.map((rule) => (
              <div key={rule.key} className="p-3 rounded bg-surface border border-border-divider flex items-start justify-between gap-4">
                <div className="flex items-start space-x-3">
                  <ChevronRight className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
                  <div>
                    <div className="text-text-primary text-sm font-medium">{rule.label}</div>
                    <div className="text-text-muted text-xs mt-0.5 leading-relaxed">{rule.description}</div>
                  </div>
                </div>
                <div className={`text-sm font-mono font-bold shrink-0 ${rule.riskColor}`}>
                  {rule.value}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 rounded bg-warning-muted/30 border border-warning-500/20 text-xs text-text-muted leading-relaxed">
            <strong className="text-warning-300">Important: </strong>
            These limits are enforced by the deterministic policy engine in <code className="font-mono text-text-secondary">backend/app/domain/policy.py</code>.
            No client-side logic can modify or bypass them. Any simulated changes via the Policy Simulator produce backend-evaluated results only.
          </div>
        </div>
      )}

      {loading && !policy && (
        <div className="bg-panel border border-border-subtle rounded-md p-10 text-center text-text-muted text-xs">
          Loading policy configuration...
        </div>
      )}
    </div>
  );
}
