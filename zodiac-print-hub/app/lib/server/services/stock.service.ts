// src/lib/services/stock.service.ts
import type { prisma } from "@lib/prisma-client";
import { Outbox } from "@lib/db/outbox";
import type { CreateStockMovementInput } from "@lib/shared/schema/stock.schema";
import { StockMovementType } from "@prisma/client";
import { StockAlertService } from "./stock-alert.service"; // 🚀 Added Watchman

/**
 * V2 STOCK ENGINE (Industrial Ledger Edition)
 * Principles:
 * 1. StockItem = Snapshot (Current Balance)
 * 2. StockMovement = Truth (The Audit Trail)
 */
class StockService {
  /* =========================================================
     INITIAL STOCK REGISTRATION
  ========================================================= */
  async registerInitialStock(
    orgId: string,
    data: {
      materialId: string;
      quantity: number;
      purchasePrice?: number;
      lowStockThreshold?: number;
      createdBy?: string;
    },
    tx: any,
  ) {
    const item = await tx.stockItem.create({
      data: {
        orgId,
        materialId: data.materialId,
        totalRemaining: data.quantity || 0,
        lowStockThreshold: data.lowStockThreshold ?? 10,
      },
    });

    const movement = await tx.stockMovement.create({
      data: {
        orgId,
        stockItemId: item.id,
        type: StockMovementType.RESTOCK,
        quantity: data.quantity || 0,
        note: "Initial system registration of physical material",
        createdBy: data.createdBy || "SYSTEM",
        referenceType: "INITIAL_LOAD",
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
  ========================================================= */
  async createMovement(params: CreateStockMovementInput, tx: any) {
    const {
      orgId,
      stockItemId,
      type,
      quantity,
      referenceId,
      referenceType,
      note,
      createdBy,
    } = params;

    const item = await tx.stockItem.findFirst({
      where: { id: stockItemId, orgId },
      include: { material: true },
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
          throw new Error(
            `Insufficient stock for ${item.material?.name}. Required: ${quantity}, Available: ${item.totalRemaining}`,
          );
        }
        delta = -quantity;
        break;
      case "ADJUST":
        delta = quantity - item.totalRemaining;
        break;
      default:
        throw new Error(`Unsupported movement type: ${type}`);
    }

    const newQuantity = item.totalRemaining + delta;

    // 1. UPDATE PROJECTION (SNAPSHOT)
    const updated = await tx.stockItem.update({
      where: { id: stockItemId },
      data: { totalRemaining: newQuantity },
    });

    // 2. WRITE TO LEDGER (AUDIT TRAIL)
    const movement = await tx.stockMovement.create({
      data: {
        orgId,
        stockItemId,
        type,
        quantity,
        referenceId,
        referenceType,
        note,
        createdBy,
      },
    });

    // 🚀 3. AUTOMATION: LOW STOCK CHECK
    // If we just reduced stock, check if we need to alert the manager
    if (
      type === "DEDUCT" ||
      type === "WASTE" ||
      (type === "ADJUST" && delta < 0)
    ) {
      await StockAlertService.checkThreshold({
        orgId,
        stockItemId: item.id,
        currentBalance: newQuantity,
        threshold: item.lowStockThreshold,
        materialName: item.material?.name || "Unknown Material",
        tx,
      });
    }

    // 4. BROADCAST FOR UI & INTELLIGENCE
    await Outbox.add(tx, {
      type: "stock.movement_created",
      orgId,
      payload: {
        movement,
        after: updated,
        materialName: item.material?.name,
      },
    });

    return updated;
  }

  /* =========================================================
     READ LAYER
  ========================================================= */
  async list(orgId: string) {
    return prisma.stockItem.findMany({
      where: { orgId },
      include: { material: true },
      orderBy: { updatedAt: "desc" },
    });
  }

  async findById(orgId: string, id: string) {
    return prisma.stockItem.findFirst({
      where: { id, orgId },
      include: {
        material: true,
        movements: {
          take: 20,
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }
}

export const stockService = new StockService();
