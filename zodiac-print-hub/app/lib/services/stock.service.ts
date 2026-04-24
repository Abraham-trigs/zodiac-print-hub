import { prisma } from "@lib/prisma-client";
import { Outbox } from "@lib/db/outbox";
import type { CreateStockMovementInput } from "@lib/schema/stock.schema";

type CreateMovementParams = CreateStockMovementInput;

/**
 * PURE DOMAIN SERVICE
 * - NO UnitOfWork ownership
 * - MUST run inside external transaction (JobService, Restock flows, etc.)
 *
 * RESPONSIBILITIES:
 * 1. Enforce stock rules (business logic)
 * 2. Mutate stockItem inside tx
 * 3. Write stockMovement ledger entry
 * 4. Emit outbox event
 */
export class StockService {
  /* =========================================================
     WRITE: STOCK MOVEMENT (SOURCE OF TRUTH)
  ========================================================= */
  static async createMovement(params: CreateMovementParams, tx: any) {
    const {
      orgId,
      stockItemId,
      type,
      quantity,
      unitCost,
      referenceId,
      referenceType,
      note,
      createdBy,
    } = params;

    const item = await tx.stockItem.findFirst({
      where: { id: stockItemId, orgId },
    });

    if (!item) throw new Error("Stock item not found");

    let newQuantity = item.totalRemaining;

    switch (type) {
      case "RESTOCK":
        newQuantity += quantity;
        break;

      case "DEDUCT":
      case "WASTE":
        if (item.totalRemaining < quantity) {
          throw new Error("Insufficient stock");
        }
        newQuantity -= quantity;
        break;

      case "ADJUST":
        newQuantity = quantity;
        break;

      default:
        throw new Error(`Unsupported stock movement type: ${type}`);
    }

    const updated = await tx.stockItem.update({
      where: { id: stockItemId },
      data: { totalRemaining: newQuantity },
    });

    const movement = await tx.stockMovement.create({
      data: {
        orgId,
        stockItemId,
        type,
        quantity,
        unitCost,
        referenceId,
        referenceType,
        note,
        createdBy,
      },
    });

    await Outbox.add(tx, {
      type: "stock.movement_created",
      orgId,
      payload: {
        movement,
        after: updated,
      },
    });

    return updated;
  }

  /* =========================================================
     READ: SAFE QUERY LAYER (FIX FOR YOUR RUNTIME ERROR)
     - Keeps UI slices working (inventory.loadInventory, etc.)
     - No transaction required
  ========================================================= */

  static async list(orgId: string) {
    return prisma.stockItem.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findById(orgId: string, id: string) {
    return prisma.stockItem.findFirst({
      where: { id, orgId },
    });
  }
}

/* =========================================================
   SINGLETON EXPORT
========================================================= */
export const stockService = new StockService();
