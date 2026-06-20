'use client';

import React, { useState, useEffect } from 'react';
import { Scale, ShieldCheck, FileSpreadsheet, PlusCircle, RefreshCw, CheckCircle, UploadCloud, AlertCircle } from 'lucide-react';

interface DisputeItem {
  id: string;
  amount: number;
  status: string;
  disputeReason: string;
  resolution: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
  } | null;
}

export default function AccountingPage() {
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Resolution form states
  const [resolvingItem, setResolvingItem] = useState<DisputeItem | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  // Upload simulation states
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [evidenceList, setEvidenceList] = useState([
    { id: 1, name: 'Q1_direct_deposit_audit_report.pdf', size: '1.2 MB', date: '6/15/2026' },
    { id: 2, name: 'State_tax_registry_reconciliation_2026.xlsx', size: '4.8 MB', date: '6/18/2026' },
  ]);

  const fetchDisputes = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/accounting/disputes');
      if (!res.ok) throw new Error('Failed to load payment disputes.');
      const data = await res.json();
      setDisputes(data);
    } catch (e: any) {
      setError(e.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingItem || !resolutionText) return;

    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/accounting/disputes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: resolvingItem.id,
          status: 'RESOLVED',
          resolution: resolutionText,
        }),
      });

      if (!res.ok) throw new Error('Failed to submit dispute resolution.');

      const updated = await res.json();
      setDisputes(prev => prev.map(d => d.id === resolvingItem.id ? { ...d, ...updated } : d));
      setSuccess(`Dispute for ${resolvingItem.user?.name} resolved successfully.`);
      setResolvingItem(null);
      setResolutionText('');
      setTimeout(() => setSuccess(''), 2500);
    } catch (e: any) {
      setError(e.message || 'Error resolving dispute.');
    }
  };

  const handleSimulatedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploading(false);
            setEvidenceList(current => [
              {
                id: Date.now(),
                name: file.name,
                size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                date: new Date().toLocaleDateString()
              },
              ...current
            ]);
            setSuccess('Evidence document uploaded and cataloged in Audit Evidence Repository.');
            setTimeout(() => setSuccess(''), 3000);
          }, 300);
          return 100;
        }
        return prev + 20;
      });
    }, 100);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text-main flex items-center">
            <Scale className="h-5 w-5 mr-2 text-primary shrink-0" />
            Accounting Ledger & Disputes Tracker
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Resolve employee paystub discrepancies, log adjustments, and upload proof documents for the Audit Evidence Repository.
          </p>
        </div>
        <button
          onClick={fetchDisputes}
          disabled={loading}
          className="inline-flex items-center space-x-1.5 py-2 px-3 border border-border-main rounded-lg text-xs font-bold text-text-main bg-card-bg hover:bg-canvas-bg transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Disputes</span>
        </button>
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

      {/* Split view: Disputes ledger & File Repository */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ledger */}
        <div className="bg-card-bg border border-border-main rounded-2xl shadow-sm overflow-hidden lg:col-span-2">
          <div className="p-4 bg-canvas-bg border-b border-border-main">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Payment Disputes Ledger</h3>
          </div>
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-text-muted text-xs font-medium">Fetching payment dispute files...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-main text-[10px] font-bold uppercase tracking-wider text-text-muted bg-canvas-bg/50">
                    <th className="px-5 py-3.5">Employee</th>
                    <th className="px-5 py-3.5">Disputed Amount</th>
                    <th className="px-5 py-3.5">Discrepancy Reason</th>
                    <th className="px-5 py-3.5">Resolution Notes</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main text-xs">
                  {disputes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-text-muted">
                        No active payment disputes logged.
                      </td>
                    </tr>
                  ) : (
                    disputes.map((d) => (
                      <tr key={d.id} className="hover:bg-canvas-bg/25 transition-colors">
                        <td className="px-5 py-4">
                          <span className="font-bold text-text-main">{d.user?.name || 'Staff member'}</span>
                          <span className="block text-[10px] text-text-muted font-mono mt-0.5">{d.user?.email}</span>
                        </td>
                        <td className="px-5 py-4 font-mono font-bold text-text-main">
                          ${d.amount.toLocaleString()}
                        </td>
                        <td className="px-5 py-4 text-text-muted leading-relaxed max-w-xs">
                          {d.disputeReason}
                        </td>
                        <td className="px-5 py-4 text-text-muted italic max-w-xs">
                          {d.resolution || <span className="opacity-50">Pending investigation...</span>}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            d.status === 'RESOLVED'
                              ? 'bg-status-success/10 text-status-success'
                              : d.status === 'UNDER_REVIEW'
                              ? 'bg-status-warning/10 text-status-warning'
                              : 'bg-status-danger/10 text-status-danger'
                          }`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          {d.status !== 'RESOLVED' ? (
                            <button
                              onClick={() => setResolvingItem(d)}
                              className="py-1 px-2.5 rounded-lg text-[10px] font-bold border border-primary text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                            >
                              Resolve Issue
                            </button>
                          ) : (
                            <span className="text-status-success font-bold text-[10px] flex items-center justify-end">
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              Resolved
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Evidence cabinet */}
        <div className="space-y-6">
          {/* Uploader Card */}
          <div className="bg-card-bg border border-border-main rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Audit Evidence Repository
            </h3>
            
            <div className="border-2 border-dashed border-border-main hover:border-primary rounded-xl p-6 text-center transition-colors relative cursor-pointer group">
              <input
                type="file"
                onChange={handleSimulatedUpload}
                disabled={uploading}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <UploadCloud className="h-8 w-8 text-text-muted group-hover:text-primary mx-auto transition-colors stroke-[1.5]" />
              <p className="text-xs font-bold text-text-main mt-3">Upload Compliance Audit Proof</p>
              <p className="text-[10px] text-text-muted mt-1 leading-normal">
                Drag-and-drop PDF checklists, state tax registrations, or bank receipts here. Max size 10MB.
              </p>
            </div>

            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-primary">Uploading evidence file...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-canvas-bg h-1.5 rounded-full overflow-hidden border border-border-main">
                  <div
                    className="bg-primary h-full transition-all duration-100"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Evidence Catalog List */}
          <div className="bg-card-bg border border-border-main rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Evidence Log Archive
            </h4>
            <div className="divide-y divide-border-main">
              {evidenceList.map((doc) => (
                <div key={doc.id} className="py-2.5 flex items-center justify-between text-xs hover:bg-canvas-bg/20 rounded-lg px-1 transition-colors">
                  <div className="flex items-center space-x-2 truncate pr-2">
                    <FileSpreadsheet className="h-4 w-4 text-emerald-600 shrink-0" />
                    <div className="truncate">
                      <p className="font-bold text-text-main truncate">{doc.name}</p>
                      <p className="text-[10px] text-text-muted mt-0.5">{doc.size} • Uploaded {doc.date}</p>
                    </div>
                  </div>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-600 font-bold px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wider flex items-center">
                    <ShieldCheck className="h-3 w-3 mr-0.5 stroke-[2]" />
                    Vaulted
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Resolve Dispute Modal */}
      {resolvingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card-bg border border-border-main rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent"></div>
            
            <form onSubmit={handleResolveSubmit} className="p-6 space-y-4">
              <div className="flex items-center space-x-2">
                <Scale className="h-5 w-5 text-primary shrink-0" />
                <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">
                  Dispute Resolution File
                </h3>
              </div>
              
              <div className="bg-canvas-bg p-3.5 rounded-xl border border-border-main text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-semibold text-text-muted">Employee:</span>
                  <span className="font-bold text-text-main">{resolvingItem.user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-text-muted">Amount:</span>
                  <span className="font-bold text-text-main font-mono">${resolvingItem.amount.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-border-main leading-relaxed">
                  <span className="font-semibold text-text-muted block mb-1">Stated Reason:</span>
                  <span className="text-text-main italic">"{resolvingItem.disputeReason}"</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-1">
                  Settlement & Adjustment Notes <span className="text-status-danger">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  placeholder="Detail correction payload (e.g. payout amount reimbursed in June pay stub, tax withholdings corrected in registry)."
                  className="w-full px-3 py-2 border border-border-main rounded-xl bg-canvas-bg text-text-main text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-border-main flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setResolvingItem(null)}
                  className="px-4 py-2 border border-border-main rounded-xl text-xs font-bold text-text-muted hover:bg-canvas-bg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
