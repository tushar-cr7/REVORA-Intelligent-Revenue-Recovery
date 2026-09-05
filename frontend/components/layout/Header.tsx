'use client';

import React from 'react';
import { ShieldCheck, RefreshCw, Bell, ChevronDown, Sparkles } from 'lucide-react';

interface HeaderProps {
  onScan: () => void;
  onAnalyze: () => void;
  isScanning: boolean;
  isAnalyzing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onScan,
  onAnalyze,
  isScanning,
  isAnalyzing,
}) => {
  return (
    <header className="h-16 bg-surface border-b border-border-subtle px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand & Context */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-md bg-ai-muted border border-ai-500/40 flex items-center justify-center text-ai-300 font-mono font-bold text-sm shadow-sm">
            R
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-text-primary font-semibold text-base tracking-tight">REVORA</h1>
              <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-primary-muted border border-primary-500/30 text-primary-300">
                Mission Control
              </span>
            </div>
            <p className="text-text-muted text-xs hidden sm:block">Intelligent Revenue Recovery System</p>
          </div>
        </div>

        <div className="h-5 w-px bg-border-divider hidden md:block" />

        {/* Live System Indicator */}
        <div className="hidden md:flex items-center space-x-2 px-2.5 py-1 rounded-pill bg-success-muted/60 border border-success-500/30">
          <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
          <span className="text-success-300 text-xs font-mono font-medium">Autopilot Active</span>
        </div>
      </div>

      {/* Actions & User Control */}
      <div className="flex items-center space-x-3">
        {/* Run Scan Button */}
        <button
          onClick={onScan}
          disabled={isScanning}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-sm bg-panel border border-border-strong text-text-secondary hover:text-text-primary hover:border-primary-500/50 text-xs font-medium transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-primary-300' : ''}`} />
          <span>{isScanning ? 'Scanning...' : 'Scan Revenue'}</span>
        </button>

        {/* Analyze Risk Button */}
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-sm bg-ai-700 hover:bg-ai-600 text-text-primary text-xs font-semibold shadow-sm transition disabled:opacity-50"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAnalyzing ? 'Analyzing...' : 'Run Intelligence Pass'}</span>
        </button>

        <div className="h-5 w-px bg-border-divider" />

        {/* Merchant Switcher */}
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-sm bg-panel border border-border-subtle text-xs text-text-secondary">
          <span className="text-text-muted">Merchant:</span>
          <span className="font-mono text-text-primary font-medium">merch_001</span>
          <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
        </div>

        {/* Notifications Bell */}
        <button className="p-2 rounded-sm bg-panel border border-border-subtle text-text-muted hover:text-text-primary transition relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-ai-500" />
        </button>
      </div>
    </header>
  );
};
