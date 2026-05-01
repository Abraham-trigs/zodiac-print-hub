// src/lib/services/job.service.ts
import { prisma } from "@/lib/prisma";
import { UnitOfWork } from "@/lib/db/unitOfWork";
import { Outbox } from "@/lib/db/outbox";
import { JobRepository } from "@/lib/repositories/job.repository";
import { stockService } from "@/lib/services/stock.service";
import { ProductionCalculator } from "@/lib/utils/production-calculator";
import { ApiError } from "@/lib/apiHandler";
import { StockMovementType } from "@prisma/client";

export class JobService {
  /**
   * CREATE JOB
   * Orchestrates pricing, stock deduction, and CRM updates.
   */
  async createJob(params: {
    orgId: string;
    clientId: string;
    priceListId: string;
    quantity: number;
    width?: number;
    height?: number;
    assignedStaffId?: string;
    userId: string;
    notes?: string;
    b2bPushId?: string;
  }) {
    const {
      orgId,
      clientId,
      priceListId,
      quantity,
      width,
      height,
      assignedStaffId,
      userId,
      notes,
      b2bPushId,
    } = params;

    return UnitOfWork.run(async (tx) => {
      const now = new Date();

      const priceItem = await tx.priceList.findFirst({
        where: { id: priceListId, orgId },
        include: { material: { include: { stockItem: true } }, service: true },
      });

      if (!priceItem) throw new ApiError("Price list item not found", 404);

      let salePrice = priceItem.salePrice;
      if (b2bPushId) {
        const b2bPush = await tx.b2BPush.findUnique({
          where: { id: b2bPushId, orgId },
        });
        if (b2bPush?.suggestedPrice) salePrice = b2bPush.suggestedPrice;
      }

      const calc = ProductionCalculator.calculate({
        quantity,
        width,
        height,
        unit: (priceItem.material?.unit as any) ?? "piece",
        salePrice,
        purchasePrice: priceItem.material?.purchasePrice ?? 0,
        mCalcType: priceItem.material?.calcType,
        sCalcType: priceItem.service?.calcType,
      });

      if (calc.error) throw new ApiError(calc.error, 400);

      const job = await JobRepository.create(
        {
          orgId,
          clientId,
          priceListId: priceItem.id,
          serviceName: priceItem.displayName,
          quantity,
          width,
          height,
          unit: priceItem.material?.unit,
          basePrice: salePrice,
          totalPrice: calc.totalPrice,
          costPrice: calc.totalCost,
          profitMargin: calc.totalPrice - calc.totalCost,
          assignedStaffId,
          notes,
          b2bPushId,
        },
        tx,
      );

      await tx.client.update({
        where: { id: clientId },
        data: {
          lastJobId: job.id,
          lastJobDate: now,
          isNew: false,
          totalJobs: { increment: 1 },
          recentStaffId: assignedStaffId ?? undefined,
          mostPrintedServiceId: priceItem.id,
        },
      });

      if (priceItem.material?.stockItemId) {
        await stockService.createMovement(
          {
            orgId,
            stockItemId: priceItem.material.stockItemId,
            type: StockMovementType.DEDUCT,
            quantity: calc.deduction!,
            referenceId: job.id,
            referenceType: "JOB",
            createdBy: userId,
            note: `Production: ${calc.usageLabel} for ${job.serviceName}`,
          },
          tx,
        );
      }

      if (b2bPushId)
        await tx.b2BPush.update({
          where: { id: b2bPushId },
          data: { status: "ACCEPTED" },
        });
      await Outbox.add(tx, { type: "job.created", orgId, payload: job });
      return job;
    });
  }

  /**
   * RECORD WASTAGE (The Intelligence Leak Plug)
   * Deducts stock and kills profit margin for a specific job.
   */
  async recordWastage(params: {
    orgId: string;
    jobId: string;
    quantity: number; // The amount of material ruined
    reason: string;
    userId: string;
  }) {
    const { orgId, jobId, quantity, reason, userId } = params;

    return UnitOfWork.run(async (tx) => {
      // 1. Resolve Job and its associated Material
      const job = await tx.job.findUnique({
        where: { id: jobId, orgId },
        include: { priceList: { include: { material: true } } },
      });

      if (!job || !job.priceList.material) {
        throw new ApiError("Job material not found for wastage report", 404);
      }

      const material = job.priceList.material;
      const lossValue = quantity * material.purchasePrice;

      // 2. TRIGGER STOCK LEDGER (The Nervous System)
      await stockService.createMovement(
        {
          orgId,
          stockItemId: material.stockItemId!,
          type: StockMovementType.WASTE,
          quantity,
          referenceId: job.id,
          referenceType: "JOB_WASTE",
          createdBy: userId,
          note: `RUINED: ${reason} (${quantity}${material.unit})`,
        },
        tx,
      );

      // 3. UPDATE JOB FINANCIALS (Intelligence Impact)
      // We increase the cost and decrease the margin of the job.
      const updatedJob = await tx.job.update({
        where: { id: jobId },
        data: {
          costPrice: { increment: lossValue },
          profitMargin: { decrement: lossValue },
        },
      });

      await Outbox.add(tx, {
        type: "job.wastage_recorded",
        orgId,
        payload: { jobId, lossValue, quantity, reason },
      });

      return updatedJob;
    });
  }

  /**
   * ADD VARIABLE
   */
  async addVariable(params: {
    orgId: string;
    jobId: string;
    priceListId: string;
    quantity: number;
    width?: number;
    height?: number;
    userId: string;
  }) {
    const { orgId, jobId, priceListId, quantity, width, height, userId } =
      params;

    return UnitOfWork.run(async (tx) => {
      const priceItem = await tx.priceList.findFirst({
        where: { id: priceListId, orgId },
        include: { material: { include: { stockItem: true } }, service: true },
      });

      if (!priceItem) throw new ApiError("Variable service not found", 404);

      const calc = ProductionCalculator.calculate({
        quantity,
        width,
        height,
        unit: (priceItem.material?.unit as any) ?? "piece",
        salePrice: priceItem.salePrice,
        purchasePrice: priceItem.material?.purchasePrice ?? 0,
        mCalcType: priceItem.material?.calcType,
        sCalcType: priceItem.service?.calcType,
      });

      if (calc.error) throw new ApiError(calc.error, 400);

      const variable = await tx.jobVariable.create({
        data: {
          orgId,
          jobId,
          priceListId: priceItem.id,
          materialId: priceItem.materialId,
          serviceId: priceItem.serviceId,
          quantity,
          width,
          height,
          unitPrice: priceItem.salePrice,
          subtotal: calc.totalPrice,
        },
      });

      await tx.job.update({
        where: { id: jobId },
        data: {
          variableTotal: { increment: calc.totalPrice },
          totalPrice: { increment: calc.totalPrice },
          costPrice: { increment: calc.totalCost },
          profitMargin: { increment: calc.totalPrice - calc.totalCost },
        },
      });

      if (priceItem.material?.stockItemId) {
        await stockService.createMovement(
          {
            orgId,
            stockItemId: priceItem.material.stockItemId,
            type: StockMovementType.DEDUCT,
            quantity: calc.deduction!,
            referenceId: variable.id,
            referenceType: "JOB_VARIABLE",
            createdBy: userId,
            note: `Add-on: ${priceItem.displayName} for Job #${jobId}`,
          },
          tx,
        );
      }

      await Outbox.add(tx, {
        type: "job.variable_added",
        orgId,
        payload: { jobId, variableId: variable.id },
      });
      return { variable };
    });
  }

  async updateStatus(orgId: string, jobId: string, status: any) {
    return UnitOfWork.run(async (tx) => {
      const job = await JobRepository.updateStatus(orgId, jobId, status, tx);
      await Outbox.add(tx, { type: "job.status_changed", orgId, payload: job });
      return job;
    });
  }

  async loadJobs(orgId: string) {
    return JobRepository.list(orgId);
  }
}

export const jobService = new JobService();
