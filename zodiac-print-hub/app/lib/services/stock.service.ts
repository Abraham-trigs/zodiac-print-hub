// src/lib/services/stock.service.ts
import { prisma } from "@lib/prisma-client";
import { Outbox } from "@lib/db/outbox";
import type { CreateStockMovementInput } from "@lib/schema/stock.schema";

/**
 * V2 STOCK ENGINE
 * Logic: Material = The Definition (Brain)
 *        StockItem = The Bucket (Tracking)
 *        StockMovement = The History (Ledger)
 */
class StockService {
  /* =========================================================
     INITIAL STOCK REGISTRATION
     🔥 UPDATED: Now links to a Material Resource
  ========================================================= */
  async registerInitialStock(
    orgId: string,
    data: {
      materialId: string; // 🔥 FIXED: Links to the technical resource
      quantity: number;
      purchasePrice?: number;
      lowStockThreshold?: number;
      createdBy?: string;
    },
    tx: any,
  ) {
    // 1. Create the Bucket (Projection)
    const item = await tx.stockItem.create({
      data: {
        orgId,
        materialId: data.materialId, // 🔥 Relational Link
        totalRemaining: data.quantity || 0,
        lowStockThreshold: data.lowStockThreshold ?? 10,
        // purchasePrice is stored at the Material level, but we track last cost in movement
      },
    });

    // 2. Create the Ledger Entry (Source of Truth)
    const movement = await tx.stockMovement.create({
      data: {
        orgId,
        stockItemId: item.id,
        type: "RESTOCK",
        quantity: data.quantity || 0,
        unitCost: data.purchasePrice || 0,
        referenceType: "INITIAL_LOAD",
        note: "System registration of physical material",
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
     STOCK MOVEMENT ENGINE
     Strict Ledger-based math
  ========================================================= */
  async createMovement(params: CreateStockMovementInput, tx: any) {
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
      include: { material: true }, // 🚀 Include specs for validation
    });

    if (!item) throw new Error("Stock item not found");

    let delta = 0;
    switch (type) {
      case "RESTOCK":
        delta = quantity;
        break;
      case "DEDUCT":
      case "WASTE":
        // In industrial production, we allow negative stock if config allows,
        // but here we maintain strict integrity.
        if (item.totalRemaining < quantity) {
          throw new Error(`Insufficient stock for ${item.material?.name}`);
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

    // UPDATE PROJECTION
    const updated = await tx.stockItem.update({
      where: { id: stockItemId },
      data: { totalRemaining: newQuantity },
    });

    // WRITE LEDGER
    const movement = await tx.stockMovement.create({
      data: {
        orgId,
        stockItemId,
        type,
        quantity: Math.abs(delta),
        unitCost: unitCost || 0,
        referenceId,
        referenceType,
        note,
        createdBy,
      },
    });

    await Outbox.add(tx, {
      type: "stock.movement_created",
      orgId,
      payload: { movement, after: updated },
    });

    return updated;
  }

  /* =========================================================
     READ LAYER
  ========================================================= */
  async list(orgId: string) {
    return prisma.stockItem.findMany({
      where: { orgId },
      include: {
        material: true, // 🚀 VITAL: Fetch specs (sqft/mm/name)
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async findById(orgId: string, id: string) {
    return prisma.stockItem.findFirst({
      where: { id, orgId },
      include: { material: true },
    });
  }
}

export const stockService = new StockService();
