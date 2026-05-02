import { apiHandler, ApiError } from "@/lib/apiHandler";
import { prisma } from "@/lib/prisma";
import { Outbox } from "@/lib/db/outbox";
import { ProofStatus } from "@prisma/client";

export const POST = apiHandler<{ token: string }>(
  async ({ params, body }) => {
    const { token } = await params;
    const { note } = body;

    if (!note) throw new ApiError("Revision notes are required", 400);

    const job = await prisma.job.findUnique({
      where: { approvalToken: token },
    });

    if (!job) throw new ApiError("Context lost", 404);

    // 1. Move status back to REVISION
    const updated = await prisma.job.update({
      where: { id: job.id },
      data: {
        proofStatus: ProofStatus.REVISION,
        customerNote: note,
      },
    });

    // 2. 🚀 BROADCAST: Alert the Designer
    await Outbox.add(prisma, {
      type: "job.revision_requested",
      orgId: job.orgId,
      payload: {
        jobId: job.id,
        shortRef: job.shortRef,
        note: note,
      },
    });

    return { success: true };
  },
  { requireAuth: false },
);
