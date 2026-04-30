// src/app/api/auth/verify/route.ts
import { apiHandler, ApiError } from "@/lib/apiHandler";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth"; // Your JWT utility

export const GET = apiHandler(async ({ query }) => {
  const { token, slug } = query;

  if (!token || !slug) throw new ApiError("Missing token or slug", 400);

  return await prisma.$transaction(async (tx) => {
    // 1. Find and validate token
    const vt = await tx.verificationToken.findUnique({
      where: { token },
    });

    if (!vt || vt.expires < new Date()) {
      throw new ApiError("Invalid or expired token", 401);
    }

    // 2. Fetch User & Org Context
    const user = await tx.user.findUniqueOrThrow({
      where: { orgId_email: { orgId: vt.orgId, email: vt.identifier } },
    });

    // 3. Cleanup: Delete token after successful use (One-time use)
    await tx.verificationToken.delete({ where: { id: vt.id } });

    // 4. Update last login
    await tx.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 5. Issue JWT
    const sessionToken = await signToken({
      userId: user.id,
      orgId: user.orgId,
      role: user.role,
    });

    return {
      token: sessionToken,
      orgId: user.orgId,
      user: { name: user.name, role: user.role },
    };
  });
});
