import { apiHandler, ApiError } from "@/lib/server/api/apiHandler";
import { prisma } from "@/lib/prisma-client"; // 🚀 Fixed: Consistent with your lib structure
import { z } from "zod";
import crypto from "crypto";

const LoginSchema = z.object({
  email: z.string().email(),
  orgSlug: z.string(),
});

export const POST = apiHandler(
  async ({ body }) => {
    const { email, orgSlug } = body;

    const organisation = await prisma.organisation.findUnique({
      where: { slug: orgSlug },
    });

    if (!organisation) throw new ApiError("Organisation not found", 404);

    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { orgId_email: { orgId: organisation.id, email } },
      });

      if (!user) throw new ApiError("User not found in this organisation", 404);

      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 1000 * 60 * 15);

      await tx.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires,
          orgId: organisation.id,
        },
      });

      await tx.outboxEvent.create({
        data: {
          orgId: organisation.id,
          type: "SEND_MAGIC_LINK",
          payload: {
            email,
            token,
            orgSlug: organisation.slug,
            // 💡 Ensure NEXT_PUBLIC_APP_URL is in your .env
            magicLink: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?token=${token}&slug=${organisation.slug}`,
          },
        },
      });

      return { message: "Magic link sent to your email" };
    });
  },
  { schema: LoginSchema },
);
