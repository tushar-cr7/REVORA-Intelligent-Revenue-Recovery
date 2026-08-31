'use client';

import React from 'react';
import {
  LayoutDashboard,
  Radar,
  BrainCircuit,
  Receipt,
  Zap,
  ShieldCheck,
  AlertTriangle,
  FileSpreadsheet,
  BarChart3,
  Sliders,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'mission-control', label: 'Mission Control', icon: LayoutDashboard, pLevel: 'P0' },
    { id: 'revenue-scanner', label: 'Revenue Scanner', icon: Radar, pLevel: 'P0' },
    { id: 'recovery-brain', label: 'Recovery Brain', icon: BrainCircuit, pLevel: 'P0' },
    { id: 'transactions', label: 'Transactions', icon: Receipt, pLevel: 'P0' },
    { id: 'interventions', label: 'Interventions', icon: Zap, pLevel: 'P0' },
    { id: 'policies', label: 'Policies & Guardrails', icon: ShieldCheck, pLevel: 'P0' },
    { id: 'escalations', label: 'Escalations', icon: AlertTriangle, pLevel: 'P0' },
    { id: 'audit', label: 'Audit Trail', icon: FileSpreadsheet, pLevel: 'P0' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, pLevel: 'P1' },
    { id: 'integrations', label: 'Integrations', icon: Sliders, pLevel: 'P2' },
    { id: 'settings', label: 'Settings', icon: Settings, pLevel: 'P2' },
  ];

  return (
    <aside className="w-60 bg-surface border-r border-border-subtle flex flex-col justify-between shrink-0 hidden md:flex">
      <div className="py-4 px-3 space-y-1">
        <div className="px-3 pb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Navigation</span>
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-sm text-xs font-medium transition ${
                isActive
                  ? 'bg-panel-raised text-text-primary border-l-2 border-primary-500 font-semibold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-panel/50'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary-300' : 'text-text-muted'}`} />
                <span>{item.label}</span>
              </div>
              {item.pLevel === 'P0' && isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer System Version */}
      <div className="p-4 border-t border-border-divider">
        <div className="bg-panel rounded-sm p-2.5 border border-border-subtle">
          <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
            <span>CORE ENGINE</span>
            <span className="text-success-300">v1.0.0</span>
          </div>
          <p className="text-[10px] text-text-muted mt-1 leading-tight">
            XGBoost ML + Deterministic Policy Limits
          </p>
        </div>
      </div>
    </aside>
  );
};
