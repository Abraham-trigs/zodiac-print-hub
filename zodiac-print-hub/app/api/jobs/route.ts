// src/app/api/jobs/route.ts
import { apiHandler } from "@lib/server/api/apiHandler";
import { jobService } from "@lib/services/job.service";
import { CreateJobSchema } from "@lib/schema/job.schema";

/**
 * LIST JOBS
 * GET /api/jobs
 */
export const GET = apiHandler(
  async ({ orgId }) => {
    // Uses the Repository.list method through the service
    return jobService.loadJobs(orgId);
  },
  {
    requireAuth: true,
    requireOrg: true,
  },
);

/**
 * CREATE JOB
 * POST /api/jobs
 * Logic: Calculates area/unit pricing, snapshots financials, and deducts stock.
 */
export const POST = apiHandler(
  async ({ orgId, body, user }) => {
    return jobService.createJob({
      ...body,
      orgId,
      userId: user.id, // Passed for AuditLog and StockMovement attribution
    });
  },
  {
    requireAuth: true,
    requireOrg: true,
    schema: CreateJobSchema, // Validates dimensions, qty, and priceListId
  },
);
