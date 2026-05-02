import { apiHandler } from "@/lib/apiHandler";
import { prisma } from "@/lib/prisma";
import { subDays, differenceInDays } from "date-fns";

export const GET = apiHandler(
  async ({ orgId }) => {
    const thirtyDaysAgo = subDays(new Date(), 30);

    // 1. Get all materials and their current stock
    const materials = await prisma.material.findMany({
      where: { orgId },
      include: {
        stockItem: true,
        supplier: true,
      },
    });

    // 2. Get all 'DEDUCT' movements for the last 30 days
    const movements = await prisma.stockMovement.findMany({
      where: {
        orgId,
        type: "DEDUCT",
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    // 3. Calculate Velocity (Usage per Day)
    const analytics = materials.map((mat) => {
      const matMovements = movements.filter(
        (m) => m.stockItemId === mat.stockItemId,
      );
      const totalUsed = matMovements.reduce((sum, m) => sum + m.quantity, 0);

      // Average usage per day
      const burnRate = totalUsed / 30;
      const currentStock = mat.stockItem?.totalRemaining || 0;

      // Runway: Days until zero
      const runwayDays =
        burnRate > 0 ? Math.floor(currentStock / burnRate) : 999;

      // Alert Logic: Is Runway less than the supplier's Lead Time?
      const leadTime = mat.leadTimeDays || 3;
      const needsOrdering = runwayDays <= leadTime;

      return {
        materialId: mat.id,
        name: mat.name,
        currentStock,
        burnRate: burnRate.toFixed(2),
        runwayDays,
        status:
          runwayDays <= 0 ? "EMPTY" : needsOrdering ? "REPLENISH" : "STABLE",
        supplier: mat.supplier?.name,
      };
    });

    return analytics;
  },
  { requireAuth: true, requireOrg: true },
);
