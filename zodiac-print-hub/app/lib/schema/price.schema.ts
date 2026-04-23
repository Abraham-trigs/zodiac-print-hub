import { z } from "zod";

/* =========================================================
   UPDATE PRICE (PATCH /prices)
========================================================= */

export const UpdatePriceSchema = z.object({
  priceListId: z.string().min(1),
  priceGHS: z.number().positive(),
});

/* =========================================================
   TYPES (derived from schema)
========================================================= */

export type UpdatePriceInput = z.infer<typeof UpdatePriceSchema>;
