import { apiHandler, ApiError } from "@lib/server/api/apiHandler";
import { prisma } from "@lib/prisma-client";
import { JobService } from "@server/services/job.service";
import { z } from "zod";
import type { JobStatus } from "@prisma/client";

/**
 * GET: Fetch Specific Job Node
 * Returns full job specs, financial history, and proofing status.
 */
export const GET = apiHandler<{ id: string }>(
  async ({ params, orgId }) => {
    const { id } = await params;

    const job = await prisma.job.findUnique({
      where: { id, orgId },
      include: {
        client: true,
        payments: true,
        variables: true,
        priceList: { include: { material: true } },
        delivery: true, // 🚀 Logistics Handshake
      },
    });

    if (!job)
      throw new ApiError("Job node not found in this organization.", 404);

    return job;
  },
  { requireAuth: true, requireOrg: true },
);

/**
 * PATCH: Update Job Node / Workflow Transition
 * Triggers automated system responses based on status changes.
 */
export const PATCH = apiHandler<{ id: string }>(
  async ({ params, body, orgId, user }) => {
    const { id } = await params;

    // 🧠 Logic: If the body only contains 'status', we handle it as a Workflow Transition
    if (body.status && Object.keys(body).length === 1) {
      const status = body.status as JobStatus;

      // Use JobService to ensure WhatsApp alerts and Performance logs fire
      if (status === "READY_FOR_PICKUP") {
        return await JobService.completeProduction(id);
      }

      // Standard Status Transition
      return await prisma.job.update({
        where: { id, orgId },
        data: { status },
        include: { client: true },
      });
    }

    // 🚀 Standard Metadata Update
    return await prisma.job.update({
      where: { id, orgId },
      data: {
        notes: body.notes,
        assignedStaffId: body.assignedStaffId,
        // Add other patchable fields as needed
      },
    });
  },
  { requireAuth: true, requireOrg: true },
);

/**
 * DELETE: De-authorize Job Node
 * Industrial Safety: We use a soft-cancel pattern to preserve the audit trail.
 */
export const DELETE = apiHandler<{ id: string }>(
  async ({ params, orgId }) => {
    const { id } = await params;

    return await JobService.cancel(id, "Manually de-authorized via Terminal");
  },
  { requireAuth: true, requireOrg: true },
);
