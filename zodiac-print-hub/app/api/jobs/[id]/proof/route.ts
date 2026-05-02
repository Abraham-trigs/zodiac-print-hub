import { apiHandler, ApiError } from "@/lib/apiHandler";
import { prisma } from "@/lib/prisma";
import { Outbox } from "@/lib/db/outbox";
import { ProofStatus } from "@prisma/client";
import { z } from "zod";
import { WhatsAppService } from "@/lib/services/whatsapp.service"; // 🚀 Added

const ProofUpdateSchema = z.object({
  proofUrl: z.string().url(),
});

export const PATCH = apiHandler<{ id: string }>(
  async ({ params, body, orgId, user }) => {
    const { id } = await params;
    const { proofUrl } = ProofUpdateSchema.parse(body);

    const job = await prisma.job.findUnique({
      where: { id, orgId },
    });

    if (!job) throw new ApiError("Job node not found", 404);

    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        proofUrl,
        proofStatus: ProofStatus.AWAITING,
        approvedAt: null,
      },
      include: {
        client: { select: { name: true, phone: true } },
      },
    });

    // 🚀 WHATSAPP DISPATCH: Send the proof link to the client automatically
    await WhatsAppService.sendApprovalRequest(id);

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
