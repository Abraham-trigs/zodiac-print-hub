// src/app/api/prices/bulk/route.ts
import { apiHandler } from "@/lib/apiHandler";
import { ExcelUploadService } from "@/services/excel-upload.service";
import { z } from "zod";

/**
 * SCHEMA VALIDATION
 * Ensures the incoming JSON from the Excel Parser matches
 * our "Recipe" requirements.
 */
const BulkImportSchema = z.array(
  z.object({
    name: z.string().min(1),
    displayName: z.string().optional(),
    type: z.enum(["MATERIAL", "SERVICE"]),
    salePrice: z.number().nonnegative(),
    category: z.string().min(1),
    calcType: z.string(), // Validated inside the service via Enum check
    unit: z.string().optional(),
    purchasePrice: z.number().optional(),
    basePrice: z.number().optional(),
    initialStock: z.number().optional(),
    lowStockThreshold: z.number().optional(),
  }),
);

export const POST = apiHandler(
  async ({ body, orgId }) => {
    // 1. Process the bulk rows through the Smart Deduplication Service
    const results = await ExcelUploadService.bulkImport(body, orgId);

    return {
      message: `Successfully processed ${results.length} items.`,
      count: results.length,
      // Return the updated price items to hydrate the store immediately
      items: results,
    };
  },
  {
    requireAuth: true,
    requireOrg: true,
    schema: BulkImportSchema, // Validates the JSON array structure
  },
);
