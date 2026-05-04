import { apiHandler } from "@lib/server/api/apiHandler";
import { StaffService } from "@lib/server/services/staff.service";

// 1. READ ALL (List)
export const GET = apiHandler(
  async ({ orgId }) => {
    return await StaffService.list(orgId);
  },
  { requireAuth: true, requireOrg: true },
);

// 2. CREATE (Hire)
export const POST = apiHandler(
  async ({ orgId, body }) => {
    // Logic: Creates the User identity and the Staff profile together
    return await StaffService.createStaff({ orgId, ...body });
  },
  { requireAuth: true, requireOrg: true },
);
