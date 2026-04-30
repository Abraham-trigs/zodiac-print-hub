import { prisma } from "@lib/prisma-client";
import { DbClient } from "@lib/prisma-client";

type TxOrDb = DbClient | undefined;

const getDb = (tx?: TxOrDb) => {
  return tx ?? prisma;
};

export class PriceRepository {
  /* =========================================================
     READ
  ========================================================= */

  static async list(orgId: string, tx?: DbClient) {
    const db = getDb(tx);

    return db.priceList.findMany({
      where: {
        orgId,
        isActive: true,
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  static async findById(orgId: string, id: string, tx?: DbClient) {
    const db = getDb(tx);

    return db.priceList.findFirst({
      where: { id, orgId },
    });
  }

  /* =========================================================
     CREATE
  ========================================================= */

  static async create(
    orgId: string,
    data: {
      name: string;
      category: string;
      unit: string;
      priceGHS: number;

      // 🔥 DOMAIN MODEL (ONLY SOURCE OF TRUTH)
      type: string;
      metadata: any;
    },
    tx?: DbClient,
  ) {
    const db = getDb(tx);

    return db.priceList.create({
      data: {
        orgId,
        name: data.name,
        category: data.category,
        unit: data.unit,
        priceGHS: data.priceGHS,

        type: data.type,
        metadata: data.metadata,

        isActive: true,
      },
    });
  }

  /* =========================================================
     UPDATE
  ========================================================= */

  static async update(
    orgId: string,
    id: string,
    data: {
      name?: string;
      category?: string;
      unit?: string;
      priceGHS?: number;
      isActive?: boolean;

      metadata?: any;
      type?: string;
    },
    tx?: DbClient,
  ) {
    const db = getDb(tx);

    return db.priceList.update({
      where: {
        id,
        orgId,
      },
      data,
    });
  }

  /* =========================================================
     DELETE (SOFT DELETE)
  ========================================================= */

  static async delete(orgId: string, id: string, tx?: DbClient) {
    const db = getDb(tx);

    return db.priceList.update({
      where: {
        id,
        orgId,
      },
      data: {
        isActive: false,
      },
    });
  }
}
