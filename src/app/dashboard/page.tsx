'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Users,
  FileCheck,
  AlertTriangle,
  ClipboardList,
  ArrowRight,
  TrendingUp,
  Fingerprint,
  Calendar,
  Layers
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function OverviewDashboard() {
  const { data: session } = useSession();
  const user = session?.user;

  // Mocked global stats for metrics
  const stats = {
    activeEmployees: 10,
    visasVerified: 6,
    activeOffers: 3,
    openDisputes: 2,
    pendingApprovals: 1
  };

  // Recharts metric data
  const dataOffers = [
    { name: 'Draft', count: 1 },
    { name: 'Sent', count: 0 },
    { name: 'HR Approved', count: 1 },
    { name: 'Accepted', count: 1 },
    { name: 'Rejected', count: 0 }
  ];

  const dataVisaDistribution = [
    { name: 'Verified', value: 6, color: '#10b981' },
    { name: 'Pending', value: 2, color: '#f59e0b' },
    { name: 'Expired', value: 2, color: '#ef4444' },
  ];

  // Quick shortcuts for dashboard exploration
  const rolePortals = [
    { name: 'Admin Console', href: '/dashboard/admin', role: 'ADMIN', desc: 'Manage user credentials, states, and system audit logs.' },
    { name: 'HR Compliance', href: '/dashboard/hr', role: 'HR', desc: 'Onboard candidates, verify visa files, and track I-9 states.' },
    { name: 'Payroll Readiness', href: '/dashboard/payroll', role: 'PAYROLL', desc: 'Direct deposit checkoffs, state tax registries, and payroll holds.' },
    { name: 'Talent Acquisition', href: '/dashboard/recruiter', role: 'RECRUITER', desc: 'Draft candidate offer letters and trigger workflow simulations.' },
    { name: 'Accounting Log', href: '/dashboard/accounting', role: 'ACCOUNTING', desc: 'Investigate payment dispute tickets and audit evidence.' },
    { name: 'Manager Approvals', href: '/dashboard/manager', role: 'MANAGER', desc: 'Authorize candidate offers, expense logs, and offboard alerts.' }
  ];

  const visiblePortals = rolePortals.filter(p => p.role === user?.role || user?.role === 'ADMIN');

  return (
    <div className="space-y-6">
      {/* Welcome Hero */}
      <div className="bg-card-bg border border-border-main rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl -z-10"></div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-main">
              Welcome back, {user?.name || 'Enterprise User'}
            </h1>
            <p className="text-xs text-text-muted mt-1">
              Workforce Compliance Control Tower • Environment: <code className="bg-canvas-bg border border-border-main px-1.5 py-0.5 rounded font-mono text-[10px]">PRODUCTION-DEV</code>
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-text-muted">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="font-semibold">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1 */}
        <div className="bg-card-bg border border-border-main rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Active Employees</p>
            <h3 className="text-xl font-black text-text-main mt-1">{stats.activeEmployees}</h3>
            <span className="text-[10px] text-status-success font-semibold flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +15% MoM
            </span>
          </div>
          <div className="h-10 w-10 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-card-bg border border-border-main rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Visas Verified</p>
            <h3 className="text-xl font-black text-text-main mt-1">{stats.visasVerified}</h3>
            <span className="text-[10px] text-text-muted font-semibold flex items-center mt-1">
              60% Compliance rate
            </span>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <FileCheck className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-card-bg border border-border-main rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Active Offers</p>
            <h3 className="text-xl font-black text-text-main mt-1">{stats.activeOffers}</h3>
            <span className="text-[10px] text-status-warning font-semibold flex items-center mt-1">
              1 Pending manager sign
            </span>
          </div>
          <div className="h-10 w-10 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center">
            <ClipboardList className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-card-bg border border-border-main rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Open Disputes</p>
            <h3 className="text-xl font-black text-text-main mt-1">{stats.openDisputes}</h3>
            <span className="text-[10px] text-status-danger font-semibold flex items-center mt-1">
              Requires Accounting review
            </span>
          </div>
          <div className="h-10 w-10 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 5 */}
        <div className="bg-card-bg border border-border-main rounded-xl p-4 shadow-sm flex items-center justify-between col-span-2 lg:col-span-1">
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Manager Actions</p>
            <h3 className="text-xl font-black text-text-main mt-1">{stats.pendingApprovals}</h3>
            <span className="text-[10px] text-status-success font-semibold flex items-center mt-1">
              Approve/reject queues
            </span>
          </div>
          <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <FileCheck className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Analytics Graph Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph 1 */}
        <div className="bg-card-bg border border-border-main rounded-2xl p-5 shadow-sm lg:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-4">
            Candidate Offer Status Distribution
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataOffers} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-main)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-main)' }}
                  labelStyle={{ color: 'var(--text-main)', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 2 */}
        <div className="bg-card-bg border border-border-main rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-4">
            Visa Compliance Status Ratio
          </h3>
          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataVisaDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {dataVisaDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-4 mt-2">
            {dataVisaDistribution.map((entry) => (
              <div key={entry.name} className="flex items-center space-x-1.5 text-xs text-text-muted">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                <span>{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Role Workspaces Navigator */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-4">
          Corporate Role Workspaces
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visiblePortals.map((portal) => (
            <Link
              key={portal.name}
              href={portal.href}
              className="bg-card-bg border border-border-main rounded-xl p-4 shadow-sm hover:border-primary hover:shadow-md transition-all duration-200 block group"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-text-main group-hover:text-primary transition-colors">
                  {portal.name}
                </h3>
                <span className="text-[9px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded tracking-wider uppercase">
                  {portal.role} Privilege
                </span>
              </div>
              <p className="text-text-muted text-xs mt-2 leading-relaxed">{portal.desc}</p>
              <div className="mt-4 flex items-center space-x-1 text-xs text-primary font-bold">
                <span>Enter Workspace</span>
                <ArrowRight className="h-3 w-3 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Profile Details summary card */}
      <div className="bg-card-bg border border-border-main rounded-xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div className="flex items-center space-x-3 col-span-2">
          <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
            <Fingerprint className="h-6 w-6 stroke-[1.5]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-main">Role Identity Profile: {user?.role}</h3>
            <p className="text-xs text-text-muted mt-0.5">
              Authorized modules: {user?.role === 'ADMIN' ? 'All System Subsystems' : `${user?.role} Workspace Controls`}. Your session token expires in 24 hours.
            </p>
          </div>
        </div>
        <div className="text-left md:text-right">
          <Link
            href="/login"
            className="inline-flex justify-center items-center py-2 px-4 border border-border-main rounded-lg shadow-sm text-xs font-bold text-text-main bg-canvas-bg hover:bg-card-bg transition-colors"
          >
            Manage User Sessions
          </Link>
        </div>
      </div>
    </div>
  );
}
