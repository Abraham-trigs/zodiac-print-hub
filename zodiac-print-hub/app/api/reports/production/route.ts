// app/api/reports/production/route.ts
import { apiHandler } from "@/lib/apiHandler";
import { prisma } from "@/lib/prisma";

export const GET = apiHandler(
  async ({ orgId }) => {
    // 1. Fetch all completed jobs in the last 30 days
    const jobs = await prisma.job.findMany({
      where: { orgId, status: "COMPLETED" },
      select: {
        totalPrice: true,
        costPrice: true,
        profitMargin: true,
      },
    });

    // 2. Fetch all wastage recorded in the same period
    const wastage = await prisma.stockMovement.findMany({
      where: { orgId, type: "WASTE" },
      include: {
        stockItem: { include: { material: true } },
      },
    });

    // 3. Aggregation Logic (The Brain)
    const grossRevenue = jobs.reduce((sum, j) => sum + j.totalPrice, 0);
    const materialCost = jobs.reduce((sum, j) => sum + (j.costPrice || 0), 0);

    const wastageCost = wastage.reduce((sum, w) => {
      const unitCost = w.stockItem.material.purchasePrice || 0;
      return sum + w.quantity * unitCost;
    }, 0);

    const netProfit = grossRevenue - materialCost - wastageCost;

    return {
      summary: {
        revenue: grossRevenue,
        costs: materialCost,
        leakage: wastageCost,
        netProfit: netProfit,
        margin: grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0,
      },
      wastageCount: wastage.length,
      jobCount: jobs.length,
    };
  },
  {
    requireAuth: true,
    requireOrg: true,
  },
);
