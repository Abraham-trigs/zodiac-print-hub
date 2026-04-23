import { apiHandler } from "@lib/server/api/apiHandler";
import { jobService } from "@lib/services/job.service";
import { UpdateJobStatusSchema } from "@lib/schema/job.schema";

export const PATCH = apiHandler<{ id: string }, { status: string }>(
  async ({ orgId, params, body }) => {
    const { id } = await params; // 🔥 REQUIRED FIX (Next.js 15+)

    if (!id) {
      throw new Error("Missing job id in route params");
    }

    if (!body?.status) {
      throw new Error("Missing status in request body");
    }

    return jobService.updateStatus(orgId, id, body.status);
  },
  {
    requireAuth: true,
    requireOrg: true,
    schema: UpdateJobStatusSchema,
  },
);
