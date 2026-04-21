import { apiHandler } from "@lib/server/api/apiHandler";
import { StaffService } from "@lib/services/staff.service";

export const GET = apiHandler(
  async ({ orgId }) => {
    const data = await StaffService.list(orgId);
    return data;
  },
  {
    requireOrg: true,
  },
);
