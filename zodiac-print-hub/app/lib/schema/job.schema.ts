// src/schemas/job.schema.ts
import { z } from "zod";

export const CreateJobSchema = z.object({
  clientId: z.string().cuid(),
  priceListId: z.string().cuid(),

  // Basic Specs
  quantity: z.number().positive(),
  width: z.number().nonnegative().optional(),
  height: z.number().nonnegative().optional(),

  // B2B & Workflow
  b2bPushId: z.string().cuid().optional(), // Link to B2B push if applicable
  assignedStaffId: z.string().cuid().optional(),

  notes: z.string().max(500).optional(),

  // Optional: Initial variables/add-ons to add during creation
  variables: z
    .array(
      z.object({
        priceListId: z.string().cuid(),
        quantity: z.number().positive(),
        width: z.number().optional(),
        height: z.number().optional(),
      }),
    )
    .optional(),
});

export type CreateJobInput = z.infer<typeof CreateJobSchema>;

// import { z } from "zod";

// /* =========================================================
//    ENUMS (DOMAIN TRUTH)
// ========================================================= */

// export const JobStatusEnum = z.enum([
//   "PENDING",
//   "IN_PROGRESS",
//   "QUALITY_CHECK",
//   "READY_FOR_PICKUP",
//   "COMPLETED",
//   "CANCELLED",
//   "PAUSED",
// ]);

// export const ServiceUnitEnum = z.enum([
//   "sqft",
//   "sqm",
//   "sqcm",
//   "inch",
//   "ft",
//   "yd",
//   "mm",
//   "cm",
//   "m",
//   "meter",
//   "pack",
//   "piece",
//   "roll",
//   "box",
//   "ream",
//   "bottle",
//   "liter",
//   "hour",
//   "Per Page",
//   "Per 100",
//   "Per Sq Meter",
//   "Per Set",
//   "Per Yard",
// ]);

// /* =========================================================
//    PRICE ITEM (SERVICE SNAPSHOT)
// ========================================================= */

// export const PriceItemSchema = z.object({
//   id: z.string().min(1),
//   name: z.string().min(1),
//   // strict unit = prevents silent pricing bugs
//   unit: ServiceUnitEnum,
//   priceGHS: z.number().nonnegative(),
//   stockRefId: z.string().optional(),
// });

// /* =========================================================
//    CREATE JOB (POST /jobs)
// ========================================================= */

// export const CreateJobSchema = z.object({
//   clientId: z.string().min(1),

//   service: PriceItemSchema,

//   quantity: z.number().positive(), // Changed to positive() to allow decimal quantities if needed (e.g., 1.5 yards)

//   width: z.number().positive().optional(),
//   height: z.number().positive().optional(),

//   assignedStaffId: z.string().optional(),

//   notes: z.string().max(1000).optional(),

//   // 🔥 NEW: Added to support B2B price overrides
//   b2bPushId: z.string().optional(),
// });

// /* =========================================================
//    UPDATE JOB STATUS (PATCH /jobs/:id)
// ========================================================= */

// export const UpdateJobStatusSchema = z.object({
//   status: JobStatusEnum,
// });

// /* =========================================================
//    TYPES (derived from schema)
// ========================================================= */

// export type CreateJobInput = z.infer<typeof CreateJobSchema>;
// export type UpdateJobStatusInput = z.infer<typeof UpdateJobStatusSchema>;
// export type PriceItemInput = z.infer<typeof PriceItemSchema>;
