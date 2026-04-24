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
    b2bPushId?: string;
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
      b2bPushId,
    } = params;

    return UnitOfWork.run(async (tx) => {
      const now = new Date();

      // 1. PRICE RESOLUTION (Security & Negotiation Layer)
      let priceToUse = service.priceGHS;

      if (b2bPushId) {
        const b2bPush = await tx.b2BPush.findUnique({
          where: { id: b2bPushId, orgId },
        });

        if (!b2bPush) throw new Error("B2B Negotiation record not found");

        if (b2bPush.suggestedPrice) {
          priceToUse = b2bPush.suggestedPrice;
        }
      }

      // Domain math: only large-format jobs use area-based units
      const isLargeFormat = [
        "sqft",
        "sqm",
        "Per Sq Meter",
        "Per Yard",
      ].includes(service.unit);

      const area = isLargeFormat ? (width ?? 1) * (height ?? 1) : 1;
      const units = isLargeFormat ? area * quantity : quantity;

      const totalPrice = units * priceToUse;

      // 🔥 PROFIT LOOP: Calculate total cost for the job record
      const unitCost = service.costPrice ?? 0;
      const totalCost = units * unitCost;

      // 2. CREATE JOB
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
          // 🔥 PROFIT LOOP: Store cost and margin at the time of creation
          costPrice: totalCost,
          profitMargin: totalPrice - totalCost,
          assignedStaffId,
          notes,
          b2bPushId,
        },
        tx,
      );

      // 3. UPDATE CLIENT
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

      // 4. STOCK MOVEMENT (NOW FULLY ALIGNED)
      if (service.stockRefId) {
        await stockService.createMovement(
          {
            orgId,
            stockItemId: service.stockRefId,
            type: "DEDUCT",
            quantity: units,
            referenceId: job.id,
            referenceType: "JOB",
            note: `Auto deduction for job ${job.id}${b2bPushId ? " (B2B)" : ""}`,
            createdBy: assignedStaffId ?? "system",
            // 🔥 PROFIT LOOP: Link the material cost to the ledger entry
            unitCost: unitCost,
          },
          tx,
        );
      }

      // 5. OUTBOX EVENT
      await Outbox.add(tx, {
        type: "job.created",
        orgId,
        payload: job,
      });

      return job;
    });
  }

  // ... (updateStatus, assignStaff, confirmPayment remain the same)

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
