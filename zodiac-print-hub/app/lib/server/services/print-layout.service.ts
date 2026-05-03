import { UnitOfWork } from "@lib/server/db/unitOfWork";
import { stockService } from "./stock.service";
import { Outbox } from "@/lib/erver/db/outbox";
import { LayoutStatus, StockMovementType } from "@prisma/client";

export class PrintLayoutService {
  /**
   * CONFIRM LAYOUT SHOOT
   * 🔥 The Industrial Handshake: Deducts linear material and locks the layout.
   * Handles both Jobs and JobVariables (Add-ons).
   */
  static async confirmLayoutShoot(params: {
    orgId: string;
    layoutId: string;
    userId: string;
  }) {
    return UnitOfWork.run(async (tx) => {
      // 1. Resolve the Map and its technical specs
      const layout = await tx.materialPrintLayout.findUnique({
        where: { id: params.layoutId, orgId: params.orgId },
        include: {
          items: true,
          material: { include: { stockItem: true } },
        },
      });

      if (!layout || layout.status !== LayoutStatus.LOCKED) {
        throw new Error("Layout not found or not in a shootable state.");
      }

      // 2. LINEAR STOCK DEDUCTION (The Physical Audit)
      // We deduct the 'cutLineHeight' because that is the total roll consumed.
      if (layout.material.stockItem) {
        await stockService.createMovement(
          {
            orgId: params.orgId,
            stockItemId: layout.material.stockItem.id,
            type: StockMovementType.DEDUCT,
            quantity: layout.cutLineHeight,
            referenceId: layout.id,
            referenceType: "MATERIAL_PRINT_LAYOUT",
            createdBy: params.userId,
            note: `Production Shoot: ${layout.items.length} items. Linear: ${layout.cutLineHeight}${layout.material.unit}`,
          },
          tx,
        );
      }

      // 3. ATOMIC STATUS UPDATES
      // Move layout to COMPLETED
      await tx.materialPrintLayout.update({
        where: { id: layout.id },
        data: { status: LayoutStatus.COMPLETED },
      });

      // 4. SYNCHRONIZE JOB STATUSES
      // Identify all Main Jobs and Variables in this shoot
      const jobIds = layout.items
        .map((i) => i.jobId)
        .filter(Boolean) as string[];
      const variableIds = layout.items
        .map((i) => i.jobVariableId)
        .filter(Boolean) as string[];

      // Move Main Jobs to IN_PROGRESS
      if (jobIds.length > 0) {
        await tx.job.updateMany({
          where: { id: { in: jobIds } },
          data: { status: "IN_PROGRESS" },
        });
      }

      // 5. BROADCAST SUCCESS
      await Outbox.add(tx, {
        type: "production.layout_shot",
        orgId: params.orgId,
        payload: {
          layoutId: layout.id,
          materialName: layout.material.name,
          totalLinear: layout.cutLineHeight,
          itemsCount: layout.items.length,
        },
      });

      return layout;
    });
  }
}
