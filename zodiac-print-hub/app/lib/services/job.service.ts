import { JobRepository } from "@lib/repositories/job.repository";
import { stockService } from "@lib/services/stock.service";
import type { PriceItem } from "@types/zodiac.types";
import { UnitOfWork } from "@lib/db/unitOfWork";
import { Outbox } from "@lib/db/outbox";

export class JobService {
  async createJob(params: {
    orgId: string;
    clientId: string;
    service: PriceItem;
    quantity: number;
    width?: number;
    height?: number;
    assignedStaffId?: string;
    notes?: string;
  }) {
    const {
      orgId,
      clientId,
      service,
      quantity,
      width,
      height,
      assignedStaffId,
      notes,
    } = params;

    return UnitOfWork.run(async (tx) => {
      const now = new Date();

      // Domain rule: only large-format jobs use dimensions
      const isLargeFormat = ["sqft", "sqm"].includes(service.unit);

      const area = isLargeFormat ? (width ?? 1) * (height ?? 1) : 1;
      const units = isLargeFormat ? area * quantity : quantity;

      const totalPrice = units * service.priceGHS;

      // 1. CREATE JOB
      const job = await JobRepository.create(
        {
          orgId,
          clientId,
          serviceId: service.id,
          serviceName: service.name,
          quantity,
          width,
          height,
          unit: service.unit,
          totalPrice,
          assignedStaffId,
          notes,
        },
        tx,
      );

      // 2. UPDATE CLIENT
      await tx.client.update({
        where: { id: clientId },
        data: {
          lastJobId: job.id,
          lastJobDate: now,
          isNew: false,
          totalJobs: { increment: 1 },
          recentStaffId: assignedStaffId ?? undefined,
          mostPrintedServiceId: service.id,
        },
      });

      // 3. STOCK MOVEMENT (NOW TX-CORRECT)
      if (service.stockRefId) {
        await stockService.createMovement(
          {
            orgId,
            stockItemId: service.stockRefId,
            type: "DEDUCT",
            quantity: units,
            referenceId: job.id,
            referenceType: "JOB",
            note: `Auto deduction from job ${job.id}`,
            createdBy: assignedStaffId ?? "system",
          },
          tx, // ✅ CRITICAL FIX
        );
      }

      // 4. OUTBOX EVENT
      await Outbox.add(tx, {
        type: "job.created",
        orgId,
        payload: job,
      });

      return job;
    });
  }

  async updateStatus(orgId: string, jobId: string, status: any) {
    return UnitOfWork.run(async (tx) => {
      const job = await JobRepository.updateStatus(orgId, jobId, status, tx);

      await Outbox.add(tx, {
        type: "job.updated",
        orgId,
        payload: job,
      });

      return job;
    });
  }

  async assignStaff(orgId: string, jobId: string, staffId: string) {
    return UnitOfWork.run(async (tx) => {
      const job = await JobRepository.assignStaff(orgId, jobId, staffId, tx);

      await Outbox.add(tx, {
        type: "job.staff_assigned",
        orgId,
        payload: job,
      });

      return job;
    });
  }

  async confirmPayment(orgId: string, jobId: string, ref: string) {
    return UnitOfWork.run(async (tx) => {
      const job = await JobRepository.confirmPayment(orgId, jobId, ref, tx);

      await Outbox.add(tx, {
        type: "job.paid",
        orgId,
        payload: job,
      });

      return job;
    });
  }

  async loadJobs(orgId: string) {
    return JobRepository.list(orgId);
  }
}

export const jobService = new JobService();
