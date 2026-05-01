// src/app/api/jobs/[id]/wastage/route.ts
import { apiHandler, ApiError } from "@/lib/apiHandler";
import { jobService } from "@/lib/services/job.service";
import { z } from "zod";

/**
 * SCHEMA VALIDATION
 * quantity: How much was ruined
 * reason: Why was it ruined (e.g., "Machine Jam", "Ink Bleed")
 */
const WastageSchema = z.object({
  quantity: z.number().positive(),
  reason: z.string().min(3).max(255),
});

/**
 * POST: RECORD JOB WASTAGE
 * Path: /api/jobs/[id]/wastage
 */
export const POST = apiHandler<{ id: string }>(
  async ({ params, body, orgId, user }) => {
    // 1. Next.js 15: Await dynamic route parameters
    const { id: jobId } = await params;

    // 2. Validate incoming data
    const { quantity, reason } = body;

    // 3. Trigger the Intelligence Engine (Wastage Logic)
    // This Deducts Stock + Updates Job Cost + Updates Job Profit Margin
    const updatedJob = await jobService.recordWastage({
      orgId,
      jobId,
      quantity,
      reason,
      userId: user.id, // Auditor ID
    });

    return {
      message: "Wastage recorded successfully",
      data: updatedJob,
    };
  },
  {
    requireAuth: true,
    requireOrg: true,
    schema: WastageSchema, // Enforces valid data entry
  },
);
