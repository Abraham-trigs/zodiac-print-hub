import { apiHandler, ApiError } from "@server/api/apiHandler"; // 🚀 Fixed Alias
import { prisma } from "@/lib/prisma-client";
import { UnitOfWork } from "@/lib/server/db/unitOfWork";
// ✅ FIX: Import as type to prevent 'index-browser' build leaks
import type { POStatus } from "@prisma/client";
import { z } from "zod";

const CreatePOSchema = z.object({
  supplierId: z.string().cuid(),
  relatedJobId: z.string().cuid().optional(),
  items: z
    .array(
      z.object({
        materialId: z.string().cuid(),
        quantity: z.number().positive(),
        unitPrice: z.number().nonnegative(),
        buyUnit: z.string(),
      }),
    )
    .min(1),
});

/**
 * GET: Fetch Procurement Pipeline
 */
export const GET = apiHandler(
  async ({ orgId, user }) => {
    // 🛡️ SUPPLIER ROLE GUARD
    if (user.role === "SUPPLIER") {
      const supplierRecord = await prisma.supplier.findUnique({
        where: { linkedUserId: user.id },
      });

      if (!supplierRecord) {
        throw new ApiError(
          "No supplier record linked to this user profile.",
          403,
        );
      }

      return await prisma.stockPurchaseOrder.findMany({
        where: {
          orgId,
          supplierId: supplierRecord.id,
        },
        include: {
          items: { include: { material: true } },
          supplier: { select: { name: true, phone: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    // 👑 ADMIN/MANAGER VIEW
    return await prisma.stockPurchaseOrder.findMany({
      where: { orgId },
      include: {
        supplier: { select: { name: true, phone: true, category: true } },
        items: { include: { material: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },
  { requireAuth: true, requireOrg: true },
);

/**
 * POST: Draft a new Purchase Order
 */
export const POST = apiHandler(
  async ({ orgId, body }) => {
    const data = CreatePOSchema.parse(body);

    return await UnitOfWork.run(async (tx) => {
      const totalCost = data.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0,
      );

      return await tx.stockPurchaseOrder.create({
        data: {
          orgId,
          supplierId: data.supplierId,
          relatedJobId: data.relatedJobId,
          // 🚀 Use string value instead of Enum constant for stability
          status: "DRAFT" as POStatus,
          totalCost,
          items: {
            create: data.items.map((item) => ({
              materialId: item.materialId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              buyUnit: item.buyUnit,
            })),
          },
        },
        include: {
          items: true,
          supplier: true,
        },
      });
    });
  },
  { requireAuth: true, requireOrg: true },
);
