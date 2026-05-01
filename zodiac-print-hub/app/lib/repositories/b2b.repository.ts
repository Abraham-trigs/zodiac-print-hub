import { prisma } from "@lib/prisma-client";
import { DbClient } from "@lib/prisma-client"; // 🔥 Import the Type
import { B2BStatus } from "@prisma/client"; // 🔥 Use Prisma Enum for safety

export class B2BRepository {
  /**
   * CREATE B2B PUSH
   * 🔥 FIXED: Added 'tx' support for transactional safety
   */
  static async create(
    data: {
      orgId: string;
      originalJobId: string;
      clientName: string;
      serviceName: string;
      specs: string;
      deadline: Date;
      suggestedPrice?: number;
    },
    tx?: DbClient, // ✅ Pass the transaction context
  ) {
    const db = tx ?? prisma;
    return db.b2BPush.create({ data });
  }

  /**
   * LIST PUSHES
   * Ordered by most recent for Dashboard visibility
   */
  static async list(orgId: string) {
    return prisma.b2BPush.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * UPDATE STATUS
   * Logic: Used when a partner ACCEPTS or REJECTS a pushed job.
   */
  static async updateStatus(id: string, status: B2BStatus, tx?: DbClient) {
    const db = tx ?? prisma;
    return db.b2BPush.update({
      where: { id },
      data: { status },
    });
  }
}
