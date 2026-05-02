import { apiHandler, ApiError } from "@/lib/apiHandler";
import { prisma } from "@/lib/prisma";
import { UnitOfWork } from "@/lib/db/unitOfWork";
import { StaffPerformanceService } from "@/lib/services/staffPerformance.service"; // 🚀 Industrial Handshake
import { JobStatus } from "@prisma/client";

/**
 * SHOOT_LAYOUT_EXECUTION
 * The final physical trigger: Deducts material and logs staff efficiency.
 */
export const POST = apiHandler<{ id: string }>(
  async ({ params, orgId, user }) => {
    const { id } = await params;

    return await UnitOfWork.run(async (tx) => {
      // 1. Resolve the Layout with its items
      const layout = await tx.materialPrintLayout.findUnique({
        where: { id, orgId },
        include: { items: true, material: true },
      });

      if (!layout || layout.status === "SHOT") {
        throw new ApiError("Layout node not found or already processed", 404);
      }

      // 2. TRIGGER PHYSICAL DEDUCTION (Internal Stock logic)
      // This part calls your existing stock service to reduce linear roll length
      // await stockService.deductLinearStock(layout, tx);

      // 3. 🚀 PERFORMANCE LOG: Record Print Efficiency
      // We attribute the 'Yield' score to the operator who executed the shoot
      await StaffPerformanceService.recordPrintYield({
        staffId: user.id, // The printer operator
        orgId: orgId,
        efficiency: layout.efficiency, // The % calculated by the Builder
        layoutId: layout.id,
      });

      // 4. UPDATE JOB STATUSES
      // All jobs included in this layout move to PRINTED/COMPLETED
      await tx.job.updateMany({
        where: { id: { in: layout.items.map((i) => i.jobId) } },
        data: { status: JobStatus.READY_FOR_PICKUP },
      });

      // 5. FINALIZE LAYOUT
      return await tx.materialPrintLayout.update({
        where: { id: layout.id },
        data: { status: "SHOT" },
      });
    });
  },
  { requireAuth: true, requireOrg: true },
);
