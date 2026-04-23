import { prisma } from "@lib/prisma-client";
import { DbClient } from "@lib/prisma-client";

type TxOrDb = DbClient | undefined;

const getDb = (tx?: TxOrDb) => {
  if (tx) return tx;
  return prisma;
};

export class PriceRepository {
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

  static async updatePrice(
    orgId: string,
    id: string,
    data: {
      priceGHS?: number;
      name?: string;
      unit?: string;
      category?: string;
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
}
