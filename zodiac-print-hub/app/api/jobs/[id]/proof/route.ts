import { apiHandler, ApiError } from "@/lib/apiHandler";
import { prisma } from "@/lib/prisma";
import { Outbox } from "@/lib/db/outbox";
import { ProofStatus } from "@prisma/client";
import { z } from "zod";
import { StaffPerformanceService } from "@/lib/services/staffPerformance.service"; // 🚀 Added

const ProofUpdateSchema = z.object({
  proofUrl: z.string().url(),
});

/**
 * JOB PROOF HANDSHAKE
 * Triggered by the Shop Designer to submit artwork for client review.
 */
export const PATCH = apiHandler<{ id: string }>(
  async ({ params, body, orgId, user }) => {
    const { id } = await params;
    const { proofUrl } = ProofUpdateSchema.parse(body);

    // 1. Resolve Job and verify existence within Org
    const job = await prisma.job.findUnique({
      where: { id, orgId },
    });

    if (!job) throw new ApiError("Job node not found", 404);

    // 2. Atomic Update: Set URL and move status to AWAITING
    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        proofUrl,
        proofStatus: ProofStatus.AWAITING,
        // Reset approval timestamp if a new proof is being uploaded after a revision
        approvedAt: null,
      },
      include: {
        client: { select: { name: true, phone: true } },
      },
    });

    // 3. 🚀 PERFORMANCE LOG: Record how fast the designer worked
    // This captures the 'Design Velocity' metric for the Performance Node
    await StaffPerformanceService.recordDesignVelocity({
      jobId: id,
      staffId: user.id, // The logged-in designer
      orgId: orgId,
    });

    // 4. 🚀 BROADCAST: Log activity and prepare notification system
    await Outbox.add(prisma, {
      type: "job.proof_submitted",
      orgId,
      payload: {
        jobId: job.id,
        shortRef: job.shortRef,
        proofUrl,
        clientName: updatedJob.client.name,
        submittedBy: user.id,
      },
    });

    return updatedJob;
  },
  { requireAuth: true, requireOrg: true },
);
