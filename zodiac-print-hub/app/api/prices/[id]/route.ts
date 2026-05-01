// src/app/api/prices/[id]/route.ts
import { apiHandler, ApiError } from "@/lib/apiHandler";
import { prisma } from "@/lib/prisma";

/**
 * GET SINGLE PRICE RECIPE
 * Used by the Workstation and Job Modal to fetch the 'Rules' for a specific ID.
 */
export const GET = apiHandler<{ id: string }>(
  async ({ orgId, params }) => {
    // Next.js 15+ Requirement: Dynamic route parameters must be awaited
    const { id } = await params;

    const priceItem = await prisma.priceList.findFirst({
      where: { id, orgId },
      include: {
        material: true, // Returns calcType, unit, purchasePrice
        service: true, // Returns calcType, basePrice
      },
    });

    if (!priceItem) throw new ApiError("Price item not found", 404);

    return priceItem;
  },
  { requireAuth: true, requireOrg: true },
);

/**
 * UPDATE PRICE/RECIPE
 * Logic: Updates the Junction (PriceList) and its linked Resource (Material/Service) atomically.
 */
export const PATCH = apiHandler<{ id: string }>(
  async ({ orgId, params, body }) => {
    const { id } = await params;
    const { displayName, salePrice, purchasePrice, basePrice, isActive } = body;

    return await prisma.$transaction(async (tx) => {
      // 1. Fetch existing to identify material vs service
      const existing = await tx.priceList.findFirst({
        where: { id, orgId },
      });

      if (!existing) throw new ApiError("Price item not found", 404);

      // 2. Update the Linked Resource if needed
      if (existing.materialId && purchasePrice !== undefined) {
        await tx.material.update({
          where: { id: existing.materialId },
          data: {
            purchasePrice,
            name: displayName || existing.displayName,
          },
        });
      }

      if (existing.serviceId && basePrice !== undefined) {
        await tx.service.update({
          where: { id: existing.serviceId },
          data: {
            basePrice,
            name: displayName || existing.displayName,
          },
        });
      }

      // 3. Update the Junction Item
      return await tx.priceList.update({
        where: { id },
        data: {
          displayName,
          salePrice,
          isActive,
        },
        include: { material: true, service: true },
      });
    });
  },
  { requireAuth: true, requireOrg: true },
);

/**
 * DELETE PRICE ITEM
 */
export const DELETE = apiHandler<{ id: string }>(
  async ({ orgId, params }) => {
    const { id } = await params;

    await prisma.priceList.delete({
      where: { id, orgId },
    });

    return { message: "Item removed from price list" };
  },
  { requireAuth: true, requireOrg: true },
);
