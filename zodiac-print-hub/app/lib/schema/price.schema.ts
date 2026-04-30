import { z } from "zod";
import { ServiceUnitEnum } from "./job.schema";

/* =========================================================
   SHARED ENUMS
========================================================= */

export const PriceItemTypeEnum = z.enum(["MATERIAL", "SERVICE"]);

/* =========================================================
   METADATA
========================================================= */

const MaterialMetadataSchema = z.object({
  kind: z.literal("MATERIAL"),

  costPrice: z.number().nonnegative(),

  width: z.number().nonnegative().optional(),
  height: z.number().nonnegative().optional(),

  stockRefId: z.string().optional(),
});

const ServiceMetadataSchema = z.object({
  kind: z.literal("SERVICE"),

  costPrice: z.number().nonnegative(),

  minOrder: z.number().int().positive().optional(),
});

const MetadataSchema = z.discriminatedUnion("kind", [
  MaterialMetadataSchema,
  ServiceMetadataSchema,
]);

/* =========================================================
   CREATE (POST /prices)
========================================================= */

export const CreatePriceSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  unit: ServiceUnitEnum,
  priceGHS: z.number().nonnegative(),

  type: PriceItemTypeEnum,

  metadata: MetadataSchema,
});

/* =========================================================
   UPDATE (PATCH /prices/:id)
========================================================= */

export const UpdatePriceSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  unit: ServiceUnitEnum.optional(),
  priceGHS: z.number().nonnegative().optional(),
  isActive: z.boolean().optional(),

  // allow metadata patch (partial, but still typed)
  metadata: z
    .object({
      costPrice: z.number().nonnegative().optional(),
      width: z.number().nonnegative().optional(),
      height: z.number().nonnegative().optional(),
      stockRefId: z.string().optional(),
      minOrder: z.number().int().positive().optional(),
    })
    .optional(),
});

/* =========================================================
   QUERY
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

export type CreatePriceInput = z.infer<typeof CreatePriceSchema>;
export type UpdatePriceInput = z.infer<typeof UpdatePriceSchema>;
export type PriceQueryInput = z.infer<typeof PriceQuerySchema>;
