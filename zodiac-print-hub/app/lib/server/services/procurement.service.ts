import type { prisma } from "@lib/prisma-client";
import { UnitOfWork } from "@/lib/server/db/unitOfWork";
import { POStatus } from "@prisma/client";
import { ApiError } from "@/lib/apiHandler";

export class ProcurementService {
  /**
   * PHASE 2: CALCULATE JOB SHORTFALL
   * Analyzes a job to see if current stock can cover the requirement.
   */
  static async getJobShortfall(orgId: string, jobId: string) {
    const job = await prisma.job.findUnique({
      where: { id: jobId, orgId },
      include: {
        priceList: {
          include: {
            material: { include: { stockItem: true, supplier: true } },
          },
        },
      },
    });

    if (!job || !job.priceList.material) return null;

    const material = job.priceList.material;
    const currentStock = material.stockItem?.totalRemaining || 0;

    // Logic: In V2, quantity is the usage amount (sqft/m/pcs)
    const shortfall = job.quantity - currentStock;

    if (shortfall <= 0) return { hasEnough: true, shortfall: 0 };

    // Calculate how many 'Buying Units' (Rolls/Boxes) are needed
    const buyQuantity = material.buyQuantity || 1;
    const unitsToOrder = Math.ceil(shortfall / buyQuantity);

    return {
      hasEnough: false,
      shortfall,
      unitsToOrder,
      buyUnit: material.buyUnit,
      materialId: material.id,
      supplier: material.supplier,
      estimatedCost: unitsToOrder * material.purchasePrice,
    };
  }

  /**
   * PHASE 1 & 2: CREATE STOCK PURCHASE ORDER
   * Generates a DRAFT PO. Can be linked to a specific job or be a general restock.
   */
  static async createPurchaseOrder(params: {
    orgId: string;
    supplierId: string;
    items: { materialId: string; quantity: number; unitPrice: number }[];
    relatedJobId?: string;
  }) {
    return await UnitOfWork.run(async (tx) => {
      // 1. Fetch material units for the items
      const itemData = await Promise.all(
        params.items.map(async (item) => {
          const mat = await tx.material.findUnique({
            where: { id: item.materialId },
          });
          return {
            ...item,
            buyUnit: mat?.buyUnit || "unit",
          };
        }),
      );

      const totalCost = itemData.reduce(
        (sum, i) => sum + i.quantity * i.unitPrice,
        0,
      );

      // 2. Create the Master PO
      return await tx.stockPurchaseOrder.create({
        data: {
          orgId: params.orgId,
          supplierId: params.supplierId,
          relatedJobId: params.relatedJobId,
          totalCost,
          status: POStatus.DRAFT,
          items: {
            create: itemData.map((i) => ({
              materialId: i.materialId,
              quantity: i.quantity,
              buyUnit: i.buyUnit,
              unitPrice: i.unitPrice,
            })),
          },
        },
        include: { items: true, supplier: true },
      });
    });
  }

  /**
   * PHASE 3: ADVANCED RESTOCKING (Velocity Check)
   * Finds all materials below threshold and groups them by supplier
   */
  static async getAutoReorderSuggestions(orgId: string) {
    const lowStockItems = await prisma.stockItem.findMany({
      where: {
        orgId,
        totalRemaining: { lte: prisma.stockItem.fields.lowStockThreshold },
      },
      include: {
        material: { include: { supplier: true } },
      },
    });

    // Group suggestions by Supplier to enable "Batch Ordering"
    const suggestionsBySupplier: Record<string, any> = {};

    lowStockItems.forEach((item) => {
      const supplierId = item.material.supplierId || "UNASSIGNED";
      if (!suggestionsBySupplier[supplierId]) {
        suggestionsBySupplier[supplierId] = {
          supplier: item.material.supplier,
          items: [],
        };
      }

      const shortfall = item.lowStockThreshold - item.totalRemaining;
      const unitsToOrder = Math.ceil(
        shortfall / (item.material.buyQuantity || 1),
      );

      suggestionsBySupplier[supplierId].items.push({
        materialId: item.materialId,
        name: item.material.name,
        current: item.totalRemaining,
        suggested: Math.max(unitsToOrder, item.material.minOrderQty || 1),
        unit: item.material.buyUnit,
        cost: item.material.purchasePrice,
      });
    });

    return suggestionsBySupplier;
  }
}
