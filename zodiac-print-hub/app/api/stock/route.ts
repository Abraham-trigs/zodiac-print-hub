import { apiHandler } from "@lib/server/api/apiHandler";
import { stockService } from "@lib/server/services/stock.service";
import { CreateStockMovementSchema } from "@lib/shared/schema/stock.schema";
import { UnitOfWork } from "@lib/server/db/unitOfWork";
import { prisma } from "@lib/prisma-client"; // 🚀 Added direct prisma for simple GET query

/* =========================================================
   GET STOCK LIST (V2 RECIPE AWARE)
========================================================= */

export const GET = apiHandler(
  async ({ orgId }) => {
    // 🔥 V2 UPDATE: We must include the Material details.
    // Without this, the UI won't know the Unit (sqft/ft) or the Logic (Dimensional).
    const inventory = await prisma.stockItem.findMany({
      where: { orgId },
      include: {
        material: true, // 🚀 Essential: Link back to technical specs
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return inventory;
  },
  {
    requireAuth: true,
    requireOrg: true,
  },
);

/* =========================================================
   STOCK MOVEMENT (LEDGER-BASED) - CONFIRMED
========================================================= */

export const POST = apiHandler(
  async ({ orgId, body }) => {
    // Atomic Transaction: Ensures Ledger Entry + Total Remaining stay in sync
    return UnitOfWork.run(async (tx) => {
      const updatedItem = await stockService.createMovement(
        {
          orgId,
          stockItemId: body.stockItemId,
          type: body.type,
          quantity: body.quantity,
          unitCost: body.unitCost,
          referenceId: body.referenceId,
          referenceType: body.referenceType,
          note: body.note,
          createdBy: body.createdBy,
        },
        tx,
      );

      return updatedItem; // Simplified return (apiHandler wraps this in { data: ... })
    });
  },
  {
    requireAuth: true,
    requireOrg: true,
    schema: CreateStockMovementSchema,
  },
);
