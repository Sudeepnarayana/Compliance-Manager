import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/dbService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function checkRecruiterOrAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return false;
  const role = session.user.role;
  return role === 'RECRUITER' || role === 'ADMIN';
}

export async function GET() {
  if (!(await checkRecruiterOrAdmin())) {
    return NextResponse.json({ error: 'Unauthorized. Recruiter privilege required.' }, { status: 403 });
  }

  try {
    const offers = await dbService.getOfferLetters();
    return NextResponse.json(offers);
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to retrieve offer letters.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await checkRecruiterOrAdmin())) {
    return NextResponse.json({ error: 'Unauthorized. Recruiter privilege required.' }, { status: 403 });
  }

  try {
    const { candidateName, candidateEmail, roleTitle, salary } = await req.json();
    const session = await getServerSession(authOptions);

    if (!candidateName || !candidateEmail || !roleTitle || !salary) {
      return NextResponse.json({ error: 'Missing candidate details or salary.' }, { status: 400 });
    }

    const newOffer = await dbService.createOfferLetter({
      candidateName,
      candidateEmail,
      roleTitle,
      salary: parseFloat(salary),
      createdBy: session?.user.id || 'system'
    });

    // Write audit log entry
    await dbService.createAuditLog({
      userId: session?.user.id || null,
      action: 'CREATE_OFFER',
      resource: 'OfferLetter',
      details: `Created draft offer letter for candidate ${candidateName} (${roleTitle}) with salary $${salary}.`
    });

    return NextResponse.json(newOffer, { status: 201 });
  } catch (e: any) {
    console.error('Error creating offer letter:', e);
    return NextResponse.json({ error: 'Failed to create offer letter.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  // Allow recruiters, managers, or admin to update status
  const session = await getServerSession(authOptions);
  if (!session?.user || !['RECRUITER', 'MANAGER', 'ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
  }

  try {
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'Offer ID and status are required.' }, { status: 400 });
    }

    const updated = await dbService.updateOfferLetterStatus(id, status);

    // Audit logs for transitioning states
    await dbService.createAuditLog({
      userId: session.user.id,
      action: 'TRANSITION_OFFER_STATUS',
      resource: 'OfferLetter',
      details: `Transitional shift for offer ID ${id} set to status: ${status}.`
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to update offer status.' }, { status: 500 });
  }
}
