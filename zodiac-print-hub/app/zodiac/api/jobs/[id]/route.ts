import { apiHandler } from "@lib/server/api/apiHandler";
import { jobService } from "@lib/services/job.service";

export const PATCH = apiHandler(
  async ({ orgId, params, body }) => {
    return jobService.updateStatus(orgId, params.id, body.status);
  },
  {
    requireOrg: true,
  },
);
