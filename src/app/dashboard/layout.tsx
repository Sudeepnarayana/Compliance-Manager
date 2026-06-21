'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeContext';
import {
  Shield,
  LayoutDashboard,
  Settings,
  Users,
  DollarSign,
  FileText,
  Scale,
  ClipboardCheck,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  Bell,
  Search,
  ChevronDown,
  User as UserIcon
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Visa Expiry Alert', message: 'Carlos Mendez (Recruiter/Staff) visa expires in 5 days.', type: 'critical' },
    { id: 2, title: 'Payroll Hold Activated', message: 'HR hold activated on Bob Johnson due to Direct Deposit.', type: 'warning' },
    { id: 3, title: 'Dispute Resolved', message: 'Dispute dispute-3 resolved by Accounting Lead Mark.', type: 'success' },
  ]);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-canvas-bg flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-text-muted text-sm font-medium">Validating security token...</p>
      </div>
    );
  }

  // Not authenticated
  if (status === 'unauthenticated' || !session?.user) {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return null;
  }

  const role = session.user.role;

  // Sidebar navigation items based on role
  const navItems = [
    {
      name: 'Overview Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'HR', 'PAYROLL', 'RECRUITER', 'ACCOUNTING', 'MANAGER', 'USER'],
    },
    {
      name: 'Admin Command',
      href: '/dashboard/admin',
      icon: Settings,
      roles: ['ADMIN'],
    },
    {
      name: 'HR Compliance',
      href: '/dashboard/hr',
      icon: Users,
      roles: ['ADMIN', 'HR'],
    },
    {
      name: 'Payroll Readiness',
      href: '/dashboard/payroll',
      icon: DollarSign,
      roles: ['ADMIN', 'PAYROLL'],
    },
    {
      name: 'Talent Acquisition',
      href: '/dashboard/recruiter',
      icon: FileText,
      roles: ['ADMIN', 'RECRUITER'],
    },
    {
      name: 'Accounting Log',
      href: '/dashboard/accounting',
      icon: Scale,
      roles: ['ADMIN', 'ACCOUNTING'],
    },
    {
      name: 'Management Approvals',
      href: '/dashboard/manager',
      icon: ClipboardCheck,
      roles: ['ADMIN', 'MANAGER'],
    },
  ];

  const visibleNavItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <div className="min-h-screen flex flex-col bg-canvas-bg text-text-main transition-colors duration-200">
      {/* Top Navbar */}
      <header className="h-14 bg-nav-bg text-nav-text border-b border-border-main flex items-center justify-between px-4 sticky top-0 z-30 shadow-md">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-nav-text cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/dashboard" className="flex items-center space-x-2 text-white">
            <Shield className="h-6 w-6 stroke-[2]" />
            <span className="font-bold text-lg tracking-tight hidden sm:inline-block">RPOC-1 Control Tower</span>
            <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ml-2 tracking-wider">
              {role} Console
            </span>
          </Link>
        </div>

        {/* Search Navigator */}
        <div className="hidden md:flex items-center bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 w-80 text-slate-300">
          <Search className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search records, tickets, audit keys..."
            className="bg-transparent border-none text-xs w-full focus:outline-none placeholder-slate-500"
          />
        </div>

        {/* Right Nav Utilities */}
        <div className="flex items-center space-x-2">
          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-nav-text cursor-pointer"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Notifications Center */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileDropdownOpen(false);
              }}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-nav-text relative cursor-pointer"
            >
              <Bell className="h-4 w-4" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-status-danger animate-pulse"></span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2.5 w-80 bg-card-bg border border-border-main rounded-xl shadow-2xl overflow-hidden z-40">
                <div className="px-4 py-3 bg-canvas-bg border-b border-border-main flex justify-between items-center">
                  <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">Compliance Notifications</h4>
                  <span className="text-[10px] bg-status-danger/10 text-status-danger font-bold px-1.5 py-0.5 rounded">
                    {notifications.length} Active
                  </span>
                </div>
                <div className="divide-y divide-border-main max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-text-muted text-xs">
                      No active notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="p-3 text-xs hover:bg-canvas-bg transition-colors">
                        <div className="flex justify-between items-center mb-1">
                          <span className={`font-bold ${
                            n.type === 'critical' ? 'text-status-danger' : n.type === 'warning' ? 'text-status-warning' : 'text-status-success'
                          }`}>
                            {n.title}
                          </span>
                          <span className="text-[9px] text-text-muted">Just now</span>
                        </div>
                        <p className="text-text-muted text-[11px] leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="px-4 py-2 border-t border-border-main bg-canvas-bg text-center">
                    <button
                      onClick={() => setNotifications([])}
                      className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                    >
                      Clear all items
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profile Controls */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setProfileDropdownOpen(!profileDropdownOpen);
                setNotificationsOpen(false);
              }}
              className="flex items-center space-x-1.5 py-1 px-2.5 rounded-lg hover:bg-slate-800 transition-colors text-nav-text cursor-pointer"
            >
              <div className="h-6 w-6 rounded-full bg-primary/20 text-primary border border-primary/40 flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                {session.user.name?.slice(0, 2) || 'US'}
              </div>
              <span className="text-xs font-semibold hidden md:inline-block max-w-28 truncate">{session.user.name}</span>
              <ChevronDown className="h-3 w-3 opacity-60 shrink-0" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2.5 w-56 bg-card-bg border border-border-main rounded-xl shadow-2xl py-1.5 z-40">
                <div className="px-4 py-2.5 border-b border-border-main">
                  <p className="text-xs font-bold text-text-main truncate">{session.user.name}</p>
                  <p className="text-[10px] text-text-muted truncate mt-0.5">{session.user.email}</p>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center space-x-2 px-4 py-2 text-xs text-text-main hover:bg-canvas-bg transition-colors"
                >
                  <UserIcon className="h-4 w-4 opacity-70" />
                  <span>My Workspace</span>
                </Link>
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    signOut({ callbackUrl: '/login' });
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-xs text-status-danger hover:bg-status-danger/10 transition-colors text-left cursor-pointer border-t border-border-main mt-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside
          className={`bg-card-bg border-r border-border-main shrink-0 transition-all duration-200 z-20 ${
            sidebarOpen ? 'w-64' : 'w-0 -translate-x-64 md:w-16 md:translate-x-0'
          } overflow-y-auto`}
        >
          <div className="py-4 space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-xs font-medium border-l-4 transition-all ${
                    isActive
                      ? 'bg-primary/5 text-primary border-primary font-bold'
                      : 'border-transparent text-text-muted hover:text-text-main hover:bg-canvas-bg'
                  }`}
                  title={item.name}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-text-muted'} ${sidebarOpen ? 'mr-3' : ''}`} />
                  <span className={`${sidebarOpen ? 'inline-block' : 'hidden md:hidden'}`}>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Content Region */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-canvas-bg">
          {children}
        </main>
      </div>
    </div>
  );
}
