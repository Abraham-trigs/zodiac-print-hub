import { prisma } from "@lib/prisma-client";
import { Outbox } from "@lib/db/outbox";
import type { CreateStockMovementInput } from "@lib/schema/stock.schema";

type CreateMovementParams = CreateStockMovementInput;

/**
 * DOMAIN SERVICE
 *
 * CORE PRINCIPLE:
 * StockMovement = Source of Truth (ledger)
 * StockItem = Projection (cached state)
 */
class StockService {
  /* =========================================================
     INITIAL STOCK REGISTRATION
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
    const item = await tx.stockItem.create({
      data: {
        orgId,
        name: data.name,
        unit: data.unit,
        totalRemaining: data.quantity || 0,
        lowStockThreshold: data.lowStockThreshold ?? 10,
        lastUnitCost: data.unitCost || 0,
      },
    });

    const movement = await tx.stockMovement.create({
      data: {
        orgId,
        stockItemId: item.id,
        type: "RESTOCK",
        quantity: data.quantity || 0,
        unitCost: data.unitCost || 0,
        referenceType: "RESTOCK",
        note: "Initial registration via Product Coordinator",
        createdBy: data.createdBy || "SYSTEM",
      },
    });

    await Outbox.add(tx, {
      type: "stock.item_registered",
      orgId,
      payload: { item, movement },
    });

    return item;
  }

  /* =========================================================
     STOCK MOVEMENT ENGINE (SOURCE OF TRUTH)
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

    let delta = 0;

    switch (type) {
      case "RESTOCK":
        delta = quantity;
        break;

      case "DEDUCT":
      case "WASTE":
        if (item.totalRemaining < quantity) {
          throw new Error("Insufficient stock");
        }
        delta = -quantity;
        break;

      case "ADJUST":
        delta = quantity - item.totalRemaining;
        break;

      default:
        throw new Error(`Unsupported stock movement type: ${type}`);
    }

    const newQuantity = item.totalRemaining + delta;

    /**
     * PROJECTION UPDATE (cache layer)
     */
    const updated = await tx.stockItem.update({
      where: { id: stockItemId },
      data: {
        totalRemaining: newQuantity,
        lastUnitCost: unitCost ?? item.lastUnitCost,
      },
    });

    /**
     * LEDGER WRITE (source of truth)
     */
    const movement = await tx.stockMovement.create({
      data: {
        orgId,
        stockItemId,
        type,
        quantity: Math.abs(delta), // FIX: ledger stores actual movement size, not signed delta
        unitCost,
        referenceId,
        referenceType,
        note,
        createdBy,
      },
    });

    /**
     * OUTBOX EVENT
     */
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
     READ LAYER (PROJECTION ACCESS)
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
