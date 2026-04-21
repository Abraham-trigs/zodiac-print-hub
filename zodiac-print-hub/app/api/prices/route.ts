import { z } from "zod";
import { apiHandler } from "@lib/server/api/apiHandler";
import { priceService } from "@lib/services/price.service";

const updatePriceSchema = z.object({
  serviceId: z.string().min(1),
  price: z.number().positive(),
});

// GET
export const GET = apiHandler(async ({ orgId }) => {
  const priceList = await priceService.list(orgId);
  return priceList?.items ?? [];
});

// PATCH
export const PATCH = apiHandler(
  async ({ orgId, body }) => {
    return priceService.updatePrice(body.serviceId, body.price, orgId);
  },
  {
    requireOrg: true,
    schema: updatePriceSchema,
  },
);
