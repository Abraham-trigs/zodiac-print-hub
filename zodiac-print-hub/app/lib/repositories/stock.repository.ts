import { prisma } from "@lib/prisma-client";
import { DbClient } from "@lib/prisma-client";

type TxOrDb = DbClient | undefined;

const getDb = (tx?: TxOrDb) => tx ?? prisma;

export class StockRepository {
  /* =========================================================
     READ OPERATIONS (SAFE PUBLIC API)
  ========================================================= */

  static async list(orgId: string, tx?: DbClient) {
    const db = getDb(tx);

    return db.stockItem.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findById(orgId: string, id: string, tx?: DbClient) {
    const db = getDb(tx);

    return db.stockItem.findFirst({
      where: { id, orgId },
    });
  }

  /* =========================================================
     WRITE GUARD (INTENTIONALLY BLOCKED)
     - Prevents accidental direct mutation
     - Enforces StockMovement as ONLY write path
  ========================================================= */

  static increment(): never {
    throw new Error(
      "StockRepository.increment is disabled. Use StockService.createMovement({ type: 'RESTOCK' })",
    );
  }

  static decrement(): never {
    throw new Error(
      "StockRepository.decrement is disabled. Use StockService.createMovement({ type: 'DEDUCT' })",
    );
  }

  static adjust(): never {
    throw new Error(
      "StockRepository.adjust is disabled. Use StockService.createMovement({ type: 'ADJUST' })",
    );
  }
}
