import { apiHandler, ApiError } from "@root/server/api/apiHandler";
import { StaffService } from "@lib/services/staff.service";

// 3. UPDATE (Edit / Assign)
export const PATCH = apiHandler<{ id: string }>(
  async ({ params, body, orgId }) => {
    const { id } = await params;
    const { status, jobId, specialisation } = body;

    if (jobId)
      return await StaffService.assignToJob({ orgId, staffId: id, jobId });

    // Standard profile updates (e.g., changing specialisation or status)
    return await StaffService.updateStaffProfile(orgId, id, body);
  },
  { requireAuth: true, requireOrg: true },
);

// 4. DELETE (Deactivate)
export const DELETE = apiHandler<{ id: string }>(
  async ({ params, orgId }) => {
    const { id } = await params;
    // We use the service to handle a "Soft Delete" (isActive = false)
    return await StaffService.deactivate(orgId, id);
  },
  { requireAuth: true, requireOrg: true },
);
