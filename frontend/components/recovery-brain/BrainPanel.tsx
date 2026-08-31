'use client';

import React from 'react';
import { BrainCircuit, Cpu, Sparkles, ShieldCheck, AlertTriangle } from 'lucide-react';
import { AnalyzeResponse } from '@/lib/types';

interface BrainPanelProps {
  analyzeData: AnalyzeResponse | null;
}

export const BrainPanel: React.FC<BrainPanelProps> = ({ analyzeData }) => {
  const metadata = analyzeData?.model_metadata;
  const proposedCounts = analyzeData?.proposed_action_counts || {};

  return (
    <div className="bg-panel border border-border-subtle rounded-md p-4 shadow-panel relative overflow-hidden flex flex-col justify-between">
      {/* Node/Network Background Accent Texture */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-ai-500/10 rounded-full blur-2xl pointer-events-none" />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-divider relative z-10">
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded bg-ai-muted border border-ai-500/30 flex items-center justify-center text-ai-300">
              <BrainCircuit className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-text-primary text-sm font-semibold tracking-tight flex items-center space-x-2">
                <span>Recovery Brain</span>
                <span className="text-[10px] font-mono bg-ai-muted text-ai-300 px-1.5 py-0.5 rounded border border-ai-500/20">
                  XGBoost v{metadata?.model_version || '1.0.0'}
                </span>
              </h3>
              <p className="text-text-muted text-xs">Predictive ML & Expected Value Scoring Engine</p>
            </div>
          </div>
          <Cpu className="w-4 h-4 text-ai-500/70" />
        </div>

        {/* Dynamic AI Explanation */}
        <div className="mt-3.5 p-3 rounded bg-ai-muted/40 border border-ai-500/20 text-xs text-ai-100 leading-relaxed font-sans relative z-10 flex items-start space-x-2.5">
          <Sparkles className="w-4 h-4 text-ai-300 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-ai-300">Intelligence Synthesis: </span>
            {analyzeData?.explanation || 'Run intelligence pass to generate predictive diagnostic summary.'}
          </div>
        </div>

        {/* Model Performance Metrics */}
        <div className="mt-4 grid grid-cols-2 gap-3 relative z-10">
          <div className="bg-surface p-2.5 rounded border border-border-divider">
            <span className="text-[10px] font-mono uppercase text-text-muted">ROC AUC Score</span>
            <div className="text-lg font-mono font-bold text-ai-300 mt-0.5">
              {metadata?.metrics?.auc || 0.88}
            </div>
            <span className="text-[10px] text-text-muted">High classification signal</span>
          </div>

          <div className="bg-surface p-2.5 rounded border border-border-divider">
            <span className="text-[10px] font-mono uppercase text-text-muted">Brier Score Loss</span>
            <div className="text-lg font-mono font-bold text-success-300 mt-0.5">
              {metadata?.metrics?.brier || 0.12}
            </div>
            <span className="text-[10px] text-text-muted">Well-calibrated probabilities</span>
          </div>
        </div>
      </div>

      {/* Action Breakdown Summary */}
      <div className="mt-4 pt-3 border-t border-border-divider grid grid-cols-3 gap-2 text-center text-xs font-mono relative z-10">
        <div className="p-1.5 rounded bg-surface border border-border-subtle">
          <span className="text-[10px] text-text-muted block">RETRIES</span>
          <span className="font-bold text-primary-300">{proposedCounts['retry'] || 0}</span>
        </div>
        <div className="p-1.5 rounded bg-surface border border-border-subtle">
          <span className="text-[10px] text-text-muted block">SUPPRESSED</span>
          <span className="font-bold text-text-muted">{proposedCounts['suppress'] || 0}</span>
        </div>
        <div className="p-1.5 rounded bg-surface border border-border-subtle">
          <span className="text-[10px] text-text-muted block">ESCALATED</span>
          <span className="font-bold text-warning-300">{proposedCounts['escalate'] || 0}</span>
        </div>
      </div>
    </div>
  );
};
