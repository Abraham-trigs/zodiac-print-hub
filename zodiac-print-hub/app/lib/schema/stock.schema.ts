import { z } from "zod";

/* =========================================================
   ENUMS (DOMAIN TRUTH)
========================================================= */

export const JobStatusEnum = z.enum([
  "PENDING",
  "IN_PROGRESS",
  "QUALITY_CHECK",
  "READY_FOR_PICKUP",
  "COMPLETED",
  "CANCELLED",
  "PAUSED",
]);

export const ServiceUnitEnum = z.enum([
  "sqft",
  "sqm",
  "sqcm",
  "inch",
  "ft",
  "yd",
  "mm",
  "cm",
  "m",
  "meter",
  "pack",
  "piece",
  "roll",
  "box",
  "ream",
  "bottle",
  "liter",
  "hour",
  "Per Page",
  "Per 100",
  "Per Sq Meter",
  "Per Set",
  "Per Yard",
]);

/* =========================================================
   PRICE ITEM (SERVICE SNAPSHOT)
========================================================= */

export const PriceItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  unit: ServiceUnitEnum, // STRICT (no fallback string)
  priceGHS: z.number().nonnegative(),
  stockRefId: z.string().optional(),
});

/* =========================================================
   STOCK MODULE
========================================================= */

/** POST /stock (restock) */
export const RestockStockSchema = z.object({
  stockItemId: z.string().min(1),
  quantity: z.number().positive(),
  unitCost: z.number().nonnegative(),
});

/** GET /stock (optional query filters) */
export const StockQuerySchema = z.object({
  search: z.string().optional(),
});

/* =========================================================
   CREATE JOB (POST /jobs)
========================================================= */

export const CreateJobSchema = z.object({
  clientId: z.string().min(1),
  service: PriceItemSchema,
  quantity: z.number().int().positive(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  assignedStaffId: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

/* =========================================================
   UPDATE JOB STATUS (PATCH /jobs/:id)
========================================================= */

export const UpdateJobStatusSchema = z.object({
  status: JobStatusEnum,
});

/* =========================================================
   TYPES (DERIVED)
========================================================= */

export type CreateJobInput = z.infer<typeof CreateJobSchema>;
export type UpdateJobStatusInput = z.infer<typeof UpdateJobStatusSchema>;
export type PriceItemInput = z.infer<typeof PriceItemSchema>;
export type RestockStockInput = z.infer<typeof RestockStockSchema>;
export type StockQueryInput = z.infer<typeof StockQuerySchema>;
