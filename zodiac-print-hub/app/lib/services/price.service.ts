import { PriceRepository } from "@lib/repositories/price.repository";
import { UnitOfWork } from "@lib/db/unitOfWork";
import { Outbox } from "@lib/db/outbox";

class PriceService {
  async list(orgId: string) {
    const items = await PriceRepository.list(orgId);
    return { items };
  }

  async updatePrice(orgId: string, priceListId: string, priceGHS: number) {
    return UnitOfWork.run(async (tx) => {
      const existing = await PriceRepository.findById(orgId, priceListId, tx);

      if (!existing) {
        throw new Error("Price item not found");
      }

      const updated = await PriceRepository.updatePrice(
        orgId,
        priceListId,
        priceGHS,
        tx,
      );

      await Outbox.add(tx, {
        type: "price.updated",
        orgId,
        payload: updated,
      });

      return updated;
    });
  }
}

/* ---------------- INSTANCE EXPORT ---------------- */

export const priceService = new PriceService();
