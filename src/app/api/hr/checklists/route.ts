import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/dbService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function checkHRorPayrollOrAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return false;
  const role = session.user.role;
  return role === 'HR' || role === 'PAYROLL' || role === 'ADMIN';
}

export async function GET() {
  if (!(await checkHRorPayrollOrAdmin())) {
    return NextResponse.json({ error: 'Unauthorized. Privilege mismatch.' }, { status: 403 });
  }

  try {
    const checklists = await dbService.getPayrollChecklists();
    return NextResponse.json(checklists);
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to query checklists.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!(await checkHRorPayrollOrAdmin())) {
    return NextResponse.json({ error: 'Unauthorized. Privilege mismatch.' }, { status: 403 });
  }

  try {
    const { id, visaStatus, visaExpiry, directDepositSet, stateRegistered, payrollHold } = await req.json();
    const session = await getServerSession(authOptions);

    if (!id) {
      return NextResponse.json({ error: 'Checklist ID is required.' }, { status: 400 });
    }

    const updated = await dbService.updatePayrollChecklist(id, {
      visaStatus,
      visaExpiry: visaExpiry ? new Date(visaExpiry) : null,
      directDepositSet,
      stateRegistered,
      payrollHold
    });

    // Write audit log entry
    await dbService.createAuditLog({
      userId: session?.user.id || null,
      action: 'UPDATE_COMPLIANCE_CHECKLIST',
      resource: 'PayrollChecklist',
      details: `Updated compliance checklist ID ${id}: Visa=${visaStatus || 'nochange'}, DirectDeposit=${directDepositSet !== undefined ? directDepositSet : 'nochange'}, Hold=${payrollHold !== undefined ? payrollHold : 'nochange'}.`
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    console.error('Checklist API update error:', e);
    return NextResponse.json({ error: 'Failed to update compliance checklist.' }, { status: 500 });
  }
}
