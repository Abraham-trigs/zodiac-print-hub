import type { prisma } from "@lib/prisma-client";
import { DbClient } from "@lib/prisma-client";

export class UnitOfWork {
  static run<T>(fn: (tx: DbClient) => Promise<T>) {
    return prisma.$transaction((tx) => fn(tx));
  }
}
