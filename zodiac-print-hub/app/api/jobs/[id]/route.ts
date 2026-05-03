// src/app/api/jobs/[id]/route.ts
import { apiHandler, ApiError } from "@lib/server/api/apiHandler";
import { jobService } from "@lib/server/services/job.service";
import { UpdateJobStatusSchema } from "@lib/shared/schema/job.schema";

/**
 * UPDATE JOB STATUS
 * PATCH /api/jobs/[id]
 */
export const PATCH = apiHandler<{ id: string }, { status: string }>(
  async ({ orgId, params, body }) => {
    // 🔥 NEXT.JS 15 COMPLIANCE: Dynamic route parameters must be awaited
    const resolvedParams = await params;
    const jobId = resolvedParams?.id;

    if (!jobId) {
      throw new ApiError("Missing job ID in route", 400);
    }

    if (!body?.status) {
      throw new ApiError("Status update requires a status value", 400);
    }

    return jobService.updateStatus(orgId, jobId, body.status);
  },
  {
    requireAuth: true,
    requireOrg: true,
    schema: UpdateJobStatusSchema,
  },
);
