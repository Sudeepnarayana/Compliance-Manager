import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/dbService';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, role, firstName, lastName, department, jobTitle } = await req.json();

    if (!email || !password || !name || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Required fields are missing: email, password, name, firstName, lastName.' },
        { status: 400 }
      );
    }

    const existingUser = await dbService.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email address already exists.' },
        { status: 400 }
      );
    }

    const newUser = await dbService.createUser({
      email,
      name,
      passwordRaw: password,
      role: role || 'USER',
      firstName,
      lastName,
      department,
      jobTitle,
    });

    // Create audit log for user registration
    await dbService.createAuditLog({
      userId: newUser.id,
      action: 'USER_REGISTER',
      resource: 'Auth',
      details: `New user ${email} successfully self-registered with role ${role || 'USER'}.`
    });

    return NextResponse.json(
      { message: 'User registered successfully. You can now log in.', userId: newUser.id },
      { status: 201 }
    );
  } catch (e: any) {
    console.error('Registration API error:', e);
    return NextResponse.json(
      { error: 'Internal server error occurred during registration.' },
      { status: 500 }
    );
  }
}
