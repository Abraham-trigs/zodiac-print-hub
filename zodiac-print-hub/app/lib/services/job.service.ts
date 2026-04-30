// src/lib/services/job.service.ts
import { prisma } from "@/lib/prisma";
import { UnitOfWork } from "@/lib/db/unitOfWork";
import { Outbox } from "@/lib/db/outbox";
import { JobRepository } from "@/lib/repositories/job.repository";
import { stockService } from "@/lib/services/stock.service";
import { ProductionCalculator } from "@/lib/utils/production-calculator";
import { ApiError } from "@/lib/apiHandler";

export class JobService {
  /**
   * CREATE JOB
   * Orchestrates pricing, stock deduction, and CRM updates in one transaction.
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

      // 1. RESOLVE THE RECIPE
      const priceItem = await tx.priceList.findFirst({
        where: { id: priceListId, orgId },
        include: { material: { include: { stockItem: true } }, service: true },
      });

      if (!priceItem) throw new ApiError("Price list item not found", 404);

      // 2. B2B PRICE OVERRIDE
      let salePrice = priceItem.salePrice;
      if (b2bPushId) {
        const b2bPush = await tx.b2BPush.findUnique({
          where: { id: b2bPushId, orgId },
        });
        if (b2bPush?.suggestedPrice) salePrice = b2bPush.suggestedPrice;
      }

      // 3. CALCULATION ENGINE
      const calc = ProductionCalculator.calculate({
        quantity,
        width,
        height,
        unit: priceItem.material?.unit ?? "piece",
        salePrice,
        purchasePrice: priceItem.material?.purchasePrice ?? 0,
        mCalcType: priceItem.material?.calcType,
        sCalcType: priceItem.service?.calcType,
      });

      if (calc.error) throw new ApiError(calc.error, 400);

      // 4. CREATE JOB
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

      // 5. CLIENT CRM UPDATE
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

      // 6. ATOMIC STOCK DEDUCTION
      if (priceItem.material?.stockItemId) {
        await stockService.createMovement(
          {
            orgId,
            stockItemId: priceItem.material.stockItemId,
            type: "DEDUCT",
            quantity: calc.deduction,
            referenceId: job.id,
            referenceType: "JOB",
            createdBy: userId,
            unitCost: priceItem.material.purchasePrice,
            note: `Auto deduction: ${calc.usageLabel} for ${job.serviceName}`,
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
   * ADD VARIABLE (Add-on)
   * Handles multi-service/material add-ons for an existing job.
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
      // 1. Fetch Add-on Recipe
      const priceItem = await tx.priceList.findFirst({
        where: { id: priceListId, orgId },
        include: { material: { include: { stockItem: true } }, service: true },
      });

      if (!priceItem) throw new ApiError("Variable service not found", 404);

      // 2. Calculate Add-on Price/Stock
      const calc = ProductionCalculator.calculate({
        quantity,
        width,
        height,
        unit: priceItem.material?.unit ?? "piece",
        salePrice: priceItem.salePrice,
        purchasePrice: priceItem.material?.purchasePrice ?? 0,
        mCalcType: priceItem.material?.calcType,
        sCalcType: priceItem.service?.calcType,
      });

      if (calc.error) throw new ApiError(calc.error, 400);

      // 3. Create Variable Record
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

      // 4. Update Main Job Totals & Profitability
      const updatedJob = await tx.job.update({
        where: { id: jobId },
        data: {
          variableTotal: { increment: calc.totalPrice },
          totalPrice: { increment: calc.totalPrice },
          costPrice: { increment: calc.totalCost },
          profitMargin: { increment: calc.totalPrice - calc.totalCost },
        },
      });

      // 5. Handle Variable Stock Deduction
      if (priceItem.material?.stockItemId) {
        await stockService.createMovement(
          {
            orgId,
            stockItemId: priceItem.material.stockItemId,
            type: "DEDUCT",
            quantity: calc.deduction,
            referenceId: variable.id,
            referenceType: "JOB_VARIABLE",
            createdBy: userId,
            unitCost: priceItem.material.purchasePrice,
            note: `Variable add-on: ${priceItem.displayName} for Job #${jobId}`,
          },
          tx,
        );
      }

      await Outbox.add(tx, {
        type: "job.variable_added",
        orgId,
        payload: { jobId, variableId: variable.id },
      });

      return { variable, updatedJob };
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
