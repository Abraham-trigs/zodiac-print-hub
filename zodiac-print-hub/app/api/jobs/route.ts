import { apiHandler, ApiError } from "@lib/server/api/apiHandler";
import { prisma } from "@lib/prisma-client";
import { JobService } from "@server/services/job.service";
import { z } from "zod";

/**
 * SERVICE_UNIT_ENUM
 * Strict validation for industrial measurement units.
 */
export const ServiceUnitEnum = z.enum([
  "inch",
  "ft",
  "yd",
  "mm",
  "cm",
  "m",
  "meter",
  "sqft",
  "sqm",
  "PER_SQ_METER",
  "PER_YARD",
  "piece",
  "pack",
  "PER_100",
  "hour",
]);

/**
 * CREATE_JOB_SCHEMA
 * Validates the full industrial payload including the Triple-Price Handshake.
 */
export const CreateJobSchema = z.object({
  clientId: z.string().cuid(),
  priceListId: z.string().cuid(),
  serviceName: z.string().min(2),

  // Basic Specs
  quantity: z.number().positive(),
  unit: ServiceUnitEnum,
  width: z.number().nonnegative().default(0),
  height: z.number().nonnegative().default(0),

  // Financials (The Triple-Price Node)
  totalPrice: z.number().positive(), // Retail
  costPrice: z.number().nonnegative(), // Material
  basePrice: z.number().nonnegative(), // Labor/Ops

  // B2B & Workflow
  b2bPushId: z.string().cuid().optional(),
  assignedStaffId: z.string().cuid().optional(),
  materialId: z.string().optional(),
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

/**
 * GET: Fetch Production Queue
 */
export const GET = apiHandler(
  async ({ orgId }) => {
    return await prisma.job.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { name: true, phone: true } },
        payments: true,
        // Include material for the Nesting Builder
        priceList: { include: { material: true } },
      },
    });
  },
  { requireAuth: true, requireOrg: true },
);

/**
 * POST: Execute Job Intake
 */
export const POST = apiHandler(
  async ({ body, orgId, user }) => {
    // 1. Validate Payload (Using the synced schema name)
    const validatedData = CreateJobSchema.parse(body);

    // 2. Handshake with JobService
    // This handles the ShortRef, Public Token, and Outbox broadcasting
    return await JobService.create({
      ...validatedData,
      orgId,
    });
  },
  { requireAuth: true, requireOrg: true },
);
