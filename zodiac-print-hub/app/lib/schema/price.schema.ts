import { z } from "zod";
import { ServiceUnitEnum } from "./job.schema";

/* =========================================================
   PRICE UPDATE (PATCH /prices/:id)
========================================================= */

export const UpdatePriceSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  unit: ServiceUnitEnum.optional(),
  priceGHS: z.number().nonnegative().optional(),
  // 🔥 NEW: Track cost changes
  costPrice: z.number().nonnegative().optional(),
  // 🔥 NEW: Link/Unlink stock items (CUID compatible)
  stockRefId: z.string().optional(),
  // 🔥 NEW: Archive/Disable status
  isActive: z.boolean().optional(),
});

/* =========================================================
   PRICE CREATE (POST /prices)
========================================================= */

export const CreatePriceSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  unit: ServiceUnitEnum,
  priceGHS: z.number().nonnegative(),

  // 🔥 NEW: Set initial cost for profit tracking
  costPrice: z.number().nonnegative().optional(),

  // 🔥 FIX: Changed .uuid() to .string() to support CUIDs
  stockRefId: z.string().optional(),
});

/* =========================================================
   PRICE QUERY (LIST FILTERING)
========================================================= */

export const PriceQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  unit: ServiceUnitEnum.optional(),
  isActive: z.coerce.boolean().optional(),

  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

/* =========================================================
   TYPES
========================================================= */

export type UpdatePriceInput = z.infer<typeof UpdatePriceSchema>;
export type CreatePriceInput = z.infer<typeof CreatePriceSchema>;
export type PriceQueryInput = z.infer<typeof PriceQuerySchema>;
