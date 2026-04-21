import { prisma } from "@/lib/db/prisma";
import { DbClient } from "@/lib/db/prisma-client";
import { StaffStatus } from "@/types/zodiac.types";

export class StaffRepository {
  static async list(orgId: string, tx?: DbClient) {
    const db = tx ?? prisma;

    return db.staff.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findById(orgId: string, id: string, tx?: DbClient) {
    const db = tx ?? prisma;

    return db.staff.findFirst({
      where: { id, orgId },
    });
  }

  /**
   * NOTE:
   * Staff is NOT authoritative for job assignment.
   * JobService owns assignment logic.
   *
   * This method should only reflect projected state if needed.
   */
  static async setAssignedJobSnapshot(
    orgId: string,
    staffId: string,
    jobId: string,
    tx?: DbClient,
  ) {
    const db = tx ?? prisma;

    const staff = await db.staff.findFirst({
      where: { id: staffId, orgId },
    });

    if (!staff) throw new Error("Staff not found");

    return db.staff.update({
      where: { id: staffId },
      data: {
        currentJobId: jobId, // ❗ cache only (projection layer)
      },
    });
  }

  static async updateStatus(
    orgId: string,
    staffId: string,
    status: StaffStatus,
    tx?: DbClient,
  ) {
    const db = tx ?? prisma;

    const staff = await db.staff.findFirst({
      where: { id: staffId, orgId },
    });

    if (!staff) throw new Error("Staff not found");

    return db.staff.update({
      where: { id: staffId },
      data: { status },
    });
  }
}
