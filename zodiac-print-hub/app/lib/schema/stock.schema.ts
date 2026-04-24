import { z } from "zod";

/* =========================================================
   STOCK MOVEMENT (FINAL SOURCE OF TRUTH)
   - Replaces RestockRecord completely
   - Used by Job, Restock, Waste, Manual adjustments
========================================================= */

export const StockMovementTypeEnum = z.enum([
  "RESTOCK",
  "DEDUCT",
  "WASTE",
  "ADJUST",
]);

export const ReferenceTypeEnum = z.enum(["JOB", "RESTOCK", "WASTE", "MANUAL"]);

/**
 * Core inventory ledger entry
 * Every stock change MUST go through this schema
 */
export const CreateStockMovementSchema = z.object({
  stockItemId: z.string().min(1),

  type: StockMovementTypeEnum,

  /**
   * Always positive value.
   * Direction is determined by `type`:
   *
   * - RESTOCK → increases stock quantity
   * - DEDUCT  → decreases stock quantity
   * - WASTE   → represents physical loss and reduces stock
   * - ADJUST  → sets stock to an absolute corrected value
   */
  quantity: z.number().positive(),

  unitCost: z.number().nonnegative().optional(),

  referenceId: z.string().optional(),
  referenceType: ReferenceTypeEnum.optional(),

  note: z.string().max(500).optional(),

  createdBy: z.string().min(1),
});

/* =========================================================
   QUERY
========================================================= */

export const StockMovementQuerySchema = z.object({
  stockItemId: z.string().optional(),
  type: StockMovementTypeEnum.optional(),
  referenceId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

/* =========================================================
   TYPES
========================================================= */

export type CreateStockMovementInput = z.infer<
  typeof CreateStockMovementSchema
>;

export type StockMovementQueryInput = z.infer<typeof StockMovementQuerySchema>;

export type StockMovementType = z.infer<typeof StockMovementTypeEnum>;
export type ReferenceType = z.infer<typeof ReferenceTypeEnum>;
