import type { prisma } from "@lib/prisma-client";
import { DbClient } from "@lib/prisma-client";
import { StaffStatus } from "@prisma/client";

export class StaffRepository {
  static async list(orgId: string, tx?: DbClient) {
    const db = tx ?? prisma;
    return db.staff.findMany({
      where: { orgId, isActive: true },
      include: {
        user: { select: { name: true, email: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findById(orgId: string, id: string, tx?: DbClient) {
    const db = tx ?? prisma;
    return db.staff.findFirst({
      where: { id, orgId },
      include: { user: true },
    });
  }

  static async assignJob(
    orgId: string,
    staffId: string,
    jobId: string,
    tx?: DbClient,
  ) {
    const db = tx ?? prisma;
    return db.staff.update({
      where: { id: staffId, orgId },
      data: { currentJobId: jobId, status: StaffStatus.BUSY },
      include: { user: { select: { name: true } } },
    });
  }

  static async updateStatus(
    orgId: string,
    staffId: string,
    status: StaffStatus,
    tx?: DbClient,
  ) {
    const db = tx ?? prisma;
    return db.staff.update({
      where: { id: staffId, orgId },
      data: { status },
      include: { user: { select: { name: true } } },
    });
  }
}
