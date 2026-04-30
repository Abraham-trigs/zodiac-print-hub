// src/app/api/auth/login/route.ts
import { apiHandler, ApiError } from "@/lib/apiHandler";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";

const LoginSchema = z.object({
  email: z.string().email(),
  orgSlug: z.string(), // Required for multi-tenant routing
});

export const POST = apiHandler(
  async ({ body, orgId: _ignored }) => {
    const { email, orgSlug } = body;

    // 1. Resolve the Organization by slug
    const organisation = await prisma.organisation.findUnique({
      where: { slug: orgSlug },
    });

    if (!organisation) throw new ApiError("Organisation not found", 404);

    // 2. Transactional Outbox Flow
    return await prisma.$transaction(async (tx) => {
      // A. Check if user exists in THIS organisation
      const user = await tx.user.findUnique({
        where: { orgId_email: { orgId: organisation.id, email } },
      });

      if (!user) throw new ApiError("User not found in this organisation", 404);

      // B. Generate a secure random token
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 1000 * 60 * 15); // 15-minute expiry

      // C. Save Verification Token
      await tx.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires,
          orgId: organisation.id,
        },
      });

      // D. Queue the Email in the Outbox
      await tx.outboxEvent.create({
        data: {
          orgId: organisation.id,
          type: "SEND_MAGIC_LINK",
          payload: {
            email,
            token,
            orgSlug: organisation.slug,
            magicLink: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?token=${token}&slug=${organisation.slug}`,
          },
        },
      });

      return { message: "Magic link sent to your email" };
    });
  },
  { schema: LoginSchema },
);
