import { apiHandler } from "@lib/server/api/apiHandler";
import { priceService } from "@lib/services/price.service";
import { UpdatePriceSchema } from "@lib/schema/price.schema";

// GET
export const GET = apiHandler(
  async ({ orgId }) => {
    return priceService.list(orgId);
  },
  {
    requireAuth: true,
    requireOrg: true,
  },
);

// PATCH
export const PATCH = apiHandler(
  async ({ orgId, body }) => {
    const { priceListId, ...data } = body;

    return priceService.updatePrice(orgId, priceListId, data);
  },
  {
    requireAuth: true,
    requireOrg: true,
    schema: UpdatePriceSchema,
  },
);
