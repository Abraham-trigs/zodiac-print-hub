import { z } from "zod";

/* =========================================================
   ENUMS
========================================================= */

export const ClientTypeEnum = z.enum(["PRIVATE", "COMPANY"]);

/* =========================================================
   CORE SCHEMAS
========================================================= */

export const CreateClientSchema = z.object({
  name: z.string().min(1),
  type: ClientTypeEnum,
  phone: z.string().min(1),
  email: z.string().email().optional(),
});

/* =========================================================
   UPDATE CLIENT (FULLY SYNCED WITH DOMAIN + JOB SERVICE)
========================================================= */

export const UpdateClientSchema = z.object({
  name: z.string().min(1).optional(),
  type: ClientTypeEnum.optional(),
  phone: z.string().min(1).optional(),
  email: z.string().email().optional(),

  companyName: z.string().optional(),
  location: z.string().optional(),
  profilePictureUrl: z.string().url().optional(),
  notes: z.string().optional(),

  /* =========================================================
     LIFECYCLE FIELDS (USED BY JobService + analytics)
  ========================================================= */

  lastJobId: z.string().optional(),
  lastJobDate: z.string().optional(),

  totalJobs: z.number().int().nonnegative().optional(),

  /* FIXED: aligned naming with domain (NOT lastStaffId) */
  recentStaffId: z.string().optional(),

  mostPrintedServiceId: z.string().optional(),

  isNew: z.boolean().optional(),
});

/* =========================================================
   PAGINATION
========================================================= */

export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

/* =========================================================
   SEARCH QUERY
========================================================= */

export const ClientSearchQuerySchema = PaginationSchema.extend({
  query: z.string().optional().default(""),
});

/* =========================================================
   REQUEST WRAPPERS (apiHandler SAFE)
========================================================= */

export const CreateClientRequestSchema = CreateClientSchema;

export const ClientSearchRequestSchema = z.object({
  query: ClientSearchQuerySchema,
});

/* =========================================================
   TYPES
========================================================= */

export type CreateClientInput = z.infer<typeof CreateClientSchema>;
export type UpdateClientInput = z.infer<typeof UpdateClientSchema>;
export type ClientSearchQuery = z.infer<typeof ClientSearchQuerySchema>;
