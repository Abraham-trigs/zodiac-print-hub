// 🚀 UPDATED: Points to your actual root-level lib paths
import { apiHandler, ApiError } from "@/lib/apiHandler";
import { prisma } from "@/lib/prisma"; // 💡 Using the central singleton
import { signToken } from "@/lib/auth";

export const GET = apiHandler(async ({ query }) => {
  const { token, slug } = query;

  if (!token || !slug) throw new ApiError("Missing token or slug", 400);

  return await prisma.$transaction(async (tx) => {
    // 1. Find and validate token
    // We cast to String to handle searchParams correctly
    const vt = await tx.verificationToken.findUnique({
      where: { token: String(token) },
    });

    if (!vt || vt.expires < new Date()) {
      throw new ApiError("Invalid or expired token", 401);
    }

    // 2. Fetch User & Org Context
    // Uses the compound unique index [orgId, email] verified in our model check
    const user = await tx.user.findUniqueOrThrow({
      where: { orgId_email: { orgId: vt.orgId, email: vt.identifier } },
    });

    // 3. Cleanup: Security requirement - tokens must be one-time use
    await tx.verificationToken.delete({
      where: { token: vt.token },
    });

    // 4. Update Audit Trail
    await tx.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 5. Issue Industrial JWT (via 'jose' as configured)
    const sessionToken = await signToken({
      userId: user.id,
      orgId: user.orgId,
      role: user.role,
    });

    return {
      token: sessionToken,
      orgId: user.orgId,
      user: {
        name: user.name,
        role: user.role,
        email: user.email,
      },
    };
  });
});
