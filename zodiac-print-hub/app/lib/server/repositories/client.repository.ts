import type { prisma } from "@lib/prisma-client";
import { DbClient } from "@lib/prisma-client";
import { ClientType } from "@lib/shared/types/zodiac.types";

type TxOrDb = DbClient | undefined;

const getDb = (tx?: TxOrDb) => tx ?? prisma;

/* =========================================================
   UPDATE INPUT (DOMAIN SYNCED)
========================================================= */

type UpdateClientInput = Partial<{
  name: string;
  type: ClientType;
  phone: string;
  email: string;
  companyName: string;
  location: string;
  profilePictureUrl: string;
  notes: string;

  /* lifecycle tracking (USED by JobService) */
  lastJobId: string;
  lastJobDate: Date | string;
  totalJobs: number;

  /* FIXED naming (was lastStaffId) */
  recentStaffId: string;

  mostPrintedServiceId: string;

  isNew: boolean;
}>;

/* =========================================================
   CLIENT REPOSITORY
========================================================= */

export class ClientRepository {
  static async create(
    data: {
      orgId: string;
      name: string;
      type: ClientType;
      phone: string;
      email?: string;
    },
    tx?: DbClient,
  ) {
    const db = getDb(tx);

    return db.client.create({
      data: {
        ...data,
        isNew: true,
      },
    });
  }

  static async list(orgId: string, tx?: DbClient) {
    const db = getDb(tx);

    return db.client.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async search(orgId: string, query: string, tx?: DbClient) {
    const db = getDb(tx);

    const all = await db.client.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
    });

    const q = query.toLowerCase().trim();

    return q ? all.filter((c) => c.name.toLowerCase().includes(q)) : all;
  }

  static async findById(orgId: string, id: string, tx?: DbClient) {
    const db = getDb(tx);

    return db.client.findFirst({
      where: { id, orgId },
    });
  }

  static async update(
    orgId: string,
    id: string,
    data: UpdateClientInput,
    tx?: DbClient,
  ) {
    const db = getDb(tx);

    return db.client.update({
      where: {
        id,
        orgId,
      },
      data,
    });
  }

  static async delete(orgId: string, id: string, tx?: DbClient) {
    const db = getDb(tx);

    return db.client.delete({
      where: {
        id,
        orgId,
      },
    });
  }
}
