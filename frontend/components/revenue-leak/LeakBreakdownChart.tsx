'use client';

import React from 'react';
import { PieChart } from 'lucide-react';
import { formatINR } from '@/lib/format';
import { ScanResponse } from '@/lib/types';

interface LeakBreakdownChartProps {
  scanData: ScanResponse | null;
}

const CATEGORY_MAP: Record<string, { label: string; color: string; bg: string }> = {
  failed_payment: { label: 'Failed Payments', color: 'bg-risk-500', bg: 'bg-risk-muted' },
  abandoned_checkout: { label: 'Abandoned Checkouts', color: 'bg-warning-500', bg: 'bg-warning-muted' },
  failed_subscription: { label: 'Subscription Failures', color: 'bg-ai-500', bg: 'bg-ai-muted' },
  overdue_invoice: { label: 'Overdue Invoices', color: 'bg-primary-500', bg: 'bg-primary-muted' },
};

export const LeakBreakdownChart: React.FC<LeakBreakdownChartProps> = ({ scanData }) => {
  const breakdown = scanData?.breakdown || [];
  const totalAtRisk = scanData?.total_at_risk || 1;

  return (
    <div className="bg-panel border border-border-subtle rounded-md p-4 shadow-panel flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-border-divider">
          <div>
            <h3 className="text-text-primary text-sm font-semibold tracking-tight">Revenue Leak Breakdown</h3>
            <p className="text-text-muted text-xs">Categorized risk universe from detection engine</p>
          </div>
          <PieChart className="w-4 h-4 text-text-muted" />
        </div>

        {/* Breakdown Items */}
        <div className="mt-4 space-y-3.5">
          {breakdown.length === 0 ? (
            <div className="text-text-muted text-xs italic py-6 text-center">
              No revenue leaks detected. Click "Scan Revenue" to initialize.
            </div>
          ) : (
            breakdown.map((item) => {
              const meta = CATEGORY_MAP[item.leak_type] || {
                label: item.leak_type,
                color: 'bg-primary-500',
                bg: 'bg-panel-raised',
              };
              const pct = (item.amount_at_risk / totalAtRisk) * 100;

              return (
                <div key={item.leak_type} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${meta.color}`} />
                      <span className="text-text-primary font-medium">{meta.label}</span>
                      <span className="text-text-muted font-mono text-[11px]">({item.count})</span>
                    </div>
                    <div className="flex items-center space-x-3 font-mono">
                      <span className="text-text-primary font-semibold">{formatINR(item.amount_at_risk)}</span>
                      <span className="text-text-muted text-[11px] w-10 text-right">{pct.toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-surface overflow-hidden">
                    <div
                      className={`h-full rounded-full ${meta.color} transition-all duration-500`}
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="mt-4 pt-3 border-t border-border-divider flex items-center justify-between text-xs">
        <span className="text-text-muted">Total Universe</span>
        <span className="font-mono text-text-primary font-bold">{formatINR(totalAtRisk)}</span>
      </div>
    </div>
  );
};
