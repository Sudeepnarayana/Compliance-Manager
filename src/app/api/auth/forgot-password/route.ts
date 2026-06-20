import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/dbService';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    const user = await dbService.getUserByEmail(email);

    if (user) {
      // Create security audit log
      await dbService.createAuditLog({
        userId: user.id,
        action: 'PASSWORD_RESET_REQ',
        resource: 'Auth',
        details: `Password reset request submitted for ${email}. Simulated reset token sent to email.`
      });
    } else {
      // Log failed request to trace scan attempts
      await dbService.createAuditLog({
        userId: null,
        action: 'PASSWORD_RESET_FAIL',
        resource: 'Auth',
        details: `Password reset request failed: email ${email} not found in database.`
      });
    }

    // Always return success to prevent user enumeration
    return NextResponse.json({
      message: 'If a matching account exists, a password reset link has been dispatched to your email.'
    }, { status: 200 });

  } catch (e: any) {
    console.error('Forgot Password API error:', e);
    return NextResponse.json({ error: 'Internal server error occurred.' }, { status: 500 });
  }
}
