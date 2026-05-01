// app/api/stock/movements/route.ts
import { apiHandler } from "@/lib/apiHandler";
import { prisma } from "@/lib/prisma";

export const GET = apiHandler(
  async ({ orgId, query }) => {
    const { stockItemId, type } = query;

    const movements = await prisma.stockMovement.findMany({
      where: {
        orgId,
        ...(stockItemId && { stockItemId: String(stockItemId) }),
        ...(type && { type: String(type) as any }),
      },
      include: {
        // We include the user to show WHO authorized the movement in the UI
        stockItem: {
          include: { material: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100, // Safety limit
    });

    return movements;
  },
  {
    requireAuth: true,
    requireOrg: true,
  },
);
