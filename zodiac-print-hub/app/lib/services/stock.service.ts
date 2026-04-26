import { prisma } from "@lib/prisma-client";
import { Outbox } from "@lib/db/outbox";
import type { CreateStockMovementInput } from "@lib/schema/stock.schema";

type CreateMovementParams = CreateStockMovementInput;

/**
 * DOMAIN SERVICE (INSTANCE-BASED)
 *
 * RESPONSIBILITIES:
 * 1. Enforce stock rules
 * 2. Mutate stockItem inside tx
 * 3. Write stockMovement ledger
 * 4. Emit outbox event
 */
class StockService {
  /* =========================================================
     WRITE: INITIAL REGISTRATION
     - Creates the base Item
     - Creates the first RESTOCK movement
     - Ensures ledger consistency from day one
  ========================================================= */
  async registerInitialStock(
    orgId: string,
    data: {
      name: string;
      unit: string;
      quantity: number;
      unitCost?: number;
      lowStockThreshold?: number;
      createdBy?: string;
    },
    tx: any,
  ) {
    // 1. Create the base item record
    const item = await tx.stockItem.create({
      data: {
        orgId,
        name: data.name,
        unit: data.unit,
        totalRemaining: data.quantity || 0,
        lowStockThreshold: data.lowStockThreshold ?? 10,
        // 🔥 FIXED: Satisfying mandatory 'lastUnitCost' field in schema
        lastUnitCost: data.unitCost || 0,
      },
    });
    console.log("✅ STOCK ITEM CREATED IN TX:", item.id);

    // 2. Create the first Ledger entry (The Source of Truth)
    const movement = await tx.stockMovement.create({
      data: {
        orgId,
        stockItemId: item.id,
        type: "RESTOCK",
        quantity: data.quantity || 0,
        unitCost: data.unitCost || 0, // 🔥 Synced with ledger
        note: "Initial registration via Product Coordinator",
        createdBy: data.createdBy || "SYSTEM",
      },
    });

    // 3. Emit event for background workers
    await Outbox.add(tx, {
      type: "stock.item_registered",
      orgId,
      payload: { item, movement },
    });

    return item;
  }

  /* =========================================================
     WRITE: STOCK MOVEMENT (SOURCE OF TRUTH)
  ========================================================= */
  async createMovement(params: CreateMovementParams, tx: any) {
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
     READ: SAFE QUERY LAYER
  ========================================================= */

  async list(orgId: string) {
    return prisma.stockItem.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(orgId: string, id: string) {
    return prisma.stockItem.findFirst({
      where: { id, orgId },
    });
  }
}

/* =========================================================
   SINGLETON EXPORT
========================================================= */

export const stockService = new StockService();
