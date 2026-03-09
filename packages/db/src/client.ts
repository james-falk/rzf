import { PrismaClient } from './generated/client/index.js'

// PrismaClient is attached to the `globalThis` object in development
// to prevent exhausting your database connection limit during hot reloads.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env['NODE_ENV'] === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma.prisma = db
}
