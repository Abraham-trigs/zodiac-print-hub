// src/app/api/prices/route.ts
import { apiHandler, ApiError } from "@lib/server/api/apiHandler";
import { prisma } from "@lib/prisma-client";
import { z } from "zod";

/**
 * MANUAL ENTRY HANDLER
 * Atomic Transaction: Material/Service + PriceList Junction
 */
export const POST = apiHandler(
  async ({ body, orgId }) => {
    const {
      displayName,
      salePrice,
      type,
      // Material fields
      materialCategory,
      mCalcType,
      purchasePrice,
      unit,
      lowStockThreshold,
      // Service fields
      serviceCategory,
      sCalcType,
      basePrice,
    } = body;

    return await prisma.$transaction(async (tx) => {
      // --- PATH 1: PHYSICAL MATERIAL ---
      if (type === "MATERIAL") {
        // 1. Create the Physical Resource (Material)
        const material = await tx.material.create({
          data: {
            orgId,
            name: displayName, // Technical name matches display for manual entry
            calcType: mCalcType,
            unit: unit,
            purchasePrice: purchasePrice || 0,
            // Automatically create the Stock Bucket for this material
            stockItem: {
              create: {
                orgId,
                totalRemaining: 0,
                lowStockThreshold: lowStockThreshold || 10,
              },
            },
          },
        });

        // 2. Create the Menu Entry (PriceList Junction)
        return await tx.priceList.create({
          data: {
            orgId,
            displayName,
            salePrice,
            materialCategory,
            materialId: material.id,
            isActive: true,
          },
          include: { material: true }, // Return full recipe for store hydration
        });
      }

      // --- PATH 2: LABOR SERVICE ---
      if (type === "SERVICE") {
        // 1. Create the Effort Resource (Service)
        const service = await tx.service.create({
          data: {
            name: displayName,
            calcType: sCalcType,
            basePrice: basePrice || 0,
            isActive: true,
          },
        });

        // 2. Create the Menu Entry (PriceList Junction)
        return await tx.priceList.create({
          data: {
            orgId,
            displayName,
            salePrice,
            serviceCategory,
            serviceId: service.id,
            isActive: true,
          },
          include: { service: true },
        });
      }

      throw new ApiError("Invalid entry type", 400);
    });
  },
  { requireAuth: true, requireOrg: true },
);
