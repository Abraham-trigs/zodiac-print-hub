// app/api/prices/route.ts
import { apiHandler } from "@lib/server/api/apiHandler";
import { productCoordinator } from "@lib/handlers/product-coordinator.handler";
import { priceService } from "@lib/services/price.service";
import { CreatePriceSchema } from "@lib/schema/price.schema";

export const GET = apiHandler(async ({ orgId }) => priceService.list(orgId), {
  requireAuth: true,
  requireOrg: true,
});

export const POST = apiHandler(
  async ({ orgId, body }) => {
    try {
      // 🔥 The "Joinery" happens here: Material + Price
      return await productCoordinator.saveNewProduct(orgId, body);
    } catch (error: any) {
      // This will force the REAL error (Prisma, Zod, or Logic) to appear in your terminal
      console.error("❌ [API/PRICES] POST ERROR:", {
        message: error.message,
        stack: error.stack,
        body,
      });
      throw error; // Re-throw so the apiHandler sends the 500 to the client
    }
  },
  {
    requireAuth: true,
    requireOrg: true,
    schema: CreatePriceSchema,
  },
);
