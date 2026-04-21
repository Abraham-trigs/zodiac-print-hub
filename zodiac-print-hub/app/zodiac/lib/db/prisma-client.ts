import { PrismaClient } from "@prisma/client";

/**
 * Global Prisma singleton (Next.js dev-safe)
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Base DB client type (works for PrismaClient + TransactionClient)
 */
export type DbClient = typeof prisma;
