import { apiHandler, ApiError } from "@/lib/apiHandler";
import { prisma } from "@/lib/prisma";
import { UnitOfWork } from "@/lib/db/unitOfWork";
import { StaffPerformanceService } from "@/lib/services/staffPerformance.service";
import { WhatsAppService } from "@/lib/services/whatsapp.service"; // 🚀 Added
import { JobStatus } from "@prisma/client";

export const POST = apiHandler<{ id: string }>(
  async ({ params, orgId, user }) => {
    const { id } = await params;

    return await UnitOfWork.run(async (tx) => {
      const layout = await tx.materialPrintLayout.findUnique({
        where: { id, orgId },
        include: { items: true, material: true },
      });

      if (!layout || layout.status === "SHOT") {
        throw new ApiError("Layout node not found or already processed", 404);
      }

      await StaffPerformanceService.recordPrintYield({
        staffId: user.id,
        orgId: orgId,
        efficiency: layout.efficiency,
        layoutId: layout.id,
      });

      // Update Job Statuses
      const jobIds = layout.items.map((i) => i.jobId);
      await tx.job.updateMany({
        where: { id: { in: jobIds } },
        data: { status: JobStatus.READY_FOR_PICKUP },
      });

      // 🚀 WHATSAPP DISPATCH: Notify all customers in this layout
      for (const jobId of jobIds) {
        await WhatsAppService.sendPickupAlert(jobId);
      }

      return await tx.materialPrintLayout.update({
        where: { id: layout.id },
        data: { status: "SHOT" },
      });
    });
  },
  { requireAuth: true, requireOrg: true },
);
