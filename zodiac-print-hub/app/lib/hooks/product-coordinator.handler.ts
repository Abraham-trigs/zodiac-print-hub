// app/lib/handlers/product-coordinator.handler.ts
import "server-only";

import { priceService } from "@lib/services/price.service";
import { stockService } from "@lib/services/stock.service";
import { UnitOfWork } from "@lib/db/unitOfWork";

export const productCoordinator = {
  async saveNewProduct(orgId: string, formData: any) {
    return UnitOfWork.run(async (tx) => {
      const { name, unit, priceGHS, category, type } = formData;

      const metadata = { ...formData.metadata };

      let stockRefId = metadata?.stockRefId;

      // 1. STOCK DOMAIN
      if (metadata?.kind === "MATERIAL" && !stockRefId) {
        const stock = await stockService.registerInitialStock(
          orgId,
          {
            name,
            unit,
            quantity: 0,
            unitCost: metadata.costPrice || 0,
          },
          tx,
        );

        stockRefId = stock.id;
      }

      // 2. PRICE DOMAIN (NO side effects except metadata binding)
      const price = await priceService.create(
        orgId,
        {
          name,
          category,
          unit,
          priceGHS,
          type,
          metadata: {
            ...metadata,
            stockRefId,
          },
        },
        tx,
      );

      return price;
    });
  },
};
