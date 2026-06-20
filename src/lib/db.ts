// Safe fallback: export null as prisma to run entirely in local mock mode 
// without requiring Prisma engine binary downloads (which fail in sandbox/offline builds).
// To connect to a live database in production:
// 1. Uncomment the PrismaClient imports and initialization.
// 2. Ensure DATABASE_URL is set in environment.

const prisma: any = null;

export default prisma;
