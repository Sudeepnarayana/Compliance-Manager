'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Send, CheckSquare, PlusCircle, ArrowRight, UserPlus, RefreshCw, BadgeAlert } from 'lucide-react';
import { CustomSelect } from '@/components/CustomSelect';

interface OfferItem {
  id: string;
  candidateName: string;
  candidateEmail: string;
  roleTitle: string;
  salary: number;
  status: string;
  createdAt: string;
}

export default function RecruiterPage() {
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [activeTab, setActiveTab] = useState<'offers' | 'create'>('offers');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    candidateName: '',
    candidateEmail: '',
    roleTitle: 'Consultant Engineer',
    salary: '115000',
  });

  const fetchOffers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/recruiter/offers');
      if (!res.ok) throw new Error('Failed to load candidate offers.');
      const data = await res.json();
      setOffers(data);
    } catch (e: any) {
      setError(e.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!formData.candidateName || !formData.candidateEmail || !formData.salary) {
      setError('Please fill in all candidate details.');
      return;
    }

    try {
      const res = await fetch('/api/recruiter/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Offer letters creation failed.');
      
      const newOffer = await res.json();
      setOffers(prev => [newOffer, ...prev]);
      setSuccess(`Draft offer letter for ${formData.candidateName} has been initialized.`);
      setActiveTab('offers');
      setFormData({ candidateName: '', candidateEmail: '', roleTitle: 'Consultant Engineer', salary: '115000' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) {
      setError(e.message || 'Error generating offer draft.');
    }
  };

  const handleStatusTransition = async (id: string, nextStatus: string, candidateName: string) => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/recruiter/offers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: nextStatus }),
      });

      if (!res.ok) throw new Error('Status transition failed.');

      const updated = await res.json();
      setOffers(prev => prev.map(o => o.id === id ? { ...o, ...updated } : o));
      setSuccess(`Offer letter status for ${candidateName} updated to ${nextStatus}.`);
      setTimeout(() => setSuccess(''), 2500);
    } catch (e: any) {
      setError(e.message || 'Error transitioning status.');
    }
  };

  const handleOnboardCandidate = async (offer: OfferItem) => {
    setError('');
    setSuccess('');
    
    // Simulate candidate onboarding: create user and write audit
    try {
      // Auto-register employee
      const firstName = offer.candidateName.split(' ')[0];
      const lastName = offer.candidateName.split(' ').slice(1).join(' ') || 'Candidate';
      
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: offer.candidateEmail,
          password: 'password123',
          name: offer.candidateName,
          role: 'USER',
          firstName,
          lastName,
          department: 'Delivery Solutions',
          jobTitle: offer.roleTitle
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to onboard candidate into active directory.');
      }

      // Transition offer to final archives
      await handleStatusTransition(offer.id, 'HR_APPROVED', offer.candidateName);
      setSuccess(`Candidate ${offer.candidateName} successfully onboarded! Active checklist generated in HR & Payroll queue.`);
      setTimeout(() => setSuccess(''), 4000);
    } catch (e: any) {
      setError(e.message || 'Onboarding trigger failed.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-slate-100 dark:bg-slate-800 text-text-muted border border-border-main';
      case 'SENT':
        return 'bg-status-warning/10 text-status-warning border border-status-warning/20';
      case 'CANDIDATE_ACCEPTED':
        return 'bg-status-success/20 text-status-success border border-status-success/30 font-extrabold';
      case 'HR_APPROVED':
        return 'bg-status-info/10 text-status-info border border-status-info/20';
      case 'REJECTED':
        return 'bg-status-danger/10 text-status-danger border border-status-danger/20';
      default:
        return 'bg-slate-100 text-text-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text-main flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary shrink-0" />
            Talent Acquisition & Offer Hub
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Construct candidate offer letters, route for manager authorizations, and sync onboarding transitions (n8n.io active integration).
          </p>
        </div>
        <button
          onClick={fetchOffers}
          disabled={loading}
          className="inline-flex items-center space-x-1.5 py-2 px-3 border border-border-main rounded-lg text-xs font-bold text-text-main bg-card-bg hover:bg-canvas-bg transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Offers</span>
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

      {/* Tabs */}
      <div className="border-b border-border-main flex space-x-6">
        <button
          onClick={() => setActiveTab('offers')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'offers' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          Active Offers ({offers.length})
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'create' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          <span className="flex items-center">
            <PlusCircle className="h-4 w-4 mr-1.5 shrink-0" />
            Create Offer Letter
          </span>
        </button>
      </div>

      {loading ? (
        <div className="bg-card-bg border border-border-main rounded-2xl p-12 text-center shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-muted text-xs font-medium">Fetching candidate offer indexes...</p>
        </div>
      ) : (
        <>
          {/* OFFERS TAB */}
          {activeTab === 'offers' && (
            <div className="bg-card-bg border border-border-main rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 bg-canvas-bg border-b border-border-main">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Offer Letters Registry</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-main text-[10px] font-bold uppercase tracking-wider text-text-muted bg-canvas-bg/50">
                      <th className="px-6 py-3.5">Candidate Details</th>
                      <th className="px-6 py-3.5">Designated Position</th>
                      <th className="px-6 py-3.5">Offered Salary</th>
                      <th className="px-6 py-3.5">Status Code</th>
                      <th className="px-6 py-3.5">Created Date</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main text-xs">
                    {offers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-text-muted">
                          No active offer letters drafted.
                        </td>
                      </tr>
                    ) : (
                      offers.map((offer) => (
                        <tr key={offer.id} className="hover:bg-canvas-bg/25 transition-colors">
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
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(offer.status)}`}>
                              {offer.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-text-muted">
                            {new Date(offer.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {offer.status === 'DRAFT' && (
                              <button
                                onClick={() => handleStatusTransition(offer.id, 'SENT', offer.candidateName)}
                                className="py-1 px-2.5 rounded-lg text-[10px] font-bold border border-primary text-primary hover:bg-primary/10 transition-colors cursor-pointer inline-flex items-center space-x-1"
                              >
                                <Send className="h-3 w-3 mr-0.5" />
                                <span>Request Manager Sign</span>
                              </button>
                            )}
                            {offer.status === 'SENT' && (
                              <span className="text-[10px] text-text-muted font-semibold italic">
                                Pending Manager authorization
                              </span>
                            )}
                            {offer.status === 'CANDIDATE_ACCEPTED' && (
                              <button
                                onClick={() => handleOnboardCandidate(offer)}
                                className="py-1 px-2.5 rounded-lg text-[10px] font-bold bg-status-success hover:bg-emerald-600 text-white transition-colors cursor-pointer inline-flex items-center space-x-1 shadow-sm"
                              >
                                <UserPlus className="h-3 w-3 mr-0.5" />
                                <span>Onboard Employee</span>
                              </button>
                            )}
                            {offer.status === 'HR_APPROVED' && (
                              <span className="text-[10px] text-status-success font-bold flex items-center justify-end">
                                <CheckSquare className="h-3.5 w-3.5 mr-1" />
                                Onboarded
                              </span>
                            )}
                            {offer.status === 'REJECTED' && (
                              <span className="text-[10px] text-status-danger font-bold">
                                Declined by Candidate
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CREATE TAB */}
          {activeTab === 'create' && (
            <div className="bg-card-bg border border-border-main rounded-2xl shadow-sm overflow-hidden w-full max-w-2xl">
              <div className="p-4 bg-canvas-bg border-b border-border-main flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Draft New Offer Letter</h3>
                <span className="text-[9px] bg-sky-500/10 text-sky-600 font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                  Wizard Mode
                </span>
              </div>
              <form onSubmit={handleCreateOffer} className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase mb-1">
                      Candidate Full Name <span className="text-status-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="candidateName"
                      required
                      value={formData.candidateName}
                      onChange={handleInputChange}
                      placeholder="Jane Doe"
                      className="w-full px-3 py-2 border border-border-main rounded-xl bg-canvas-bg text-text-main text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase mb-1">
                      Candidate Email Address <span className="text-status-danger">*</span>
                    </label>
                    <input
                      type="email"
                      name="candidateEmail"
                      required
                      value={formData.candidateEmail}
                      onChange={handleInputChange}
                      placeholder="jane.doe@example.com"
                      className="w-full px-3 py-2 border border-border-main rounded-xl bg-canvas-bg text-text-main text-xs focus:ring-1 focus:ring-primary focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase mb-1">
                      Corporate Job Title
                    </label>
                    <CustomSelect
                      value={formData.roleTitle}
                      onChange={(val) => setFormData(prev => ({ ...prev, roleTitle: val }))}
                      options={[
                        { value: 'Consultant Engineer', label: 'Consultant Engineer' },
                        { value: 'Senior System Engineer', label: 'Senior System Engineer' },
                        { value: 'Project Manager', label: 'Project Manager' },
                        { value: 'HR Advisor', label: 'HR Advisor' },
                        { value: 'Accounting Analyst', label: 'Accounting Analyst' },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase mb-1">
                      Salary (USD / Year) <span className="text-status-danger">*</span>
                    </label>
                    <input
                      type="number"
                      name="salary"
                      required
                      value={formData.salary}
                      onChange={handleInputChange}
                      placeholder="115000"
                      className="w-full px-3 py-2 border border-border-main rounded-xl bg-canvas-bg text-text-main text-xs focus:ring-1 focus:ring-primary focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="p-4 bg-canvas-bg rounded-xl border border-border-main text-xs space-y-2 leading-relaxed">
                  <h4 className="font-bold text-text-main flex items-center">
                    <BadgeAlert className="h-4 w-4 mr-1 text-primary" />
                    Automated Workflow Notice (n8n)
                  </h4>
                  <p className="text-text-muted">
                    Submitting this form initiates an offer draft. Requesting manager approval routes an authorization alert to operations. Once authorized, candidates receive action links to accept the offer, which can then be onboarded directly into employee records.
                  </p>
                </div>

                <div className="pt-4 border-t border-border-main flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('offers')}
                    className="px-4 py-2 border border-border-main rounded-xl text-xs font-bold text-text-muted hover:bg-canvas-bg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer flex items-center"
                  >
                    <span>Draft Offer Letter</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}
