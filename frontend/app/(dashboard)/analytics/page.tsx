'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { api } from '@/lib/api';
import { AnalyticsResponse } from '@/lib/types';
import { formatINR, formatPct } from '@/lib/format';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.getAnalytics();
      setAnalytics(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setErrorMsg(`Failed to load analytics: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const notAvailable = <span className="text-text-muted font-mono">—</span>;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-sm bg-primary-muted border border-primary-500/30 flex items-center justify-center text-primary-300">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-text-primary tracking-tight">Analytics</h2>
            <p className="text-xs text-text-muted mt-0.5">Recovery performance summary from backend pipeline</p>
          </div>
        </div>
        <button
          id="btn-refresh-analytics"
          onClick={loadAnalytics}
          disabled={loading}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-sm bg-panel border border-border-strong text-text-secondary hover:text-text-primary text-xs transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded bg-risk-muted border border-risk-500/40 text-risk-300 text-xs font-mono">{errorMsg}</div>
      )}

      {!analytics && !loading && (
        <div className="bg-panel border border-border-subtle rounded-md p-10 text-center">
          <BarChart3 className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted text-sm">No analytics data available.</p>
          <p className="text-text-muted text-xs mt-1">Run a batch recovery from Mission Control to generate analytics data.</p>
        </div>
      )}

      {analytics && (
        <>
          {/* Primary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-panel border border-border-subtle rounded-md p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-risk-500" />
              <span className="text-[11px] font-mono uppercase text-text-muted">Total at Risk</span>
              <div className="text-2xl font-mono font-bold text-text-primary mt-2">
                {analytics.total_at_risk > 0 ? formatINR(analytics.total_at_risk, true) : notAvailable}
              </div>
              <p className="text-xs text-text-muted mt-1">Gross revenue at risk universe</p>
            </div>

            <div className="bg-panel border border-border-subtle rounded-md p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-success-500" />
              <span className="text-[11px] font-mono uppercase text-text-muted">Total Recovered</span>
              <div className="text-2xl font-mono font-bold text-success-300 mt-2">
                {analytics.total_recovered > 0 ? formatINR(analytics.total_recovered, true) : notAvailable}
              </div>
              <p className="text-xs text-text-muted mt-1">Actual recovered revenue</p>
            </div>

            <div className="bg-panel border border-border-subtle rounded-md p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-ai-500" />
              <span className="text-[11px] font-mono uppercase text-text-muted">Recovery Rate</span>
              <div className="text-2xl font-mono font-bold text-ai-300 mt-2 flex items-center space-x-2">
                {analytics.recovery_rate_pct > 0 ? (
                  <>
                    <span>{analytics.recovery_rate_pct.toFixed(1)}%</span>
                    <TrendingUp className="w-5 h-5 text-success-300" />
                  </>
                ) : notAvailable}
              </div>
              <p className="text-xs text-text-muted mt-1">Recovered / at-risk</p>
            </div>

            <div className="bg-panel border border-border-subtle rounded-md p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary-500" />
              <span className="text-[11px] font-mono uppercase text-text-muted">Intervention Success Rate</span>
              <div className="text-2xl font-mono font-bold text-text-primary mt-2">
                {analytics.intervention_success_rate_pct > 0
                  ? `${analytics.intervention_success_rate_pct.toFixed(1)}%`
                  : notAvailable}
              </div>
              <p className="text-xs text-text-muted mt-1">Successful / attempted</p>
            </div>
          </div>

          {/* Secondary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-panel border border-border-subtle rounded-md p-4">
              <span className="text-[11px] font-mono uppercase text-text-muted">Recovered Count</span>
              <div className="text-xl font-mono font-bold text-success-300 mt-2">
                {analytics.recovered_count > 0 ? analytics.recovered_count : notAvailable}
              </div>
              <div className="text-xs text-text-muted mt-1">
                of {analytics.attempted_count > 0 ? analytics.attempted_count : '—'} attempted interventions
              </div>
            </div>

            <div className="bg-panel border border-border-subtle rounded-md p-4">
              <span className="text-[11px] font-mono uppercase text-text-muted">Policy Blocked</span>
              <div className="text-xl font-mono font-bold text-risk-300 mt-2 flex items-center space-x-2">
                {analytics.policy_blocked_count > 0 ? (
                  <>
                    <span>{analytics.policy_blocked_count}</span>
                    <TrendingDown className="w-4 h-4 text-risk-300" />
                  </>
                ) : notAvailable}
              </div>
              <p className="text-xs text-text-muted mt-1">AI actions overridden by policy engine</p>
            </div>

            <div className="bg-panel border border-border-subtle rounded-md p-4">
              <span className="text-[11px] font-mono uppercase text-text-muted">Escalations</span>
              <div className="text-xl font-mono font-bold text-warning-300 mt-2">
                {analytics.escalation_count > 0 ? analytics.escalation_count : notAvailable}
              </div>
              <p className="text-xs text-text-muted mt-1">Rerouted to merchant for review</p>
            </div>
          </div>

          {/* Recovery Funnel */}
          <div className="bg-panel border border-border-subtle rounded-md p-4">
            <h3 className="text-text-primary text-sm font-semibold mb-4 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-primary-300" />
              <span>Recovery Funnel</span>
              <span className="ml-auto text-xs text-text-muted font-mono font-normal">All values from backend pipeline</span>
            </h3>

            <div className="space-y-3 text-xs font-mono">
              {[
                { label: 'Revenue at Risk', value: analytics.total_at_risk, max: analytics.total_at_risk, color: 'bg-risk-500', display: formatINR(analytics.total_at_risk, true) },
                { label: 'Recovery Attempted', value: analytics.attempted_count, max: Math.max(1, analytics.recovered_count + analytics.attempted_count), color: 'bg-primary-500', display: `${analytics.attempted_count} interventions` },
                { label: 'Successfully Recovered', value: analytics.recovered_count, max: Math.max(1, analytics.attempted_count), color: 'bg-success-500', display: `${analytics.recovered_count} transactions` },
                { label: 'Total Revenue Recovered', value: analytics.total_recovered, max: Math.max(1, analytics.total_at_risk), color: 'bg-success-500', display: formatINR(analytics.total_recovered, true) },
              ].map((row) => {
                const pct = row.max > 0 ? Math.min(100, (row.value / row.max) * 100) : 0;
                return (
                  <div key={row.label} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary font-sans">{row.label}</span>
                      <span className="text-text-primary font-bold">{row.display}</span>
                    </div>
                    <div className="h-2 w-full bg-surface rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${row.color} transition-all duration-700`} style={{ width: `${Math.max(2, pct)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 rounded bg-surface border border-border-divider text-xs text-text-muted leading-relaxed">
            <strong className="text-text-secondary">Data source: </strong>
            All values are computed from the real backend pipeline state via <code className="font-mono">GET /api/analytics</code>.
            Numbers reflect the actual in-memory repository state. Run a fresh scan + batch recovery to populate.
          </div>
        </>
      )}
    </div>
  );
}
