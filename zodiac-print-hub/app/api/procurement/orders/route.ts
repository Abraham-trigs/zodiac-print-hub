import { apiHandler, ApiError } from "@/lib/apiHandler";
import { prisma } from "@/lib/prisma";
import { UnitOfWork } from "@/lib/db/unitOfWork";
import { POStatus } from "@prisma/client";
import { z } from "zod";

/**
 * SCHEMA: Create Stock Purchase Order
 * Used for manual restocking or JIT batching.
 */
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
 * 🔐 SECURITY: Filtered by Role (Supplier vs Manager)
 */
export const GET = apiHandler(
  async ({ orgId, user }) => {
    // 🛡️ ROLE GUARD: If the user is a linked Supplier
    if (user.role === "SUPPLIER") {
      const supplierRecord = await prisma.supplier.findUnique({
        where: { linkedUserId: user.id },
      });

      if (!supplierRecord) {
        throw new ApiError(
          "No supplier registry record linked to this user.",
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

    // 👑 ADMIN/MANAGER: Full visibility of shop procurement
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
 * Atomic creation of PO and Line Items
 */
export const POST = apiHandler(
  async ({ orgId, body }) => {
    const data = CreatePOSchema.parse(body);

    return await UnitOfWork.run(async (tx) => {
      // 1. Calculate Total Cost from snapshot prices
      const totalCost = data.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0,
      );

      // 2. Create Master PO and Items in one transaction
      const po = await tx.stockPurchaseOrder.create({
        data: {
          orgId,
          supplierId: data.supplierId,
          relatedJobId: data.relatedJobId,
          status: POStatus.DRAFT,
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

      return po;
    });
  },
  { requireAuth: true, requireOrg: true },
);
