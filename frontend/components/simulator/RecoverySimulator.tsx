'use client';

import React, { useState } from 'react';
import { Sliders, Play, RefreshCcw } from 'lucide-react';
import { formatINR } from '@/lib/format';
import { PolicyLimits, SimulateResponse } from '@/lib/types';
import { api } from '@/lib/api';

interface RecoverySimulatorProps {
  initialPolicy: PolicyLimits | null;
}

export const RecoverySimulator: React.FC<RecoverySimulatorProps> = ({ initialPolicy }) => {
  const [maxRetries, setMaxRetries] = useState<number>(initialPolicy?.max_retries || 2);
  const [cooldownHours, setCooldownHours] = useState<number>(initialPolicy?.min_cooldown_hours || 6);
  const [contactsPerDay, setContactsPerDay] = useState<number>(initialPolicy?.max_customer_contacts_per_day || 1);
  const [autoRecoveryLimit, setAutoRecoveryLimit] = useState<number>(initialPolicy?.max_auto_recovery_value || 25000);

  const [simResult, setSimResult] = useState<SimulateResponse | null>(null);
  const [simulating, setSimulating] = useState<boolean>(false);

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const res = await api.simulatePolicy({
        max_retries: maxRetries,
        min_cooldown_hours: cooldownHours,
        max_customer_contacts_per_day: contactsPerDay,
        max_auto_recovery_value: autoRecoveryLimit,
      });
      setSimResult(res);
    } catch (err: any) {
      alert(`Simulation Error: ${err.message}`);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="bg-panel border border-border-subtle rounded-md p-4 shadow-panel">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border-divider">
        <div className="flex items-center space-x-2.5">
          <div className="w-6 h-6 rounded bg-surface border border-border-strong flex items-center justify-center text-primary-300">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-text-primary text-sm font-semibold tracking-tight">Recovery Policy Simulator</h3>
            <p className="text-text-muted text-xs">Simulate expected value impacts of custom guardrail limits</p>
          </div>
        </div>
        <span className="text-[10px] font-mono uppercase bg-primary-muted text-primary-300 px-2 py-0.5 rounded border border-primary-500/20">
          What-If Engine
        </span>
      </div>

      {/* Controls & Output Split */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Controls */}
        <div className="space-y-3.5 text-xs font-mono">
          <div>
            <div className="flex justify-between text-text-secondary mb-1">
              <span>Max Retries Limit:</span>
              <span className="text-text-primary font-bold">{maxRetries}</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={maxRetries}
              onChange={(e) => setMaxRetries(Number(e.target.value))}
              className="w-full accent-primary-500 bg-surface h-1.5 rounded cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-text-secondary mb-1">
              <span>Min Cooldown Hours:</span>
              <span className="text-text-primary font-bold">{cooldownHours}h</span>
            </div>
            <input
              type="range"
              min={1}
              max={24}
              value={cooldownHours}
              onChange={(e) => setCooldownHours(Number(e.target.value))}
              className="w-full accent-primary-500 bg-surface h-1.5 rounded cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-text-secondary mb-1">
              <span>Daily Contacts / Customer:</span>
              <span className="text-text-primary font-bold">{contactsPerDay}</span>
            </div>
            <input
              type="range"
              min={1}
              max={3}
              value={contactsPerDay}
              onChange={(e) => setContactsPerDay(Number(e.target.value))}
              className="w-full accent-primary-500 bg-surface h-1.5 rounded cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-text-secondary mb-1">
              <span>Auto-Recovery Amount Ceiling:</span>
              <span className="text-text-primary font-bold">{formatINR(autoRecoveryLimit)}</span>
            </div>
            <input
              type="range"
              min={10000}
              max={100000}
              step={5000}
              value={autoRecoveryLimit}
              onChange={(e) => setAutoRecoveryLimit(Number(e.target.value))}
              className="w-full accent-primary-500 bg-surface h-1.5 rounded cursor-pointer"
            />
          </div>

          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="w-full py-2 px-3 rounded-sm bg-primary-500 hover:bg-primary-600 text-text-primary font-semibold flex items-center justify-center space-x-2 transition disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${simulating ? 'animate-spin' : ''}`} />
            <span>{simulating ? 'Running Simulation...' : 'Run Simulation Pass'}</span>
          </button>
        </div>

        {/* Results */}
        <div className="p-3.5 rounded bg-surface border border-border-divider flex flex-col justify-between">
          {!simResult ? (
            <div className="h-full flex items-center justify-center text-text-muted text-xs italic text-center p-4">
              Adjust sliders and click "Run Simulation Pass" to evaluate policy impact.
            </div>
          ) : (
            <div className="space-y-3 font-mono">
              <div className="pb-2 border-b border-border-divider flex justify-between items-baseline">
                <span className="text-xs text-text-muted uppercase font-sans">Simulated Expected Value</span>
                <span className="text-xl font-bold text-success-300">
                  {formatINR(simResult.simulated_total_expected_value, true)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-panel border border-border-subtle">
                  <span className="text-[10px] text-text-muted block">POLICY BLOCKED</span>
                  <span className="text-base font-bold text-risk-300">{simResult.blocked_count}</span>
                </div>
                <div className="p-2 rounded bg-panel border border-border-subtle">
                  <span className="text-[10px] text-text-muted block">TOTAL EVALUATED</span>
                  <span className="text-base font-bold text-text-primary">{simResult.total_transactions}</span>
                </div>
              </div>

              <div className="text-[11px] text-text-muted pt-1">
                Proposed Actions:{' '}
                <span className="text-text-secondary">
                  {Object.entries(simResult.proposed_action_counts)
                    .map(([act, cnt]) => `${act}: ${cnt}`)
                    .join(' | ')}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
