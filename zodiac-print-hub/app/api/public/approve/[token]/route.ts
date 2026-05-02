import { apiHandler, ApiError } from "@/lib/apiHandler";
import { prisma } from "@/lib/prisma";
import { Outbox } from "@/lib/db/outbox";
import { ProofStatus, JobStatus } from "@prisma/client";

/**
 * GET: Fetch Public Job Data
 * 🔓 PUBLIC: Accessible via unique approvalToken
 */
export const GET = apiHandler<{ token: string }>(
  async ({ params }) => {
    const { token } = await params;

    const job = await prisma.job.findUnique({
      where: { approvalToken: token },
      select: {
        id: true,
        shortRef: true,
        serviceName: true,
        proofUrl: true,
        proofStatus: true,
        totalPrice: true,
        quantity: true,
        unit: true,
        width: true,
        height: true,
        client: { select: { name: true } },
      },
    });

    if (!job) throw new ApiError("Link invalid or expired", 404);
    return job;
  },
  { requireAuth: false },
);

/**
 * POST (.../confirm): Customer Approval Handshake
 */
export const POST = apiHandler<{ token: string }>(
  async ({ params }) => {
    const { token } = await params;

    return await prisma.$transaction(async (tx) => {
      const job = await tx.job.findUnique({
        where: { approvalToken: token },
        include: { organisation: true },
      });

      if (!job) throw new ApiError("Context lost", 404);

      // 1. Update Job State
      const updated = await tx.job.update({
        where: { id: job.id },
        data: {
          proofStatus: ProofStatus.APPROVED,
          approvedAt: new Date(),
          // Automatically move to READY_FOR_PRODUCTION if payment is handled later,
          // or stay in PENDING until payment is confirmed.
        },
      });

      // 2. 🚀 BROADCAST: Notify the Shop Manager
      await Outbox.add(tx, {
        type: "job.approved_by_client",
        orgId: job.orgId,
        payload: {
          jobId: job.id,
          shortRef: job.shortRef,
          clientName: job.clientId, // Client name resolved in outbox processor
        },
      });

      return {
        success: true,
        message: "Design approved. Proceeding to fulfillment.",
      };
    });
  },
  { requireAuth: false },
);
