import { apiHandler } from "@/lib/apiHandler";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";

export const GET = apiHandler(
  async ({ orgId }) => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());

    // 1. Fetch all payments received this month (Gross Revenue)
    const payments = await prisma.payment.findMany({
      where: { orgId, createdAt: { gte: start, lte: end } },
    });
    const grossRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    // 2. Fetch all completed jobs to calculate 'Sold' COGS
    const completedJobs = await prisma.job.findMany({
      where: {
        orgId,
        status: "READY_FOR_PICKUP",
        createdAt: { gte: start, lte: end },
      },
      include: { priceList: { include: { material: true } } },
    });

    const cogs = completedJobs.reduce((sum, job) => {
      const costPerUnit = job.priceList.material?.purchasePrice || 0;
      return sum + job.quantity * costPerUnit;
    }, 0);

    // 3. Fetch 'WASTE' movements (The Leakage)
    const wasteMovements = await prisma.stockMovement.findMany({
      where: { orgId, type: "WASTE", createdAt: { gte: start, lte: end } },
      include: { stockItem: { include: { material: true } } },
    });

    const leakageValue = wasteMovements.reduce((sum, m) => {
      const costPerUnit = m.stockItem.material.purchasePrice;
      return sum + m.quantity * costPerUnit;
    }, 0);

    return {
      grossRevenue,
      cogs,
      leakageValue,
      netProfit: grossRevenue - cogs - leakageValue,
      taxEstimate: grossRevenue * 0.05, // Ghanaian 5% presumptive tax placeholder
    };
  },
  { requireAuth: true, requireOrg: true },
);
