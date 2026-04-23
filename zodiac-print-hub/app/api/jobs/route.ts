import { apiHandler } from "@lib/server/api/apiHandler";
import { jobService } from "@lib/services/job.service";
import { CreateJobSchema } from "@lib/schema/job.schema";

// GET
export const GET = apiHandler(
  async ({ orgId }) => {
    return jobService.loadJobs(orgId);
  },
  {
    requireAuth: true,
    requireOrg: true,
  },
);

// POST
export const POST = apiHandler(
  async ({ orgId, body }) => {
    return jobService.createJob({
      ...(body as any),
      orgId,
    });
  },
  {
    requireAuth: true,
    requireOrg: true,
    schema: CreateJobSchema,
  },
);
