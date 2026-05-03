import { z } from "zod";

// 🚀 ADD THIS: The source of truth for all measurements in the system
export const ServiceUnitEnum = z.enum([
  // Linear
  "inch",
  "ft",
  "yd",
  "mm",
  "cm",
  "m",
  "meter",
  // Area
  "sqft",
  "sqm",
  "PER_SQ_METER",
  "PER_YARD",
  // Discrete / Count
  "piece",
  "pack",
  "PER_100",
  // Time
  "hour",
]);

export const CreateJobSchema = z.object({
  clientId: z.string().cuid(),
  priceListId: z.string().cuid(),

  // Basic Specs
  quantity: z.number().positive(),
  // ✅ Use the enum here for validation
  unit: ServiceUnitEnum,
  width: z.number().nonnegative().optional(),
  height: z.number().nonnegative().optional(),

  // B2B & Workflow
  b2bPushId: z.string().cuid().optional(),
  assignedStaffId: z.string().cuid().optional(),

  notes: z.string().max(500).optional(),

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
