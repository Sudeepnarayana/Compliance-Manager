'use client';

import React, { useState, useEffect } from 'react';
import { ClipboardCheck, FileCheck2, UserCheck, XCircle, RefreshCw, Eye } from 'lucide-react';

interface OfferItem {
  id: string;
  candidateName: string;
  candidateEmail: string;
  roleTitle: string;
  salary: number;
  status: string;
  createdAt: string;
}

export default function ManagerPage() {
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Viewing details modal
  const [viewingItem, setViewingItem] = useState<OfferItem | null>(null);

  const fetchPendingApprovals = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/recruiter/offers');
      if (!res.ok) throw new Error('Failed to load candidate approvals.');
      const data: OfferItem[] = await res.json();
      
      // Managers sign off on offer letters in SENT status
      setOffers(data.filter(o => o.status === 'SENT'));
    } catch (e: any) {
      setError(e.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const handleApproval = async (id: string, approve: boolean, candidateName: string) => {
    const nextStatus = approve ? 'CANDIDATE_ACCEPTED' : 'REJECTED';
    setError('');
    setSuccess('');
    
    try {
      const res = await fetch('/api/recruiter/offers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: nextStatus }),
      });

      if (!res.ok) throw new Error(`Failed to submit authorization.`);

      setOffers(prev => prev.filter(o => o.id !== id));
      setViewingItem(null);
      setSuccess(`Candidate offer for ${candidateName} has been ${approve ? 'AUTHORIZED' : 'REJECTED'}.`);
      setTimeout(() => setSuccess(''), 2500);
    } catch (e: any) {
      setError(e.message || 'Error processing authorization request.');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text-main flex items-center">
            <ClipboardCheck className="h-5 w-5 mr-2 text-primary shrink-0" />
            Operations Authorization Center
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Sign off on pending candidate offers, verify compensation budgets, and release workforce pipeline workflows.
          </p>
        </div>
        <button
          onClick={fetchPendingApprovals}
          disabled={loading}
          className="inline-flex items-center space-x-1.5 py-2 px-3 border border-border-main rounded-lg text-xs font-bold text-text-main bg-card-bg hover:bg-canvas-bg transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Approvals</span>
        </button>
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-4 rounded-xl bg-status-success/10 border border-status-success text-status-success text-xs font-bold">
          {success}
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl bg-status-danger/10 border border-status-danger text-status-danger text-xs font-bold">
          {error}
        </div>
      )}

      {/* Approvals Queue */}
      {loading ? (
        <div className="bg-card-bg border border-border-main rounded-2xl p-12 text-center shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-muted text-xs font-medium">Fetching operation approvals queue...</p>
        </div>
      ) : (
        <div className="bg-card-bg border border-border-main rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 bg-canvas-bg border-b border-border-main flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Manager Approvals Queue</h3>
            <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded">
              {offers.length} Pending Actions
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-main text-[10px] font-bold uppercase tracking-wider text-text-muted bg-canvas-bg/50">
                  <th className="px-6 py-3.5">Requested Action</th>
                  <th className="px-6 py-3.5">Candidate Details</th>
                  <th className="px-6 py-3.5">Proposed Position</th>
                  <th className="px-6 py-3.5">Compensation Budget</th>
                  <th className="px-6 py-3.5 font-mono">Workflow Trigger</th>
                  <th className="px-6 py-3.5 text-right">Approve / Decline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main text-xs">
                {offers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                      No pending authorization requests. All pipelines clear!
                    </td>
                  </tr>
                ) : (
                  offers.map((offer) => (
                    <tr key={offer.id} className="hover:bg-canvas-bg/25 transition-colors">
                      <td className="px-6 py-4 font-bold text-text-main">
                        Authorize Offer Letter
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-text-main">{offer.candidateName}</span>
                        <span className="block text-[10px] text-text-muted font-mono mt-0.5">{offer.candidateEmail}</span>
                      </td>
                      <td className="px-6 py-4 text-text-muted font-semibold">
                        {offer.roleTitle}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-text-main">
                        ${offer.salary.toLocaleString()}/yr
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-[9px] bg-slate-100 dark:bg-slate-800 text-text-main px-1.5 py-0.5 rounded border border-border-main">
                          n8n_offer_letter_v2
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => setViewingItem(offer)}
                          className="p-1.5 rounded-lg border border-border-main text-text-muted hover:text-primary hover:border-primary transition-colors cursor-pointer inline-flex items-center"
                          title="Inspect details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleApproval(offer.id, false, offer.candidateName)}
                          className="py-1.5 px-3 rounded-lg text-[10px] font-bold border border-status-danger text-status-danger hover:bg-status-danger/10 transition-colors cursor-pointer inline-flex items-center space-x-1"
                        >
                          <XCircle className="h-3.5 w-3.5 mr-0.5 shrink-0" />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() => handleApproval(offer.id, true, offer.candidateName)}
                          className="py-1.5 px-3 rounded-lg text-[10px] font-bold bg-primary hover:bg-primary-hover text-white transition-colors cursor-pointer inline-flex items-center space-x-1 shadow-sm"
                        >
                          <UserCheck className="h-3.5 w-3.5 mr-0.5 shrink-0" />
                          <span>Approve</span>
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

      {/* Inspect Item Modal */}
      {viewingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card-bg border border-border-main rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent"></div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-2">
                <FileCheck2 className="h-5 w-5 text-primary shrink-0" />
                <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">
                  Review Candidate Offer Letter
                </h3>
              </div>
              
              <div className="divide-y divide-border-main text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="font-semibold text-text-muted">Candidate:</span>
                  <span className="font-bold text-text-main">{viewingItem.candidateName}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="font-semibold text-text-muted">Email:</span>
                  <span className="font-bold text-text-main font-mono">{viewingItem.candidateEmail}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="font-semibold text-text-muted">Target Position:</span>
                  <span className="font-bold text-text-main">{viewingItem.roleTitle}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="font-semibold text-text-muted">Salary Offer:</span>
                  <span className="font-bold text-text-main font-mono">${viewingItem.salary.toLocaleString()}/yr</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="font-semibold text-text-muted">Created On:</span>
                  <span className="font-bold text-text-main">{new Date(viewingItem.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border-main flex justify-end space-x-2">
                <button
                  onClick={() => setViewingItem(null)}
                  className="px-4 py-2 border border-border-main rounded-xl text-xs font-bold text-text-muted hover:bg-canvas-bg transition-colors cursor-pointer"
                >
                  Close Inspection
                </button>
                <button
                  onClick={() => handleApproval(viewingItem.id, false, viewingItem.candidateName)}
                  className="px-4 py-2 border border-status-danger text-status-danger rounded-xl text-xs font-bold hover:bg-status-danger/10 transition-colors cursor-pointer"
                >
                  Decline Offer
                </button>
                <button
                  onClick={() => handleApproval(viewingItem.id, true, viewingItem.candidateName)}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Approve Offer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
