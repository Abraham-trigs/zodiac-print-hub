// src/services/excel-upload.service.ts
import { prisma } from "@/lib/prisma";
import {
  MaterialCalculationType,
  ServiceCalculationType,
  ServiceUnit,
  MaterialCategory,
  ServiceCategory,
} from "@prisma/client";

export const ExcelUploadService = {
  /**
   * BULK IMPORT WITH SMART DEDUPLICATION
   * Logic: Check if Resource exists (by Name + OrgId).
   * If yes, link to it. If no, create it.
   */
  async bulkImport(rows: any[], orgId: string) {
    return await prisma.$transaction(async (tx) => {
      const results = [];

      for (const row of rows) {
        const type = row.type?.toUpperCase(); // MATERIAL or SERVICE

        if (type === "MATERIAL") {
          // 1. 🧠 DEDUPLICATION: Find existing Material in THIS Shop
          let material = await tx.material.findUnique({
            where: {
              orgId_name: { orgId, name: row.name }, // Uses the @@unique index
            },
          });

          // 2. CREATE IF NEW: Create Material + Stock Bucket
          if (!material) {
            material = await tx.material.create({
              data: {
                orgId,
                name: row.name,
                calcType: row.calcType as MaterialCalculationType,
                unit: row.unit as ServiceUnit,
                purchasePrice: Number(row.purchasePrice || 0),
                stockItem: {
                  create: {
                    orgId,
                    totalRemaining: Number(row.initialStock || 0),
                    lowStockThreshold: Number(row.lowStockThreshold || 10),
                  },
                },
              },
            });
          }

          // 3. CREATE JUNCTION: Link to the Material (whether new or found)
          const priceEntry = await tx.priceList.create({
            data: {
              orgId,
              displayName: row.displayName || row.name,
              salePrice: Number(row.salePrice),
              materialCategory: row.category as MaterialCategory,
              materialId: material.id,
            },
          });
          results.push(priceEntry);
        }

        if (type === "SERVICE") {
          // 🧠 DEDUPLICATION: Find existing Service in THIS Shop
          let service = await tx.service.findUnique({
            where: {
              orgId_name: { orgId, name: row.name },
            },
          });

          if (!service) {
            service = await tx.service.create({
              data: {
                orgId,
                name: row.name,
                calcType: row.calcType as ServiceCalculationType,
                basePrice: Number(row.basePrice || 0),
              },
            });
          }

          const priceEntry = await tx.priceList.create({
            data: {
              orgId,
              displayName: row.displayName || row.name,
              salePrice: Number(row.salePrice),
              serviceCategory: row.category as ServiceCategory,
              serviceId: service.id,
            },
          });
          results.push(priceEntry);
        }
      }

      return results;
    });
  },
};
