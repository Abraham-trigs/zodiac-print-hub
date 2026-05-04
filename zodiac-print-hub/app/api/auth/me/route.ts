import { apiHandler, ApiError } from "@lib/server/api/apiHandler";
import { prisma } from "@lib/prisma-client";

/**
 * AUTH_ME_CONTEXT
 * Validates the current session and returns fresh user data.
 */
export const GET = apiHandler(
  async ({ user, orgId }) => {
    // 1. The user object is already extracted and verified by apiHandler
    // We fetch a fresh copy from the DB to check for status changes.
    const currentUser = await prisma.user.findUnique({
      where: {
        id: user.userId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        organisation: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
          },
        },
      },
    });

    // 2. Security Check: Ensure user and organization are still active
    if (!currentUser) {
      throw new ApiError("Session invalid: User no longer exists", 401);
    }

    if (!currentUser.isActive) {
      throw new ApiError("Your account has been deactivated", 403);
    }

    if (!currentUser.organisation.isActive) {
      throw new ApiError("Industrial Node deactivated", 403);
    }

    // 3. Return fresh context
    return {
      user: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
      },
      organisation: currentUser.organisation,
    };
  },
  {
    requireAuth: true, // 🚀 Mandatory: Must have a valid JWT
    requireOrg: true, // 🚀 Mandatory: Must match the x-org-id header
  },
);
