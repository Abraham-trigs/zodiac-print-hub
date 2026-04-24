import { apiHandler } from "@lib/server/api/apiHandler";
import { stockService } from "@lib/services/stock.service";
import { CreateStockMovementSchema } from "@lib/schema/stock.schema";

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
    const movement = await stockService.createMovement({
      orgId,
      stockItemId: body.stockItemId,
      type: body.type, // RESTOCK | DEDUCT | WASTE | ADJUST
      quantity: body.quantity,
      unitCost: body.unitCost,
      referenceId: body.referenceId,
      referenceType: body.referenceType,
      note: body.note,
      createdBy: body.createdBy,
    });

    return {
      movement,
    };
  },
  {
    requireAuth: true,
    requireOrg: true,
    schema: CreateStockMovementSchema,
  },
);
