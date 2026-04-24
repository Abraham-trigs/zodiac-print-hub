import { z } from "zod";
import { ServiceUnitEnum } from "./job.schema";

/* =========================================================
   PRICE UPDATE (PATCH /prices/:id)
========================================================= */

export const UpdatePriceSchema = z.object({
  priceListId: z.string().min(1),

  priceGHS: z.number().nonnegative().optional(),

  name: z.string().min(1).optional(),
  category: z.string().min(1).optional(),

  unit: ServiceUnitEnum.optional(),
});

/* =========================================================
   PRICE CREATE
========================================================= */

export const CreatePriceSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),

  unit: ServiceUnitEnum,

  priceGHS: z.number().nonnegative(),

  stockRefId: z.string().optional(), // maps PriceItem → StockItem (material consumed per job)
});

/* =========================================================
   TYPES
========================================================= */

export type UpdatePriceInput = z.infer<typeof UpdatePriceSchema>;
export type CreatePriceInput = z.infer<typeof CreatePriceSchema>;
