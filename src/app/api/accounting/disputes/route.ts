import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/dbService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function checkAccountingOrAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return false;
  const role = session.user.role;
  return role === 'ACCOUNTING' || role === 'ADMIN';
}

export async function GET() {
  if (!(await checkAccountingOrAdmin())) {
    return NextResponse.json({ error: 'Unauthorized. Accounting privilege required.' }, { status: 403 });
  }

  try {
    const disputes = await dbService.getPaymentDisputes();
    return NextResponse.json(disputes);
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to retrieve disputes.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!(await checkAccountingOrAdmin())) {
    return NextResponse.json({ error: 'Unauthorized. Accounting privilege required.' }, { status: 403 });
  }

  try {
    const { id, status, resolution } = await req.json();
    const session = await getServerSession(authOptions);

    if (!id || !status) {
      return NextResponse.json({ error: 'Dispute ID and status are required.' }, { status: 400 });
    }

    const updated = await dbService.updatePaymentDisputeStatus(id, status, resolution);

    // Audit log
    await dbService.createAuditLog({
      userId: session?.user.id || null,
      action: 'RESOLVE_DISPUTE',
      resource: 'PaymentDispute',
      details: `Dispute ID ${id} resolved with notes: ${resolution || 'none'}. Status set to ${status}.`
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to update dispute.' }, { status: 500 });
  }
}
