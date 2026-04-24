import { apiHandler } from "@lib/server/api/apiHandler";
import { priceService } from "@lib/services/price.service";
import { UpdatePriceSchema } from "@lib/schema/price.schema";

/* =========================================================
   GET /api/prices/:id
========================================================= */
export const GET = apiHandler<{ id: string }>(
  async ({ orgId, params }) => {
    const { id } = await params;

    if (!id) {
      throw new Error("Missing price id in route params");
    }

    return priceService.findById(orgId, id);
  },
  {
    requireAuth: true,
    requireOrg: true,
  },
);

/* =========================================================
   PATCH /api/prices/:id
========================================================= */
export const PATCH = apiHandler<{ id: string }, any>(
  async ({ orgId, params, body }) => {
    const { id } = await params;

    if (!id) {
      throw new Error("Missing price id in route params");
    }

    return priceService.updatePrice(orgId, id, body);
  },
  {
    requireAuth: true,
    requireOrg: true,
    schema: UpdatePriceSchema,
  },
);

/* =========================================================
   DELETE /api/prices/:id
========================================================= */
export const DELETE = apiHandler<{ id: string }>(
  async ({ orgId, params }) => {
    const { id } = await params;

    if (!id) {
      throw new Error("Missing price id in route params");
    }

    return priceService.delete(orgId, id);
  },
  {
    requireAuth: true,
    requireOrg: true,
  },
);
