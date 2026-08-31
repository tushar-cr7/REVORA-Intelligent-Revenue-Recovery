'use client';

import React from 'react';
import { AlertCircle, BrainCircuit, CheckCircle2, Zap } from 'lucide-react';
import { formatINR, formatPct } from '@/lib/format';
import { AnalyzeResponse, RecoverResponse, ScanResponse } from '@/lib/types';

interface KpiCardsProps {
  scanData: ScanResponse | null;
  analyzeData: AnalyzeResponse | null;
  recoverData: RecoverResponse | null;
  onRunBatchRecover: () => void;
  isRecovering: boolean;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  scanData,
  analyzeData,
  recoverData,
  onRunBatchRecover,
  isRecovering,
}) => {
  const atRisk = scanData?.total_at_risk || 0;
  const recoverable = analyzeData?.realistically_recoverable || 0;
  const recovered = recoverData?.total_recovered || 0;
  const avgProb = analyzeData?.avg_recovery_probability || 0;
  const recoveryRate = recoverData?.recovery_rate_pct || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Revenue at Risk Card */}
      <div className="bg-panel border border-border-subtle rounded-md p-4 shadow-panel relative overflow-hidden group hover:border-risk-500/40 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-text-muted">Revenue at Risk</span>
          <div className="w-7 h-7 rounded-sm bg-risk-muted border border-risk-500/30 flex items-center justify-center text-risk-300">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl lg:text-3xl font-mono font-semibold text-text-primary">
            {formatINR(atRisk, true)}
          </div>
          <div className="flex items-center space-x-2 mt-1.5 text-xs text-text-muted">
            <span className="font-mono text-risk-300">{scanData?.total_transactions_scanned || 0}</span>
            <span>at-risk transactions detected</span>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-1 h-full bg-risk-500" />
      </div>

      {/* 2. Realistically Recoverable Card */}
      <div className="bg-panel border border-border-subtle rounded-md p-4 shadow-panel relative overflow-hidden group hover:border-ai-500/40 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-text-muted">Realistically Recoverable</span>
          <div className="w-7 h-7 rounded-sm bg-ai-muted border border-ai-500/30 flex items-center justify-center text-ai-300">
            <BrainCircuit className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl lg:text-3xl font-mono font-semibold text-ai-100">
            {formatINR(recoverable, true)}
          </div>
          <div className="flex items-center space-x-2 mt-1.5 text-xs text-text-muted">
            <span>Avg probability:</span>
            <span className="font-mono text-ai-300 font-semibold">{formatPct(avgProb)}</span>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-1 h-full bg-ai-500" />
      </div>

      {/* 3. Total Recovered Card */}
      <div className="bg-panel border border-border-subtle rounded-md p-4 shadow-panel relative overflow-hidden group hover:border-success-500/40 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-text-muted">Total Recovered</span>
          <div className="w-7 h-7 rounded-sm bg-success-muted border border-success-500/30 flex items-center justify-center text-success-300">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl lg:text-3xl font-mono font-semibold text-success-300">
            {formatINR(recovered, true)}
          </div>
          <div className="flex items-center space-x-2 mt-1.5 text-xs text-text-muted">
            <span>Recovery rate:</span>
            <span className="font-mono text-success-300 font-semibold">{formatPct(recoveryRate)}</span>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-1 h-full bg-success-500" />
      </div>

      {/* 4. Autopilot Interventions Card */}
      <div className="bg-panel border border-border-subtle rounded-md p-4 shadow-panel relative overflow-hidden flex flex-col justify-between group hover:border-primary-500/40 transition">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-text-muted">Policy & Execution</span>
            <div className="w-7 h-7 rounded-sm bg-primary-muted border border-primary-500/30 flex items-center justify-center text-primary-300">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-xl font-mono font-semibold text-text-primary">
              {analyzeData?.policy_blocked_count || 0}
            </div>
            <span className="text-xs text-risk-300 font-mono bg-risk-muted px-2 py-0.5 rounded border border-risk-500/20">
              Policy Blocked
            </span>
          </div>
        </div>

        <button
          onClick={onRunBatchRecover}
          disabled={isRecovering || !analyzeData}
          className="mt-3 w-full py-2 px-3 rounded-sm bg-primary-500 hover:bg-primary-600 text-text-primary text-xs font-semibold flex items-center justify-center space-x-2 transition disabled:opacity-40"
        >
          <Zap className={`w-3.5 h-3.5 ${isRecovering ? 'animate-spin' : ''}`} />
          <span>{isRecovering ? 'Executing Batch...' : 'Run Batch Recovery'}</span>
        </button>
        <div className="absolute top-0 left-0 w-1 h-full bg-primary-500" />
      </div>
    </div>
  );
};
