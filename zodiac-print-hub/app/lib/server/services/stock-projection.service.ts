import type { prisma } from "@lib/prisma-client";

/**
 * STOCK PROJECTION ENGINE
 *
 * RULES:
 * - StockMovement = source of truth (ledger)
 * - StockItem = derived projection (cache)
 * - This service is the ONLY reconciliation authority
 */
class StockProjectionService {
  /**
   * Rebuild a single stock item from its movement history
   */
  async rebuildStockItem(orgId: string, stockItemId: string, tx?: any) {
    const db = tx ?? prisma;

    const item = await db.stockItem.findFirst({
      where: { id: stockItemId, orgId },
    });

    if (!item) throw new Error("Stock item not found");

    const movements = await db.stockMovement.findMany({
      where: { stockItemId, orgId },
      orderBy: { createdAt: "asc" },
    });

    let total = 0;

    for (const m of movements) {
      if (m.type === "RESTOCK") total += m.quantity;
      else if (m.type === "DEDUCT" || m.type === "WASTE") total -= m.quantity;
      else if (m.type === "ADJUST") total += m.quantity;
    }

    const lastMovement = movements.at(-1);

    const updated = await db.stockItem.update({
      where: { id: stockItemId },
      data: {
        totalRemaining: total,
        lastUnitCost: lastMovement?.unitCost ?? item.lastUnitCost,
      },
    });

    return {
      stockItemId,
      computed: total,
      updated,
    };
  }

  /**
   * Rebuild ALL stock items in an org
   */
  async rebuildOrganization(orgId: string, tx?: any) {
    const db = tx ?? prisma;

    const items = await db.stockItem.findMany({
      where: { orgId },
      select: { id: true },
    });

    const results: any[] = [];

    for (const item of items) {
      const result = await this.rebuildStockItem(orgId, item.id, tx);
      results.push(result);
    }

    return {
      orgId,
      rebuilt: results.length,
      results,
    };
  }
}

export const stockProjectionService = new StockProjectionService();
