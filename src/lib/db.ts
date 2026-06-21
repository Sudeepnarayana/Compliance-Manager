import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (typeof window === 'undefined') {
  const { PrismaPg } = require('@prisma/adapter-pg');
  const { Pool } = require('pg');
  const fs = require('fs');
  const path = require('path');

  // Parse .env.local file to populate process.env for local tools and commands
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const content = fs.readFileSync(envLocalPath, 'utf-8');
    for (const line of content.split('\n')) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || '';
        if (val.startsWith('"') && val.endsWith('"')) val = val.substring(1, val.length - 1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.substring(1, val.length - 1);
        process.env[key] = val.trim();
      }
    }
  }

  const connectionString = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;

  if (connectionString) {
    if (process.env.NODE_ENV === 'production') {
      const pool = new Pool({ connectionString });
      const adapter = new PrismaPg(pool);
      prisma = new PrismaClient({ adapter });
    } else {
      // Prevent multiple instances of Prisma Client in development (Hot Reloading)
      if (!(global as any).prisma) {
        const pool = new Pool({ connectionString });
        const adapter = new PrismaPg(pool);
        (global as any).prisma = new PrismaClient({ adapter });
      }
      prisma = (global as any).prisma;
    }
  } else {
    console.warn('Database connection URL is missing.');
    prisma = null as any;
  }
} else {
  prisma = null as any;
}

export default prisma;
