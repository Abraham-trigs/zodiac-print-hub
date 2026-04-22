import { JobRepository } from "@lib/repositories/job.repository";
import { StockRepository } from "@lib/repositories/stock.repository";
import { PriceItem } from "@types/zodiac.types";
import { UnitOfWork } from "@lib/db/unitOfWork";
import { Outbox } from "@lib/db/outbox";

export class JobService {
  static async createJob(params: {
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
      const now = new Date().toISOString();

      const isLargeFormat = service.unit === "sqft" || service.unit === "sqm";

      const units = isLargeFormat ? (width || 1) * (height || 1) : 1;

      const totalPrice = units * quantity * service.priceGHS;

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

      await tx.client.update({
        where: { id: clientId },
        data: {
          lastJobId: job.id,
          lastJobDate: now,
          isNew: false,
          totalJobs: {
            increment: 1,
          },

          lastStaffId: assignedStaffId ?? undefined,
          mostPrintedServiceId: service.id,
        },
      });

      // ✅ FIXED NAME
      const stockRefId = service.stockRefId;

      if (stockRefId) {
        await StockRepository.deduct(orgId, stockRefId, units * quantity, tx);
      }

      await Outbox.add(tx, {
        type: "job.created",
        orgId,
        payload: job,
      });

      return job;
    });
  }

  static async updateStatus(orgId: string, jobId: string, status: any) {
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

  static async assignStaff(orgId: string, jobId: string, staffId: string) {
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

  static async confirmPayment(orgId: string, jobId: string, ref: string) {
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

  static async loadJobs(orgId: string) {
    return JobRepository.list(orgId);
  }
}
