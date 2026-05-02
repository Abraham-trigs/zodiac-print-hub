import { apiHandler, ApiError } from "@/lib/apiHandler";
import { prisma } from "@/lib/prisma";
import { UnitOfWork } from "@/lib/db/unitOfWork";
import { POStatus } from "@prisma/client";

export const POST = apiHandler(
  async ({ orgId, body, user }) => {
    const { jobId } = body;

    return await UnitOfWork.run(async (tx) => {
      // 1. Re-verify the shortfall to ensure data integrity
      const job = await tx.job.findUnique({
        where: { id: jobId, orgId },
        include: {
          priceList: {
            include: {
              material: { include: { stockItem: true, supplier: true } },
            },
          },
        },
      });

      if (!job || !job.priceList.material)
        throw new ApiError("Context lost", 404);

      const material = job.priceList.material;
      const shortfall =
        job.quantity - (material.stockItem?.totalRemaining || 0);

      if (shortfall <= 0)
        throw new ApiError("Stock levels already sufficient.", 400);

      const unitsToOrder = Math.max(
        Math.ceil(shortfall / (material.buyQuantity || 1)),
        material.minOrderQty || 1,
      );

      // 2. Create the StockPurchaseOrder
      const po = await tx.stockPurchaseOrder.create({
        data: {
          orgId,
          supplierId: material.supplierId!,
          relatedJobId: jobId,
          status: POStatus.DRAFT,
          totalCost: unitsToOrder * material.purchasePrice,
          items: {
            create: {
              materialId: material.id,
              quantity: unitsToOrder,
              buyUnit: material.buyUnit || "unit",
              unitPrice: material.purchasePrice,
            },
          },
        },
        include: { supplier: true, items: true },
      });

      // 3. Optional: Add an audit note to the Job
      await tx.job.update({
        where: { id: jobId },
        data: {
          notes: {
            append: `\n[SYSTEM]: Requisition ${po.id.slice(-4)} created for stock gap.`,
          },
        },
      });

      return po;
    });
  },
  { requireAuth: true, requireOrg: true },
);
