// app/lib/services/price.service.ts

import { PriceRepository } from "@lib/repositories/price.repository";
import { UnitOfWork } from "@lib/db/unitOfWork";
import { Outbox } from "@lib/db/outbox";

// 🔥 ALIGNED: Types now include costPrice and isActive
type CreatePriceInput = {
  name: string;
  category: string;
  unit: string;
  priceGHS: number;
  costPrice?: number;
  stockRefId?: string;
};

type UpdatePriceInput = {
  priceGHS?: number;
  costPrice?: number;
  name?: string;
  unit?: string;
  category?: string;
  stockRefId?: string;
  isActive?: boolean;
};

class PriceService {
  /* =========================================================
     READ
  ========================================================= */

  async list(orgId: string) {
    const items = await PriceRepository.list(orgId);
    return { items };
  }

  async findById(orgId: string, id: string) {
    const item = await PriceRepository.findById(orgId, id);
    if (!item) throw new Error("Price item not found");
    return item;
  }

  /* =========================================================
     CREATE
  ========================================================= */

  async create(orgId: string, data: CreatePriceInput) {
    return UnitOfWork.run(async (tx) => {
      const created = await PriceRepository.create(orgId, data, tx);

      await Outbox.add(tx, {
        type: "price.created",
        orgId,
        payload: created,
      });

      return created;
    });
  }

  /* =========================================================
     UPDATE
  ========================================================= */

  async updatePrice(
    orgId: string,
    priceListId: string,
    data: UpdatePriceInput,
  ) {
    return UnitOfWork.run(async (tx) => {
      const existing = await PriceRepository.findById(orgId, priceListId, tx);

      if (!existing) {
        throw new Error("Price item not found");
      }

      // 🔥 FIXED: Method name was updatePrice, repository is usually .update
      const updated = await PriceRepository.update(
        orgId,
        priceListId,
        data,
        tx,
      );

      await Outbox.add(tx, {
        type: "price.updated",
        orgId,
        payload: {
          before: existing,
          after: updated,
          diff: data,
        },
      });

      return updated;
    });
  }

  /* =========================================================
     DELETE
  ========================================================= */

  async delete(orgId: string, id: string) {
    return UnitOfWork.run(async (tx) => {
      const existing = await PriceRepository.findById(orgId, id, tx);

      if (!existing) {
        throw new Error("Price item not found");
      }

      const deleted = await PriceRepository.delete(orgId, id, tx);

      await Outbox.add(tx, {
        type: "price.deleted",
        orgId,
        payload: deleted,
      });

      return deleted;
    });
  }
}

/* ---------------- INSTANCE EXPORT ---------------- */

// ✅ MOVED: Instance created after class is fully defined to fix ReferenceError
export const priceService = new PriceService();
