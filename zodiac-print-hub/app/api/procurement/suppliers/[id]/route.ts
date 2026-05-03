import { apiHandler } from "@root/server/api/apiHandler";
import { prisma } from "@lib/prisma-client";

/**
 * GET: Fetch single supplier with their materials
 */
export const GET = apiHandler<{ id: string }>(
  async ({ params, orgId }) => {
    const { id } = await params;

    return await prisma.supplier.findFirst({
      where: { id, orgId },
      include: {
        materials: {
          include: { stockItem: true },
        },
        purchaseOrders: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
      },
    });
  },
  { requireAuth: true, requireOrg: true },
);

/**
 * PATCH: Update supplier details
 */
export const PATCH = apiHandler<{ id: string }>(
  async ({ params, body, orgId }) => {
    const { id } = await params;

    return await prisma.supplier.update({
      where: { id, orgId },
      data: body,
    });
  },
  { requireAuth: true, requireOrg: true },
);

/**
 * DELETE: Remove supplier
 */
export const DELETE = apiHandler<{ id: string }>(
  async ({ params, orgId }) => {
    const { id } = await params;

    return await prisma.supplier.delete({
      where: { id, orgId },
    });
  },
  { requireAuth: true, requireOrg: true },
);
