'use client';

import React, { useState, useEffect } from 'react';
import { Users, CheckCircle2, AlertCircle, Calendar, RefreshCw, Edit3 } from 'lucide-react';
import { CustomSelect } from '@/components/CustomSelect';

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

export default function HRCompliancePage() {
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal / Editing states
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
  const [editForm, setEditForm] = useState({
    visaStatus: 'PENDING',
    visaExpiry: '',
    directDepositSet: false,
  });

  const fetchChecklists = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/hr/checklists');
      if (!res.ok) throw new Error('Failed to load compliance checklists.');
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

  const startEdit = (item: ChecklistItem) => {
    setEditingItem(item);
    setEditForm({
      visaStatus: item.visaStatus,
      visaExpiry: item.visaExpiry ? item.visaExpiry.slice(0, 10) : '',
      directDepositSet: item.directDepositSet,
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/hr/checklists', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingItem.id,
          visaStatus: editForm.visaStatus,
          visaExpiry: editForm.visaExpiry ? new Date(editForm.visaExpiry).toISOString() : null,
          directDepositSet: editForm.directDepositSet,
        }),
      });

      if (!res.ok) throw new Error('Failed to save compliance checklist updates.');

      const updated = await res.json();
      setChecklists(prev => prev.map(c => c.id === editingItem.id ? { ...c, ...updated } : c));
      setSuccess(`Checklist for ${editingItem.user?.name} updated successfully.`);
      setEditingItem(null);
      setTimeout(() => setSuccess(''), 2000);
    } catch (e: any) {
      setError(e.message || 'Error updating checklist.');
    }
  };

  // Filter out critical alerts
  const criticalItems = checklists.filter(c => c.visaStatus === 'EXPIRED' || (c.payrollHold && !c.directDepositSet));

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text-main flex items-center">
            <Users className="h-5 w-5 mr-2 text-primary shrink-0" />
            HR Compliance Control Center
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Audit work authorization validity, verify visa checkpoints, and manage onboarding checklists.
          </p>
        </div>
        <button
          onClick={fetchChecklists}
          disabled={loading}
          className="inline-flex items-center space-x-1.5 py-2 px-3 border border-border-main rounded-lg text-xs font-bold text-text-main bg-card-bg hover:bg-canvas-bg transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Checklists</span>
        </button>
      </div>

      {/* Alert Banner / Actionable items */}
      {criticalItems.length > 0 && (
        <div className="bg-status-danger/10 border border-status-danger/30 rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-status-danger/5 rounded-full filter blur-xl"></div>
          <h3 className="text-xs font-bold text-status-danger uppercase tracking-wider flex items-center">
            <AlertCircle className="h-4 w-4 mr-1.5 stroke-[2]" />
            Action Required: Onboarding Impediments Detected
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {criticalItems.map((item) => (
              <div key={item.id} className="bg-card-bg border border-border-main rounded-xl p-3.5 flex items-start space-x-3 text-xs shadow-sm">
                <AlertCircle className="h-4 w-4 text-status-danger shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-text-main">{item.user?.name}</h4>
                  <p className="text-text-muted mt-1 leading-relaxed">
                    {item.visaStatus === 'EXPIRED' ? (
                      <span className="text-status-danger font-semibold">Visa expiration alert: Work authorization has lapsed.</span>
                    ) : (
                      <span>Missing direct deposit details. Onboarding status restricted.</span>
                    )}
                  </p>
                  <button
                    onClick={() => startEdit(item)}
                    className="text-primary hover:underline font-bold mt-2 inline-flex items-center cursor-pointer"
                  >
                    Edit checklist
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* Main Compliance Grid */}
      {loading ? (
        <div className="bg-card-bg border border-border-main rounded-2xl p-12 text-center shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-muted text-xs font-medium">Fetching payroll compliance checklists...</p>
        </div>
      ) : (
        <div className="bg-card-bg border border-border-main rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 bg-canvas-bg border-b border-border-main">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Onboarding & Visa Records</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-main text-[10px] font-bold uppercase tracking-wider text-text-muted bg-canvas-bg/50">
                  <th className="px-6 py-3.5">Employee</th>
                  <th className="px-6 py-3.5">Corporate Position</th>
                  <th className="px-6 py-3.5">Visa Status</th>
                  <th className="px-6 py-3.5">Visa Expiration</th>
                  <th className="px-6 py-3.5">Direct Deposit Checkoff</th>
                  <th className="px-6 py-3.5">Compliance Hold</th>
                  <th className="px-6 py-3.5 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main text-xs">
                {checklists.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-text-muted">
                      No active checklists found.
                    </td>
                  </tr>
                ) : (
                  checklists.map((c) => (
                    <tr key={c.id} className="hover:bg-canvas-bg/25 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-text-main">{c.user?.name || 'Staff User'}</span>
                        <span className="block text-[10px] text-text-muted font-mono mt-0.5">{c.user?.email}</span>
                      </td>
                      <td className="px-6 py-4 text-text-muted">
                        {c.user?.profile ? (
                          <div>
                            <span className="font-semibold text-text-main">{c.user.profile.jobTitle}</span>
                            <span className="block text-[10px] text-text-muted mt-0.5">{c.user.profile.department}</span>
                          </div>
                        ) : (
                          'Employee'
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.visaStatus === 'VERIFIED'
                            ? 'bg-status-success/10 text-status-success'
                            : c.visaStatus === 'PENDING'
                            ? 'bg-status-warning/10 text-status-warning'
                            : c.visaStatus === 'EXPIRED'
                            ? 'bg-status-danger/10 text-status-danger'
                            : 'bg-slate-100 dark:bg-slate-800 text-text-muted'
                        }`}>
                          {c.visaStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-text-muted">
                        {c.visaExpiry ? (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3 opacity-60 shrink-0" />
                            <span className={c.visaStatus === 'EXPIRED' ? 'text-status-danger font-bold' : ''}>
                              {new Date(c.visaExpiry).toLocaleDateString()}
                            </span>
                          </div>
                        ) : (
                          <span className="opacity-50">Not Applicable</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.directDepositSet ? 'bg-status-success/10 text-status-success' : 'bg-status-warning/10 text-status-warning'
                        }`}>
                          {c.directDepositSet ? 'Configured' : 'Missing Information'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.payrollHold ? 'bg-status-danger/10 text-status-danger' : 'bg-status-success/10 text-status-success'
                        }`}>
                          {c.payrollHold ? 'Active Hold' : 'Cleared / Ready'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => startEdit(c)}
                          className="p-1.5 rounded-lg border border-border-main text-text-muted hover:text-primary hover:border-primary transition-colors cursor-pointer inline-flex items-center"
                          title="Edit compliance settings"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Editing Dialog Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card-bg border border-border-main rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent"></div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">
                Review Compliance: {editingItem.user?.name}
              </h3>
              
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-1">
                  Visa Verification Status
                </label>
                <CustomSelect
                  value={editForm.visaStatus}
                  onChange={(val) => setEditForm(prev => ({ ...prev, visaStatus: val }))}
                  options={[
                    { value: 'PENDING', label: 'PENDING' },
                    { value: 'VERIFIED', label: 'VERIFIED' },
                    { value: 'EXPIRED', label: 'EXPIRED' },
                    { value: 'NOT_REQUIRED', label: 'NOT REQUIRED' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-1">
                  Visa Expiry Date
                </label>
                <input
                  type="date"
                  value={editForm.visaExpiry}
                  onChange={(e) => setEditForm(prev => ({ ...prev, visaExpiry: e.target.value }))}
                  className="w-full px-3 py-2 border border-border-main rounded-xl bg-canvas-bg text-text-main text-xs focus:ring-1 focus:ring-primary focus:outline-none font-mono"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center space-x-2 text-xs font-bold text-text-main cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editForm.directDepositSet}
                    onChange={(e) => setEditForm(prev => ({ ...prev, directDepositSet: e.target.checked }))}
                    className="h-4 w-4 rounded border-border-main text-primary focus:ring-primary"
                  />
                  <span>Direct Deposit Confirmed</span>
                </label>
                <p className="text-[10px] text-text-muted mt-1 leading-normal ml-6">
                  Check if candidate has uploaded verified bank direct deposit documents.
                </p>
              </div>

              <div className="pt-4 border-t border-border-main flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border border-border-main rounded-xl text-xs font-bold text-text-muted hover:bg-canvas-bg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer"
                >
                  Save Compliance Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
