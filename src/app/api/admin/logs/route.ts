import { NextResponse } from 'next/server';
import { dbService } from '@/lib/dbService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized. Admin privilege required.' }, { status: 403 });
  }

  try {
    const logs = await dbService.getAuditLogs();
    return NextResponse.json(logs);
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to retrieve system audit trail.' }, { status: 500 });
  }
}
