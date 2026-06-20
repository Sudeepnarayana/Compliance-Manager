'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Shield, Lock, Mail, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get callback url or redirect to dashboard
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  useEffect(() => {
    if (status === 'authenticated') {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  // Check for error parameter in URL (e.g. NextAuth auth errors)
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      if (errorParam === 'CredentialsSignin') {
        setError('Invalid credentials. Please verify your email and password.');
      } else {
        setError(errorParam);
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both your email and password.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        setSuccess('Authentication successful! Redirecting...');
        setTimeout(() => {
          router.push(callbackUrl);
        }, 800);
      }
    } catch (e: any) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: string) => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    const roleEmail = `${role.toLowerCase()}@enterprise.com`;
    const rolePassword = 'password123';

    setEmail(roleEmail);
    setPassword(rolePassword);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: roleEmail,
        password: rolePassword,
        callbackUrl,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        setSuccess(`Logged in as ${role}! Redirecting...`);
        setTimeout(() => {
          router.push(callbackUrl);
        }, 800);
      }
    } catch (e: any) {
      setError('Quick login failed.');
      setLoading(false);
    }
  };

  const quickRoles = [
    { name: 'Admin', color: 'bg-teal-600 hover:bg-teal-700 text-white' },
    { name: 'HR', color: 'bg-indigo-600 hover:bg-indigo-700 text-white' },
    { name: 'Payroll', color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
    { name: 'Recruiter', color: 'bg-sky-600 hover:bg-sky-700 text-white' },
    { name: 'Accounting', color: 'bg-amber-600 hover:bg-amber-700 text-white' },
    { name: 'Manager', color: 'bg-rose-600 hover:bg-rose-700 text-white' },
  ];

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-canvas-bg flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-text-muted text-sm font-medium">Loading session state...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center space-x-2 text-primary">
          <Shield className="h-10 w-10 stroke-[2.5]" />
          <span className="font-bold text-2xl tracking-tight text-text-main">RPOC-1 Tower</span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-text-main">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-text-muted">
          Or{' '}
          <Link href="/register" className="font-semibold text-primary hover:text-primary-hover transition-colors">
            register a new enterprise account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card-bg py-8 px-4 border border-border-main shadow-xl rounded-2xl sm:px-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-accent"></div>
          
          {error && (
            <div className="mb-4 p-4 rounded-xl bg-status-danger/10 border border-status-danger text-status-danger text-sm flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 rounded-xl bg-status-success/10 border border-status-success text-status-success text-sm flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-main">
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-border-main rounded-xl bg-canvas-bg text-text-main text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="name@enterprise.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-main">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-border-main rounded-xl bg-canvas-bg text-text-main text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-border-main rounded-md bg-canvas-bg"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-text-muted font-medium select-none">
                  Remember me
                </label>
              </div>

              <div className="text-xs">
                <Link
                  href="/forgot-password"
                  className="font-semibold text-primary hover:text-primary-hover transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Login Developer Panel */}
          <div className="mt-8 pt-6 border-t border-border-main">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-4 text-center">
              Developer Quick Role Login
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {quickRoles.map((role) => (
                <button
                  key={role.name}
                  type="button"
                  onClick={() => handleQuickLogin(role.name)}
                  disabled={loading}
                  className={`py-2 px-3 rounded-lg text-xs font-bold shadow-sm transition-all duration-150 transform hover:scale-[1.02] flex items-center justify-center cursor-pointer ${role.color}`}
                >
                  {role.name} Account
                </button>
              ))}
            </div>
            <p className="mt-3 text-[10px] text-text-muted text-center leading-normal">
              Default developer password: <code className="bg-canvas-bg px-1.5 py-0.5 rounded font-mono border border-border-main">password123</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-canvas-bg flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-text-muted text-sm font-medium">Loading login form...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
