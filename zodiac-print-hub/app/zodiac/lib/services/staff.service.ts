import { prisma } from "@/lib/db/prisma";
import { StaffRepository } from "@/lib/repositories/staff.repository";
import { Outbox } from "@/lib/db/outbox";
import { StaffStatus } from "@/types/zodiac.types";

export class StaffService {
  static async list(orgId: string) {
    return StaffRepository.list(orgId);
  }

  static async assignToJob(params: {
    orgId: string;
    jobId: string;
    staffId: string;
  }) {
    const { orgId, jobId, staffId } = params;

    return prisma.$transaction(async (tx) => {
      const staff = await StaffRepository.assignJob(orgId, staffId, jobId, tx);

      await Outbox.add(tx, {
        type: "staff.assigned",
        orgId,
        payload: {
          staffId,
          jobId,
          status: "BUSY", // derived state for UI sync
        },
      });

      return staff;
    });
  }

  static async setStatus(params: {
    orgId: string;
    staffId: string;
    status: StaffStatus;
  }) {
    const { orgId, staffId, status } = params;

    return prisma.$transaction(async (tx) => {
      const staff = await StaffRepository.updateStatus(
        orgId,
        staffId,
        status,
        tx,
      );

      await Outbox.add(tx, {
        type: "staff.status.updated",
        orgId,
        payload: {
          staffId,
          status,
        },
      });

      return staff;
    });
  }
}
