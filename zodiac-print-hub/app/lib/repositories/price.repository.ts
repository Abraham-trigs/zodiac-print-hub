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
        isActive: true, // Only return active prices for the main list
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
      unit: any; // Using any or matching Prisma enum
      priceGHS: number;
      costPrice?: number; // 🔥 NEW: Added for profit tracking
      stockRefId?: string;
    },
    tx?: DbClient,
  ) {
    const db = getDb(tx);

    return db.priceList.create({
      data: {
        ...data,
        orgId,
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
      priceGHS?: number;
      costPrice?: number; // 🔥 NEW: Added
      name?: string;
      unit?: any;
      category?: string;
      stockRefId?: string; // 🔥 NEW: Allow re-linking to stock
      isActive?: boolean; // 🔥 NEW: Allow reactivation
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

    // Standard practice: mark as inactive rather than removing
    // historical data needed for old Jobs.
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
