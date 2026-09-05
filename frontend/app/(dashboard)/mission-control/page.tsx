'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { KpiCards } from '@/components/kpi/KpiCards';
import { LeakBreakdownChart } from '@/components/revenue-leak/LeakBreakdownChart';
import { BrainPanel } from '@/components/recovery-brain/BrainPanel';
import { TopOpportunities } from '@/components/opportunities/TopOpportunities';
import { ActionBlockedWow } from '@/components/action-blocked/ActionBlockedWow';
import { LiveActivityFeed } from '@/components/live-activity/LiveActivityFeed';
import { AuditLedgerTable } from '@/components/audit/AuditLedgerTable';
import { RecoverySimulator } from '@/components/simulator/RecoverySimulator';
import { TransactionDrawer } from '@/components/drawer/TransactionDrawer';
import { api } from '@/lib/api';
import {
  ScanResponse,
  AnalyzeResponse,
  RecoverResponse,
  Opportunity,
  AuditEvent,
  PolicyLimits,
} from '@/lib/types';

export default function MissionControlPage() {
  const [scanData, setScanData] = useState<ScanResponse | null>(null);
  const [analyzeData, setAnalyzeData] = useState<AnalyzeResponse | null>(null);
  const [recoverData, setRecoverData] = useState<RecoverResponse | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEvent[]>([]);
  const [policyLimits, setPolicyLimits] = useState<PolicyLimits | null>(null);

  const [isRecovering, setIsRecovering] = useState<boolean>(false);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadBackendData = useCallback(async () => {
    try {
      setErrorMsg(null);
      const opps = await api.getOpportunities(15).catch(() => []);
      setOpportunities(opps);

      const audit = await api.getAuditLog(100).catch(() => ({ total: 0, entries: [] }));
      setAuditLog(audit.entries);

      const pol = await api.getPolicies().catch(() => null);
      if (pol) setPolicyLimits(pol.active_policy);
    } catch (err: unknown) {
      console.error('Data Load Error:', err);
    }
  }, []);

  const handleBatchRecover = async () => {
    setIsRecovering(true);
    setErrorMsg(null);
    try {
      const recRes = await api.recoverRevenue();
      setRecoverData(recRes);
      await loadBackendData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setErrorMsg(`Batch Recovery Failed: ${msg}`);
    } finally {
      setIsRecovering(false);
    }
  };

  useEffect(() => {
    const initBoot = async () => {
      try {
        const scanRes = await api.scanRevenue(100, 42);
        setScanData(scanRes);
        const analyzeRes = await api.analyzeRevenue();
        setAnalyzeData(analyzeRes);
        await loadBackendData();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error('Init Boot Error:', err);
        setErrorMsg(`Connecting to REVORA backend on http://localhost:8000... (${msg})`);
      }
    };

    initBoot();
  }, [loadBackendData]);

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto w-full">
      {/* Error Banner */}
      {errorMsg && (
        <div className="p-3 rounded bg-risk-muted border border-risk-500/40 text-risk-300 text-xs font-mono flex items-center justify-between">
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Section Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary tracking-tight">Mission Control</h2>
          <p className="text-xs text-text-muted mt-0.5">
            Real-time autonomous revenue recovery command center
          </p>
        </div>

        <div className="text-right font-mono text-xs text-text-muted hidden sm:block">
          <span>ACTIVE MODEL: </span>
          <span className="text-ai-300 font-semibold">XGBoost v1.0.0</span>
        </div>
      </div>

      {/* 1. Hero KPI Cards */}
      <KpiCards
        scanData={scanData}
        analyzeData={analyzeData}
        recoverData={recoverData}
        onRunBatchRecover={handleBatchRecover}
        isRecovering={isRecovering}
      />

      {/* 2. Secondary Grid: Leak Breakdown & Recovery Brain */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeakBreakdownChart scanData={scanData} />
        <BrainPanel analyzeData={analyzeData} />
      </div>

      {/* 3. Top Recovery Opportunities */}
      <TopOpportunities
        opportunities={opportunities}
        onSelectTransaction={(id) => setSelectedTxId(id)}
        onRefresh={loadBackendData}
      />

      {/* 4. Action Blocked WOW Moment Panel */}
      <ActionBlockedWow onRefresh={loadBackendData} />

      {/* 5. Tertiary Grid: Live Activity Feed & Recovery Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveActivityFeed events={auditLog} />
        <RecoverySimulator initialPolicy={policyLimits} />
      </div>

      {/* 6. Audit Trail Ledger */}
      <AuditLedgerTable auditLog={auditLog} />

      {/* Transaction Deep Dive Drawer */}
      <TransactionDrawer
        transactionId={selectedTxId}
        onClose={() => setSelectedTxId(null)}
        onRefresh={loadBackendData}
      />
    </div>
  );
}
