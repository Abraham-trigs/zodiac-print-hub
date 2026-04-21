import { prisma } from "@/lib/db/prisma";
import { DbClient } from "@/lib/db/prisma-client";

export class StockRepository {
  static async list(orgId: string, tx?: DbClient) {
    const db = tx ?? prisma;

    return db.stockItem.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findById(orgId: string, id: string, tx?: DbClient) {
    const db = tx ?? prisma;

    return db.stockItem.findFirst({
      where: { id, orgId },
    });
  }

  static async deduct(
    orgId: string,
    stockItemId: string,
    amount: number,
    tx?: DbClient,
  ) {
    const db = tx ?? prisma;

    const item = await db.stockItem.findFirst({
      where: { id: stockItemId, orgId },
    });

    if (!item) throw new Error("Stock item not found");

    return db.stockItem.update({
      where: { id: stockItemId },
      data: {
        totalRemaining: {
          decrement: amount,
        },
      },
    });
  }

  static async restock(
    orgId: string,
    stockItemId: string,
    quantity: number,
    unitCost: number,
    tx?: DbClient,
  ) {
    const db = tx ?? prisma;

    const item = await db.stockItem.findFirst({
      where: { id: stockItemId, orgId },
    });

    if (!item) throw new Error("Stock item not found");

    return db.stockItem.update({
      where: { id: stockItemId },
      data: {
        totalRemaining: {
          increment: quantity,
        },
        lastUnitCost: unitCost,
        lastRestockedAt: new Date(),
      },
    });
  }
}
