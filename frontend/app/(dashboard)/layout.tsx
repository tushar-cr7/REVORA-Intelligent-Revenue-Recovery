'use client';

import React, { useState, useCallback } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { api } from '@/lib/api';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isScanning, setIsScanning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleScan = useCallback(async () => {
    setIsScanning(true);
    try {
      await api.scanRevenue(100, 42);
      await api.analyzeRevenue();
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  }, []);

  const handleAnalyze = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      await api.analyzeRevenue();
    } catch (err) {
      console.error('Analyze error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-canvas text-text-primary flex flex-col">
      <Header
        onScan={handleScan}
        onAnalyze={handleAnalyze}
        isScanning={isScanning}
        isAnalyzing={isAnalyzing}
      />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
