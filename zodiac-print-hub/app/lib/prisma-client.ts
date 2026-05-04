import { PrismaClient } from "@prisma/client"; // 🚀 FIX 1: Use standard path
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 🚀 FIX 2: Ensure pg and adapter only run on the server
let prismaInstance: PrismaClient;

if (typeof window === "undefined") {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const adapter = new PrismaPg(pool);

  prismaInstance =
    globalForPrisma.prisma ??
    new PrismaClient({
      adapter,
      log:
        process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prismaInstance;
  }
} else {
  // Fallback for client-side to prevent "pg" import errors
  prismaInstance = {} as PrismaClient;
}

export const prisma = prismaInstance;
