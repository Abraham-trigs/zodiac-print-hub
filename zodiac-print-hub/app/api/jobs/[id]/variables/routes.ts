// src/app/api/jobs/[id]/variables/route.ts
import { apiHandler, ApiError } from "@lib/server/api/apiHandler";
import { jobService } from "@lib/server/services/job.service";
import { CreateJobVariableSchema } from "@lib/shared/schema/job.schema";

/**
 * ADD VARIABLE TO JOB
 * POST /api/jobs/[id]/variables
 */
export const POST = apiHandler<{ id: string }>(
  async ({ orgId, params, body, user }) => {
    const { id: jobId } = await params;

    if (!jobId) throw new ApiError("Missing job ID", 400);

    return jobService.addVariable({
      ...body,
      jobId,
      orgId,
      userId: user.id,
    });
  },
  {
    requireAuth: true,
    requireOrg: true,
    schema: CreateJobVariableSchema,
  },
);
