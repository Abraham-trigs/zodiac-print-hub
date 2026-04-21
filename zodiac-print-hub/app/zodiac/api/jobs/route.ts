import { apiHandler } from "@lib/server/api/apiHandler";
import { jobService } from "@lib/services/job.service";

// GET
export const GET = apiHandler(async ({ orgId }) => {
  return jobService.loadJobs(orgId);
});

// POST
export const POST = apiHandler(
  async ({ orgId, body }) => {
    return jobService.createJob({
      ...body,
      orgId,
    });
  },
  {
    requireOrg: true,
  },
);
