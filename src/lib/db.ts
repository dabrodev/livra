import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)

  return new PrismaClient({ adapter })
}

// Invalidate stale global prisma if models changed
if (globalForPrisma.prisma) {
  const p = globalForPrisma.prisma as any;
  if (!p.persona) {
    console.error('CRITICAL: Stale Prisma client detected (missing .persona). Invalidating cache...');
    globalForPrisma.prisma = undefined;
  } else if (p.influencer) {
    console.warn('CRITICAL: Prisma client still has .influencer. This is unexpected but invalidating...');
    globalForPrisma.prisma = undefined;
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Debug log to console
if (process.env.NODE_ENV !== 'production') {
  const p = prisma as any;
  const models = ['user', 'persona', 'post', 'memory', 'avatarLibrary'];
  const status = models.map(m => `${m}: ${!!p[m]}`).join(', ');
  console.log(`Prisma Status: ${status}`);
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
