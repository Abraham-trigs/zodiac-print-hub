import { z } from "zod";
import { apiHandler } from "@lib/server/api/apiHandler";
import { priceService } from "@lib/services/price.service";

const updatePriceSchema = z.object({
  priceListId: z.string().min(1),
  priceGHS: z.number().positive(),
});

// GET
export const GET = apiHandler(async ({ orgId }) => {
  const priceList = await priceService.list(orgId);
  return priceList?.items ?? [];
});

// PATCH
export const PATCH = apiHandler(
  async ({ orgId, body }) => {
    return priceService.updatePrice(body.priceListId, body.priceGHS, orgId);
  },
  {
    requireAuth: true,
    requireOrg: true,
    schema: updatePriceSchema,
  },
);
