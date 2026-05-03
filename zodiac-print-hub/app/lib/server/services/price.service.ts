// app/lib/services/price.service.ts

import { PriceRepository } from "@lib/server/repositories/price.repository";
import { UnitOfWork } from "@lib/server/db/unitOfWork";
import { Outbox } from "@lib/db/outbox";
import type { prisma } from "@lib/prisma-client";

import type { PriceItemType, PriceItemMetadata } from "@types/zodiac.types";

type PrismaTransactionClient = Prisma.TransactionClient;

/* =========================================================
   INPUT TYPES (CANONICAL)
========================================================= */

type CreatePriceInput = {
  name: string;
  category: string;
  unit: string;
  priceGHS: number;

  type: PriceItemType;
  metadata: PriceItemMetadata;
};

type UpdatePriceInput = {
  name?: string;
  category?: string;
  unit?: string;
  priceGHS?: number;
  isActive?: boolean;

  metadata?: Partial<PriceItemMetadata>;
};

/* =========================================================
   SERVICE
========================================================= */

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

  async create(
    orgId: string,
    data: CreatePriceInput,
    txClient?: PrismaTransactionClient,
  ) {
    const execute = async (tx: PrismaTransactionClient) => {
      const created = await PriceRepository.create(
        orgId,
        {
          name: data.name,
          category: data.category,
          unit: data.unit,
          priceGHS: data.priceGHS,

          // 🔥 SINGLE SOURCE OF TRUTH
          type: data.type,
          metadata: data.metadata,
        } as any,
        tx,
      );

      await Outbox.add(tx, {
        type: "PRICE_CREATED"
        orgId,
        payload: created,
      });

      return created;
    };

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
        data as any,
        tx,
      );

      await Outbox.add(tx, {
        type: "PRICE_CREATED"
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
        type: "PRICE_CREATED"
        orgId,
        payload: deleted,
      });

      return deleted;
    };

    return txClient ? execute(txClient) : UnitOfWork.run(execute);
  }
}

/* =========================================================
   EXPORT
========================================================= */

export const priceService = new PriceService();
