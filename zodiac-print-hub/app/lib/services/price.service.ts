// app/lib/services/price.service.ts

import { PriceRepository } from "@lib/repositories/price.repository";
import { UnitOfWork } from "@lib/db/unitOfWork";
import { Outbox } from "@lib/db/outbox";
import { Prisma } from "@prisma/client";

type PrismaTransactionClient = Prisma.TransactionClient;

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

  async findById(orgId: string, id: string, tx?: PrismaTransactionClient) {
    const item = await PriceRepository.findById(orgId, id, tx);
    if (!item) throw new Error("Price item not found");
    return item;
  }

  /* =========================================================
     CREATE
  ========================================================= */

  /**
   * Supports both standalone calls and nested coordinator calls via txClient
   */
  async create(
    orgId: string,
    data: CreatePriceInput,
    txClient?: PrismaTransactionClient,
  ) {
    const execute = async (tx: PrismaTransactionClient) => {
      const created = await PriceRepository.create(orgId, data, tx);

      await Outbox.add(tx, {
        type: "price.created",
        orgId,
        payload: created,
      });

      return created;
    };

    // If txClient exists (from Coordinator), use it. Otherwise, start new UnitOfWork.
    return txClient ? execute(txClient) : UnitOfWork.run(execute);
  }

  /* =========================================================
     UPDATE
  ========================================================= */

  async updatePrice(
    orgId: string,
    priceListId: string,
    data: UpdatePriceInput,
    txClient?: PrismaTransactionClient,
  ) {
    const execute = async (tx: PrismaTransactionClient) => {
      const existing = await PriceRepository.findById(orgId, priceListId, tx);

      if (!existing) {
        throw new Error("Price item not found");
      }

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
    };

    return txClient ? execute(txClient) : UnitOfWork.run(execute);
  }

  /* =========================================================
     DELETE
  ========================================================= */

  async delete(orgId: string, id: string, txClient?: PrismaTransactionClient) {
    const execute = async (tx: PrismaTransactionClient) => {
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
    };

    return txClient ? execute(txClient) : UnitOfWork.run(execute);
  }
}

/* ---------------- INSTANCE EXPORT ---------------- */

export const priceService = new PriceService();
