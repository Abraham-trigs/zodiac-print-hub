// src/app/api/prices/route.ts
import { apiHandler } from "@lib/server/api/apiHandler";
import { prisma } from "@lib/prisma";

/**
 * GET /api/prices
 * Returns the "Menu" for the frontend.
 * Optimized to include the 'Rules' (calcType, unit) needed for the UI logic.
 */
export const GET = apiHandler(
  async ({ orgId, query }) => {
    const { category, isActive } = query;

    return await prisma.priceList.findMany({
      where: {
        orgId,
        isActive: isActive === "false" ? false : true,
        ...(category && {
          OR: [
            { materialCategory: category as any },
            { serviceCategory: category as any },
          ],
        }),
      },
      include: {
        // We include these to tell the Frontend HOW to calculate
        material: {
          select: {
            calcType: true,
            unit: true,
            purchasePrice: true,
          },
        },
        service: {
          select: {
            calcType: true,
          },
        },
      },
      orderBy: { displayName: "asc" },
    });
  },
  {
    requireAuth: true,
    requireOrg: true,
  },
);
