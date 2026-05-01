import { prisma } from "@lib/prisma-client";
import { StaffRepository } from "@lib/repositories/staff.repository";
import { Outbox } from "@lib/db/outbox";
import { StaffStatus } from "@prisma/client";

export class StaffService {
  static async list(orgId: string) {
    return StaffRepository.list(orgId);
  }

  static async assignToJob(params: {
    orgId: string;
    jobId: string;
    staffId: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const staff = await StaffRepository.assignJob(
        params.orgId,
        params.staffId,
        params.jobId,
        tx,
      );

      await Outbox.add(tx, {
        type: "staff.assigned",
        orgId: params.orgId,
        payload: {
          staffId: params.staffId,
          jobId: params.jobId,
          status: StaffStatus.BUSY,
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
    return prisma.$transaction(async (tx) => {
      const staff = await StaffRepository.updateStatus(
        params.orgId,
        params.staffId,
        params.status,
        tx,
      );

      await Outbox.add(tx, {
        type: "staff.status.updated",
        orgId: params.orgId,
        payload: { staffId: params.staffId, status: params.status },
      });

      return staff;
    });
  }
}
