'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

const navItems = [
  { href: '/mission-control', label: 'Mission Control', icon: LayoutDashboard, pLevel: 'P0' },
  { href: '/revenue-scanner', label: 'Revenue Scanner', icon: Radar, pLevel: 'P0' },
  { href: '/recovery-brain', label: 'Recovery Brain', icon: BrainCircuit, pLevel: 'P0' },
  { href: '/transactions', label: 'Transactions', icon: Receipt, pLevel: 'P0' },
  { href: '/interventions', label: 'Interventions', icon: Zap, pLevel: 'P0' },
  { href: '/policies', label: 'Policies & Guardrails', icon: ShieldCheck, pLevel: 'P0' },
  { href: '/escalations', label: 'Escalations', icon: AlertTriangle, pLevel: 'P1' },
  { href: '/audit', label: 'Audit Trail', icon: FileSpreadsheet, pLevel: 'P0' },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, pLevel: 'P1' },
  { href: '/integrations', label: 'Integrations', icon: Sliders, pLevel: 'P2' },
  { href: '/settings', label: 'Settings', icon: Settings, pLevel: 'P2' },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-surface border-r border-border-subtle flex flex-col justify-between shrink-0 hidden md:flex">
      <div className="py-4 px-3 space-y-1">
        <div className="px-3 pb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Navigation</span>
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
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
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
              )}
            </Link>
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
