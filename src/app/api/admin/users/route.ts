import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/dbService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Guard helper
async function checkAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user && session.user.role === 'ADMIN';
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized. Admin privilege required.' }, { status: 403 });
  }

  try {
    const users = await dbService.getUsers();
    // Exclude password hashes from public return
    const sanitized = users.map((u: any) => {
      const { passwordHash, ...rest } = u;
      return rest;
    });
    return NextResponse.json(sanitized);
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to retrieve user directory.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized. Admin privilege required.' }, { status: 403 });
  }

  try {
    const { userId, role, status } = await req.json();
    const session = await getServerSession(authOptions);

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    let updatedUser;
    if (role !== undefined) {
      updatedUser = await dbService.updateUserRole(userId, role);
      await dbService.createAuditLog({
        userId: session?.user.id || null,
        action: 'UPDATE_USER_ROLE',
        resource: 'User',
        details: `Updated role for user ID ${userId} to ${role}.`
      });
    }

    if (status !== undefined) {
      updatedUser = await dbService.updateUserStatus(userId, status);
      await dbService.createAuditLog({
        userId: session?.user.id || null,
        action: 'UPDATE_USER_STATUS',
        resource: 'User',
        details: `Updated status for user ID ${userId} to ${status}.`
      });
    }

    return NextResponse.json({ message: 'User updated successfully.', user: updatedUser });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to update user profile.' }, { status: 500 });
  }
}
