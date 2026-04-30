// app/api/prices/route.ts
import { apiHandler } from "@lib/server/api/apiHandler";
import { productCoordinator } from "@root/lib/hooks/product-coordinator.handler";
import { priceService } from "@lib/services/price.service";
import { CreatePriceSchema } from "@lib/schema/price.schema";

export const GET = apiHandler(
  async ({ orgId }) => {
    return priceService.list(orgId);
  },
  {
    requireAuth: true,
    requireOrg: true,
  },
);

export const POST = apiHandler(
  async ({ orgId, body }) => {
    try {
      return await productCoordinator.saveNewProduct(orgId, body);
    } catch (error: any) {
      console.error("❌ [API/PRICES][POST]", {
        message: error?.message,
        stack: error?.stack,
        // 🔥 avoid dumping full body (PII / noise risk)
        input: {
          name: body?.name,
          type: body?.type,
        },
      });

      throw error;
    }
  },
  {
    requireAuth: true,
    requireOrg: true,
    schema: CreatePriceSchema,
  },
);
