import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const role = token.role;

    // Admin has access to all pages
    if (role === 'ADMIN') {
      return NextResponse.next();
    }

    // Protect role-specific routes
    if (path.startsWith('/dashboard/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard?error=AccessDeniedAdminOnly', req.url));
    }

    if (path.startsWith('/dashboard/hr') && role !== 'HR') {
      return NextResponse.redirect(new URL('/dashboard?error=AccessDeniedHROnly', req.url));
    }

    if (path.startsWith('/dashboard/payroll') && role !== 'PAYROLL') {
      return NextResponse.redirect(new URL('/dashboard?error=AccessDeniedPayrollOnly', req.url));
    }

    if (path.startsWith('/dashboard/recruiter') && role !== 'RECRUITER') {
      return NextResponse.redirect(new URL('/dashboard?error=AccessDeniedRecruiterOnly', req.url));
    }

    if (path.startsWith('/dashboard/accounting') && role !== 'ACCOUNTING') {
      return NextResponse.redirect(new URL('/dashboard?error=AccessDeniedAccountingOnly', req.url));
    }

    if (path.startsWith('/dashboard/manager') && role !== 'MANAGER') {
      return NextResponse.redirect(new URL('/dashboard?error=AccessDeniedManagerOnly', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    }
  }
);

export const config = {
  // Guard all pages inside /dashboard, excluding standard resource API calls if needed
  matcher: ['/dashboard/:path*'],
};
