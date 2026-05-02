import { apiHandler, ApiError } from "@/lib/apiHandler";
import { prisma } from "@/lib/prisma";

export const GET = apiHandler<{ jobId: string }>(
  async ({ params, orgId }) => {
    const { jobId } = await params;

    const job = await prisma.job.findUnique({
      where: { id: jobId, orgId },
      include: {
        priceList: {
          include: {
            material: {
              include: { stockItem: true, supplier: true },
            },
          },
        },
      },
    });

    if (!job || !job.priceList.material) {
      throw new ApiError("Job or material mapping not found", 404);
    }

    const material = job.priceList.material;
    const currentStock = material.stockItem?.totalRemaining || 0;

    // 🧠 LOGIC: Does the warehouse have enough for this job?
    const shortfall = job.quantity - currentStock;

    if (shortfall <= 0) {
      return { hasEnough: true, shortfall: 0 };
    }

    // 📦 PROCUREMENT CALCULATION
    // shortfall is in 'Production Units' (e.g. 50ft)
    // buyQuantity is per 'Buying Unit' (e.g. 150ft per Roll)
    const buyQuantity = material.buyQuantity || 1;
    const unitsToOrder = Math.ceil(shortfall / buyQuantity);

    return {
      hasEnough: false,
      shortfall,
      productionUnit: material.unit,
      unitsToOrder: Math.max(unitsToOrder, material.minOrderQty || 1),
      buyUnit: material.buyUnit || "unit",
      estimatedCost: unitsToOrder * material.purchasePrice,
      supplier: material.supplier
        ? {
            id: material.supplier.id,
            name: material.supplier.name,
            phone: material.supplier.phone,
          }
        : null,
    };
  },
  { requireAuth: true, requireOrg: true },
);
