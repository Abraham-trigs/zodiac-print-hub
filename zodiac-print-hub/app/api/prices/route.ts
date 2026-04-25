// app/api/prices/route.ts
import { apiHandler } from "@lib/server/api/apiHandler";
import { productCoordinator } from "@lib/handlers/product-coordinator.handler"; // 🔥 Use Coordinator
import { priceService } from "@lib/services/price.service";
import { CreatePriceSchema } from "@lib/schema/price.schema";

export const GET = apiHandler(async ({ orgId }) => priceService.list(orgId), {
  requireAuth: true,
  requireOrg: true,
});

export const POST = apiHandler(
  async ({ orgId, body }) => {
    // 🔥 NEW: Orchestrate Material + Price creation at once on the server
    return productCoordinator.saveNewProduct(orgId, body);
  },
  {
    requireAuth: true,
    requireOrg: true,
    schema: CreatePriceSchema,
  },
);
