// app/lib/handlers/product-coordinator.handler.ts
import "server-only";

import { priceService } from "@lib/services/price.service";
import { stockService } from "@lib/services/stock.service";
import { UnitOfWork } from "@lib/db/unitOfWork";

/**
 * PRODUCT COORDINATOR
 * Orchestrates the creation of a PriceList entry and its
 * corresponding StockItem + Ledger entry in a single atomic transaction.
 */
export const productCoordinator = {
  async saveNewProduct(orgId: string, formData: any) {
    return UnitOfWork.run(async (tx) => {
      // 1. Resolve Identity & Flags
      // Fallback: If quantity > 0, we treat it as physical even if the flag is lost.
      const isPhysical =
        formData.isPhysical === true || Number(formData.quantity) > 0;
      let finalStockId = formData.stockRefId;

      console.log(
        `[Joinery] Processing: ${formData.name} (Physical: ${isPhysical})`,
      );

      // 2. STOCK JOINERY: Register new Material if it doesn't exist yet
      if (isPhysical && !finalStockId) {
        console.log("[Joinery] Creating new StockItem and Ledger...");

        const newStock = await stockService.registerInitialStock(
          orgId,
          {
            name: formData.name,
            unit: formData.unit || "piece",
            quantity: Number(formData.quantity) || 0,
            unitCost: Number(formData.costPrice) || 0, // Maps to mandatory lastUnitCost
          },
          tx,
        );

        finalStockId = newStock.id;
        console.log(`[Joinery] Stock ID Generated: ${finalStockId}`);
      }

      // 3. PRICE CREATION: Create the "Menu" entry linked to the Stock ID
      const priceEntry = await priceService.create(
        orgId,
        {
          name: formData.name,
          category: formData.category || "General",
          unit: formData.unit,
          priceGHS: Number(formData.priceGHS) || 0,
          costPrice: Number(formData.costPrice) || 0,
          stockRefId: finalStockId || null, // Link the joinery
        },
        tx,
      );

      console.log(
        `[Joinery] Final Price ID: ${priceEntry.id} linked to Stock: ${finalStockId || "NONE"}`,
      );

      return priceEntry;
    });
  },
};
