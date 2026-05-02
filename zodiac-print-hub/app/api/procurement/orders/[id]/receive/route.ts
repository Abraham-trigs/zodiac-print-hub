import { apiHandler, ApiError } from "@/lib/apiHandler";
import { prisma } from "@/lib/prisma";
import { UnitOfWork } from "@/lib/db/unitOfWork";
import { stockService } from "@/lib/services/stock.service";
import { POStatus, StockMovementType } from "@prisma/client";

export const POST = apiHandler<{ id: string }>(
  async ({ params, orgId, user }) => {
    const { id } = await params;

    return await UnitOfWork.run(async (tx) => {
      // 1. Resolve PO with its items and material details
      const po = await tx.stockPurchaseOrder.findUnique({
        where: { id, orgId },
        include: {
          items: { include: { material: { include: { stockItem: true } } } },
        },
      });

      if (!po || po.status === POStatus.RECEIVED) {
        throw new ApiError("Order already processed or not found", 400);
      }

      // 2. TRIGGER LEDGER ENTRIES (The physical balance update)
      for (const item of po.items) {
        if (!item.material.stockItemId) continue;

        // Logic: buyQuantity (e.g. 150ft) * item.quantity (e.g. 2 rolls)
        const totalPhysicalYield =
          (item.material.buyQuantity || 1) * item.quantity;

        await stockService.createMovement(
          {
            orgId,
            stockItemId: item.material.stockItemId,
            type: StockMovementType.RESTOCK,
            quantity: totalPhysicalYield,
            referenceId: po.id,
            referenceType: "PURCHASE_ORDER",
            createdBy: user.id,
            note: `Received PO #${po.id.slice(-4).toUpperCase()} from Supplier`,
          },
          tx,
        );
      }

      // 3. FINALIZE PO STATUS
      return await tx.stockPurchaseOrder.update({
        where: { id },
        data: {
          status: POStatus.RECEIVED,
          receivedAt: new Date(),
        },
      });
    });
  },
  { requireAuth: true, requireOrg: true },
);
