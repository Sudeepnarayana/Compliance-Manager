'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Users, ShieldAlert, CheckCircle, XCircle, Search, RefreshCw } from 'lucide-react';

interface UserItem {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: string;
  profile: {
    department: string | null;
    jobTitle: string | null;
  } | null;
}

interface AuditLogItem {
  id: string;
  userName?: string;
  action: string;
  resource: string;
  details: string;
  timestamp: string;
  user?: {
    email: string;
  } | null;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
  const [users, setUsers] = useState<UserItem[]>([]);
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [userSearch, setUserSearch] = useState('');
  const [logSearch, setLogSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, logsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/logs'),
      ]);

      if (!usersRes.ok || !logsRes.ok) {
        throw new Error('Failed to fetch admin dashboard records.');
      }

      const usersData = await usersRes.json();
      const logsData = await logsRes.json();

      setUsers(usersData);
      setLogs(logsData);
    } catch (e: any) {
      setError(e.message || 'An error occurred while loading data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: nextStatus }),
      });

      if (!res.ok) throw new Error('Status update failed.');
      
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: nextStatus } : u));
      setSuccess(`User status updated to ${nextStatus} successfully.`);
      setTimeout(() => setSuccess(''), 2000);
      
      // Refresh logs list to show the action
      const logsRes = await fetch('/api/admin/logs');
      if (logsRes.ok) setLogs(await logsRes.json());
    } catch (e: any) {
      setError(e.message || 'Failed to update user status.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRoleChange = async (userId: string, nextRole: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: nextRole }),
      });

      if (!res.ok) throw new Error('Role update failed.');
      
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: nextRole } : u));
      setSuccess(`User role updated to ${nextRole} successfully.`);
      setTimeout(() => setSuccess(''), 2000);

      // Refresh logs list to show the action
      const logsRes = await fetch('/api/admin/logs');
      if (logsRes.ok) setLogs(await logsRes.json());
    } catch (e: any) {
      setError(e.message || 'Failed to update user role.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredLogs = logs.filter(l => 
    l.action.toLowerCase().includes(logSearch.toLowerCase()) ||
    l.resource.toLowerCase().includes(logSearch.toLowerCase()) ||
    l.details.toLowerCase().includes(logSearch.toLowerCase()) ||
    (l.userName && l.userName.toLowerCase().includes(logSearch.toLowerCase()))
  );

  const rolesList = ['ADMIN', 'HR', 'PAYROLL', 'RECRUITER', 'ACCOUNTING', 'MANAGER', 'USER'];

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text-main flex items-center">
            <Shield className="h-5 w-5 mr-2 text-primary shrink-0" />
            Admin Command Console
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Global access list governance, role definitions, and system-wide operation logging.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center space-x-1.5 py-2 px-3 border border-border-main rounded-lg text-xs font-bold text-text-main bg-card-bg hover:bg-canvas-bg transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Records</span>
        </button>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-status-danger/10 border border-status-danger text-status-danger text-xs">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-status-success/10 border border-status-success text-status-success text-xs">
          {success}
        </div>
      )}

      {/* Navigation tabs */}
      <div className="border-b border-border-main flex space-x-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'users' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          User Directory ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'logs' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          Compliance Audit Trail ({logs.length})
        </button>
      </div>

      {loading ? (
        <div className="bg-card-bg border border-border-main rounded-2xl p-12 text-center shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-muted text-xs font-medium">Fetching administrative records...</p>
        </div>
      ) : (
        <>
          {/* USER MANAGEMENT TAB */}
          {activeTab === 'users' && (
            <div className="bg-card-bg border border-border-main rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 bg-canvas-bg border-b border-border-main flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">User Registrations</h3>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-9 pr-3 py-1.5 border border-border-main rounded-lg text-xs w-full bg-card-bg focus:outline-none placeholder-text-muted"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-main text-[10px] font-bold uppercase tracking-wider text-text-muted bg-canvas-bg/50">
                      <th className="px-6 py-3.5">Name</th>
                      <th className="px-6 py-3.5">Email</th>
                      <th className="px-6 py-3.5">Department & Job Title</th>
                      <th className="px-6 py-3.5">System Role</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main text-xs">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-text-muted">
                          No matching user profiles found.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((userItem) => (
                        <tr key={userItem.id} className="hover:bg-canvas-bg/25 transition-colors">
                          <td className="px-6 py-4 font-bold text-text-main">
                            {userItem.name || 'Uncompleted Profile'}
                          </td>
                          <td className="px-6 py-4 font-mono text-[11px] text-text-muted">
                            {userItem.email}
                          </td>
                          <td className="px-6 py-4 text-text-muted">
                            {userItem.profile ? (
                              <div>
                                <span className="font-semibold text-text-main">{userItem.profile.jobTitle}</span>
                                <span className="block text-[10px] text-text-muted mt-0.5">{userItem.profile.department}</span>
                              </div>
                            ) : (
                              'No profile seeded'
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={userItem.role}
                              onChange={(e) => handleRoleChange(userItem.id, e.target.value)}
                              className="px-2.5 py-1.5 border border-border-main rounded-lg text-xs bg-canvas-bg font-semibold text-text-main focus:ring-1 focus:ring-primary focus:outline-none"
                            >
                              {rolesList.map((r) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              userItem.status === 'ACTIVE'
                                ? 'bg-status-success/10 text-status-success'
                                : 'bg-status-danger/10 text-status-danger'
                            }`}>
                              {userItem.status === 'ACTIVE' ? (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              ) : (
                                <XCircle className="h-3 w-3 mr-1" />
                              )}
                              {userItem.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleStatusToggle(userItem.id, userItem.status)}
                              className={`py-1 px-2.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                                userItem.status === 'ACTIVE'
                                  ? 'border-status-danger text-status-danger hover:bg-status-danger/10'
                                  : 'border-status-success text-status-success hover:bg-status-success/10'
                              }`}
                            >
                              {userItem.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
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

          {/* AUDIT LOGS TAB */}
          {activeTab === 'logs' && (
            <div className="bg-card-bg border border-border-main rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 bg-canvas-bg border-b border-border-main flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Security Audit Trail</h3>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Filter audit logs..."
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    className="pl-9 pr-3 py-1.5 border border-border-main rounded-lg text-xs w-full bg-card-bg focus:outline-none placeholder-text-muted"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-main text-[10px] font-bold uppercase tracking-wider text-text-muted bg-canvas-bg/50">
                      <th className="px-6 py-3.5">Timestamp</th>
                      <th className="px-6 py-3.5">Actor</th>
                      <th className="px-6 py-3.5">Action Key</th>
                      <th className="px-6 py-3.5">Resource Scope</th>
                      <th className="px-6 py-3.5">Transaction Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main text-xs">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-text-muted">
                          No audit trail matching query found.
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((logItem) => (
                        <tr key={logItem.id} className="hover:bg-canvas-bg/25 transition-colors">
                          <td className="px-6 py-4 font-mono text-[11px] text-text-muted whitespace-nowrap">
                            {new Date(logItem.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-text-main">{logItem.userName || 'System'}</span>
                            {logItem.user?.email && (
                              <span className="block text-[10px] text-text-muted mt-0.5 font-mono">{logItem.user.email}</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-text-main px-2 py-0.5 rounded border border-border-main">
                              {logItem.action}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-text-muted uppercase font-bold text-[10px]">
                            {logItem.resource}
                          </td>
                          <td className="px-6 py-4 text-text-muted max-w-sm">
                            {logItem.details}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
