// src/app/api/b2b/route.ts
import { apiHandler } from "@/lib/apiHandler";
import { prisma } from "@/lib/prisma";

/**
 * GET B2B PUSHES
 * Fetches all B2B jobs where the shop is either the SOURCE or the TARGET.
 */
export const GET = apiHandler(
  async ({ orgId }) => {
    const pushes = await prisma.b2BPush.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
      include: {
        originalJob: {
          select: {
            id: true,
            serviceName: true,
            totalPrice: true,
          },
        },
      },
    });

    return pushes;
  },
  { requireAuth: true, requireOrg: true },
);

/**
 * POST B2B PUSH (Creation)
 * Logic is handled by the B2BService we confirmed earlier.
 */
export const POST = apiHandler(
  async ({ orgId, body }) => {
    const { B2BService } = await import("@/lib/services/b2b.service");

    return await B2BService.pushJob({
      orgId,
      jobId: body.jobId,
      specs: body.specs,
      deadline: new Date(body.deadline),
      suggestedPrice: Number(body.suggestedPrice),
    });
  },
  { requireAuth: true, requireOrg: true },
);
