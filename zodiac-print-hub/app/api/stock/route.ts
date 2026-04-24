import { apiHandler } from "@lib/server/api/apiHandler";
import { stockService } from "@lib/services/stock.service";
import { CreateStockMovementSchema } from "@lib/schema/stock.schema";
import { UnitOfWork } from "@lib/db/unitOfWork"; // 🔥 NEW: Required for transaction safety

/* =========================================================
   GET STOCK LIST
========================================================= */

export const GET = apiHandler(
  async ({ orgId }) => {
    return stockService.list(orgId);
  },
  {
    requireAuth: true,
    requireOrg: true,
  },
);

/* =========================================================
   STOCK MOVEMENT (LEDGER-BASED)
========================================================= */

export const POST = apiHandler(
  async ({ orgId, body }) => {
    // 🔥 FIX: Wrap in UnitOfWork to provide the required 'tx'
    // and ensure the ledger + balance update stay in sync.
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
        tx, // ✅ Pass the transaction client here
      );

      return {
        success: true,
        data: updatedItem,
      };
    });
  },
  {
    requireAuth: true,
    requireOrg: true,
    schema: CreateStockMovementSchema,
  },
);
