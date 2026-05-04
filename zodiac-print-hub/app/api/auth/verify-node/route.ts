import { apiHandler, ApiError } from "@server/api/apiHandler"; // 🚀 Fixed Alias
import { prisma } from "@/lib/prisma-client";
import { z } from "zod";

const VerifySlugSchema = z.object({
  slug: z.string().min(2).max(50).toLowerCase().trim(),
});

export const GET = apiHandler(
  async ({ query }) => {
    // ✅ Use the schema to parse the query safely
    const { slug } = VerifySlugSchema.parse(query);

    const organisation = await prisma.organisation.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        isActive: true,
      },
    });

    if (!organisation) {
      throw new ApiError("Industrial Node not found", 404);
    }

    if (!organisation.isActive) {
      throw new ApiError(
        "This Node has been decommissioned by Central Core",
        403,
      );
    }

    return {
      organisation,
      serverTime: new Date().toISOString(),
    };
  },
  {
    requireAuth: false,
    requireOrg: false,
  },
);
