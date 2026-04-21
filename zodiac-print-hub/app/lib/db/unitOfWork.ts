import { prisma } from "@/lib/db/prisma";
import { DbClient } from "@/lib/db/prisma-client";

export class UnitOfWork {
  static run<T>(fn: (tx: DbClient) => Promise<T>) {
    return prisma.$transaction((tx) => fn(tx));
  }
}
