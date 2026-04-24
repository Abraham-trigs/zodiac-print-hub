import { apiHandler } from "@lib/server/api/apiHandler";
import { priceService } from "@lib/services/price.service";
import { CreatePriceSchema } from "@lib/schema/price.schema";

/* =========================================================
   GET /api/prices
========================================================= */
export const GET = apiHandler(
  async ({ orgId }) => {
    return priceService.list(orgId);
  },
  {
    requireAuth: true,
    requireOrg: true,
  },
);

/* =========================================================
   POST /api/prices
========================================================= */
export const POST = apiHandler(
  async ({ orgId, body }) => {
    return priceService.create(orgId, body);
  },
  {
    requireAuth: true,
    requireOrg: true,
    schema: CreatePriceSchema,
  },
);
