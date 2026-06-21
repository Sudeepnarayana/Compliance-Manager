import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  const info: any = {
    env: {
      hasPostgresPrismaUrl: !!process.env.POSTGRES_PRISMA_URL,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      postgresDatabase: process.env.POSTGRES_DATABASE || null,
      databaseUrlMasked: maskUrl(process.env.DATABASE_URL),
      postgresPrismaUrlMasked: maskUrl(process.env.POSTGRES_PRISMA_URL),
    },
    prismaInitialized: !!prisma,
  };

  if (prisma) {
    try {
      // Run a raw query to check connection
      const rawResult = await prisma.$queryRaw`SELECT current_database() as db, current_user as user, version() as ver`;
      info.rawQueryResult = rawResult;

      // Count users
      const userCount = await prisma.user.count();
      info.userCount = userCount;
    } catch (e: any) {
      info.prismaError = {
        message: e.message,
        code: e.code,
        meta: e.meta,
      };
    }
  }

  return NextResponse.json(info);
}

function maskUrl(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    parsed.password = '****';
    return parsed.toString();
  } catch (e) {
    return 'Invalid URL';
  }
}
