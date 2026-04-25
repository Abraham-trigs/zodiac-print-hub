// app/lib/handlers/product-coordinator.handler.ts
import "server-only"; // 🔥 Forces build error if imported in a Client Component

import { priceService } from "@lib/services/price.service";
import { StockRepository } from "@lib/repositories/stock.repository";
import { UnitOfWork } from "@lib/db/unitOfWork";

export const productCoordinator = {
  async saveNewProduct(orgId: string, formData: any) {
    return UnitOfWork.run(async (tx) => {
      let finalStockId = formData.stockRefId;

      // 1. Logic remains on server: Create material if needed
      if (formData.isPhysical && !finalStockId) {
        const newStock = await StockRepository.create(
          orgId,
          {
            name: formData.name,
            unit: formData.unit,
            initialQuantity: formData.quantity || 0,
          },
          tx,
        );
        finalStockId = newStock.id;
      }

      // 2. Create the linked Price entry
      return await priceService.create(
        orgId,
        {
          ...formData,
          stockRefId: finalStockId,
        },
        tx,
      );
    });
  },
};
