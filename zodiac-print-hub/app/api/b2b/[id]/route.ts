// src/app/api/b2b/[id]/route.ts
import { apiHandler, ApiError } from "@/lib/apiHandler";
import { prisma } from "@/lib/prisma";
import { B2BRepository } from "@/lib/repositories/b2b.repository";

/**
 * PATCH B2B STATUS
 * Handles ACCEPTED / REJECTED / COMPLETED transitions.
 */
export const PATCH = apiHandler<{ id: string }>(
  async ({ params, body, orgId }) => {
    const { id } = await params; // Next.js 15 Requirement
    const { status } = body;

    if (!status) throw new ApiError("Status is required", 400);

    // 1. Verify ownership before update
    const existing = await prisma.b2BPush.findFirst({
      where: { id, orgId },
    });

    if (!existing) throw new ApiError("B2B Record not found", 404);

    // 2. Update via Repository (which we previously aligned with tx support)
    return await B2BRepository.updateStatus(id, status);
  },
  { requireAuth: true, requireOrg: true },
);

/**
 * DELETE B2B PUSH
 * Clean up rejected or cancelled negotiations.
 */
export const DELETE = apiHandler<{ id: string }>(
  async ({ params, orgId }) => {
    const { id } = await params;

    await prisma.b2BPush.delete({
      where: { id, orgId },
    });

    return { message: "B2B Negotiation removed" };
  },
  { requireAuth: true, requireOrg: true },
);
