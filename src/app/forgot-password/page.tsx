'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, Mail, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Request failed. Please try again.');
        setLoading(false);
      } else {
        setSuccess(data.message || 'Reset link has been sent to your email.');
        setLoading(false);
      }
    } catch (e: any) {
      setError('An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center space-x-2 text-primary">
          <Shield className="h-10 w-10 stroke-[2.5]" />
          <span className="font-bold text-2xl tracking-tight text-text-main">RPOC-1 Tower</span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-text-main">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-text-muted">
          Enter your corporate email address to receive a secure recovery link.
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

          {!success ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-main">
                  Corporate Email Address
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
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <span>Request Reset Link</span>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-text-muted mb-6 leading-relaxed">
                If an account with email <strong className="text-text-main">{email}</strong> exists, a password reset link and details have been logged in the system audit logs.
              </p>
              <Link
                href="/login"
                className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-border-main rounded-xl shadow-sm text-sm font-bold text-text-main bg-card-bg hover:bg-canvas-bg transition-colors"
              >
                Return to Login
              </Link>
            </div>
          )}

          {!success && (
            <div className="mt-6 flex justify-center">
              <Link
                href="/login"
                className="inline-flex items-center space-x-2 text-xs font-semibold text-text-muted hover:text-text-main transition-colors"
              >
                <ArrowLeft className="h-3 w-3" />
                <span>Back to Login</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
