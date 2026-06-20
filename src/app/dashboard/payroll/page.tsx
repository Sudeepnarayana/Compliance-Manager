'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, ShieldAlert, CheckCircle2, AlertCircle, RefreshCw, HelpCircle } from 'lucide-react';

interface ChecklistItem {
  id: string;
  visaStatus: string;
  visaExpiry: string | null;
  directDepositSet: boolean;
  stateRegistered: boolean;
  payrollHold: boolean;
  user: {
    name: string;
    email: string;
    profile: {
      department: string;
      jobTitle: string;
    } | null;
  } | null;
}

export default function PayrollPage() {
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchChecklists = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/hr/checklists');
      if (!res.ok) throw new Error('Failed to load payroll readiness checklists.');
      const data = await res.json();
      setChecklists(data);
    } catch (e: any) {
      setError(e.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChecklists();
  }, []);

  const handleToggleHold = async (id: string, currentHold: boolean, employeeName: string) => {
    const nextHold = !currentHold;
    setError('');
    setSuccess('');
    
    try {
      const res = await fetch('/api/hr/checklists', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, payrollHold: nextHold }),
      });

      if (!res.ok) throw new Error('Failed to toggle payroll hold.');

      const updated = await res.json();
      setChecklists(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
      setSuccess(`Payroll hold for ${employeeName} has been ${nextHold ? 'activated' : 'released'}.`);
      setTimeout(() => setSuccess(''), 2500);
    } catch (e: any) {
      setError(e.message || 'Error updating payroll hold.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleToggleStateRegistered = async (id: string, currentState: boolean, employeeName: string) => {
    const nextState = !currentState;
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/hr/checklists', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stateRegistered: nextState }),
      });

      if (!res.ok) throw new Error('Failed to update state registration status.');

      const updated = await res.json();
      setChecklists(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
      setSuccess(`State tax registration for ${employeeName} has been updated.`);
      setTimeout(() => setSuccess(''), 2000);
    } catch (e: any) {
      setError(e.message || 'Error updating tax registry.');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Stats calculation
  const totalEmployees = checklists.length;
  const onHoldCount = checklists.filter(c => c.payrollHold).length;
  const readyToPayCount = totalEmployees - onHoldCount;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text-main flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-primary shrink-0" />
            Payroll Readiness Controls
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Authorize pay periods, audit state tax registrations, and release payroll holds on compliant onboarding assets.
          </p>
        </div>
        <button
          onClick={fetchChecklists}
          disabled={loading}
          className="inline-flex items-center space-x-1.5 py-2 px-3 border border-border-main rounded-lg text-xs font-bold text-text-main bg-card-bg hover:bg-canvas-bg transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Payroll Data</span>
        </button>
      </div>

      {/* Metric scoreboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card-bg border border-border-main rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Total Checklists</p>
          <h3 className="text-lg font-black text-text-main mt-1">{totalEmployees}</h3>
        </div>
        <div className="bg-card-bg border border-border-main rounded-xl p-4 shadow-sm border-l-4 border-l-status-success">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Cleared for Payroll</p>
          <h3 className="text-lg font-black text-status-success mt-1">{readyToPayCount}</h3>
        </div>
        <div className="bg-card-bg border border-border-main rounded-xl p-4 shadow-sm border-l-4 border-l-status-danger">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">On Payroll Hold</p>
          <h3 className="text-lg font-black text-status-danger mt-1">{onHoldCount}</h3>
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-4 rounded-xl bg-status-success/10 border border-status-success text-status-success text-xs">
          {success}
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl bg-status-danger/10 border border-status-danger text-status-danger text-xs">
          {error}
        </div>
      )}

      {/* Payroll Readiness Table */}
      {loading ? (
        <div className="bg-card-bg border border-border-main rounded-2xl p-12 text-center shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-muted text-xs font-medium">Fetching payroll checklist files...</p>
        </div>
      ) : (
        <div className="bg-card-bg border border-border-main rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 bg-canvas-bg border-b border-border-main">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Onboarding Pay-Run Registry</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-main text-[10px] font-bold uppercase tracking-wider text-text-muted bg-canvas-bg/50">
                  <th className="px-6 py-3.5">Employee Details</th>
                  <th className="px-6 py-3.5">Visa Status</th>
                  <th className="px-6 py-3.5">Direct Deposit Checkoff</th>
                  <th className="px-6 py-3.5">State Tax Registration</th>
                  <th className="px-6 py-3.5">Checklist Ready</th>
                  <th className="px-6 py-3.5 text-center">Payment Hold Release</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main text-xs">
                {checklists.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-text-muted">
                      No matching employee records.
                    </td>
                  </tr>
                ) : (
                  checklists.map((c) => {
                    const hasVisaIssue = c.visaStatus === 'EXPIRED' || c.visaStatus === 'PENDING';
                    const hasDepositIssue = !c.directDepositSet;
                    const isSystemReady = !hasVisaIssue && !hasDepositIssue && c.stateRegistered;
                    
                    return (
                      <tr key={c.id} className="hover:bg-canvas-bg/25 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-bold text-text-main">{c.user?.name || 'Employee User'}</span>
                          <span className="block text-[10px] text-text-muted font-mono mt-0.5">{c.user?.email}</span>
                          {c.user?.profile && (
                            <span className="block text-[9px] bg-slate-100 dark:bg-slate-800 text-text-muted px-1.5 py-0.5 rounded w-max mt-1">
                              {c.user.profile.jobTitle} • {c.user.profile.department}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.visaStatus === 'VERIFIED'
                              ? 'bg-status-success/10 text-status-success'
                              : 'bg-status-danger/10 text-status-danger'
                          }`}>
                            {c.visaStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.directDepositSet ? 'bg-status-success/10 text-status-success' : 'bg-status-warning/10 text-status-warning'
                          }`}>
                            {c.directDepositSet ? 'Configured' : 'Missing Bank Detail'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleStateRegistered(c.id, c.stateRegistered, c.user?.name || '')}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                              c.stateRegistered
                                ? 'border-status-success text-status-success hover:bg-status-success/5'
                                : 'border-status-warning text-status-warning hover:bg-status-warning/5'
                            }`}
                          >
                            {c.stateRegistered ? 'Registered' : 'Not Registered'}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center text-[10px] font-bold ${
                            isSystemReady ? 'text-status-success' : 'text-status-warning'
                          }`}>
                            {isSystemReady ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-1 text-status-success shrink-0" />
                                <span>Compliant</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-4 w-4 mr-1 text-status-warning shrink-0" />
                                <span>Impeded</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleToggleHold(c.id, c.payrollHold, c.user?.name || '')}
                            className={`py-1.5 px-3 rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer border ${
                              c.payrollHold
                                ? 'border-status-danger text-status-danger bg-status-danger/5 hover:bg-status-danger/15'
                                : 'border-status-success text-status-success bg-status-success/5 hover:bg-status-success/15'
                            }`}
                          >
                            {c.payrollHold ? 'RELEASE HOLD' : 'PLACE HOLD'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
