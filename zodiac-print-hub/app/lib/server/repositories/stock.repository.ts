import type { prisma } from "@lib/prisma-client";
import { DbClient } from "@lib/prisma-client";

type TxOrDb = DbClient | undefined;
const getDb = (tx?: TxOrDb) => tx ?? prisma;

export class StockRepository {
  /* =========================================================
     READ-ONLY (V2 ALIGNED)
  ========================================================= */

  static async list(orgId: string, tx?: DbClient) {
    const db = getDb(tx);
    return db.stockItem.findMany({
      where: { orgId },
      include: { material: true }, // 🔥 CRITICAL: UI needs name/unit/calcType
      orderBy: { updatedAt: "desc" },
    });
  }

  static async findById(orgId: string, id: string, tx?: DbClient) {
    const db = getDb(tx);
    return db.stockItem.findFirst({
      where: { id, orgId },
      include: { material: true }, // 🔥 CRITICAL
    });
  }

  /* =========================================================
     WRITE GUARD (KEEP THIS!)
  ========================================================= */
  static increment(): never {
    throw new Error("Use StockService.createMovement({ type: 'RESTOCK' })");
  }

  static decrement(): never {
    throw new Error("Use StockService.createMovement({ type: 'DEDUCT' })");
  }

  static adjust(): never {
    throw new Error("Use StockService.createMovement({ type: 'ADJUST' })");
  }
}
