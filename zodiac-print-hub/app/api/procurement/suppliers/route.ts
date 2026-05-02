import { apiHandler } from "@lib/server/api/apiHandler";
import { prisma } from "@lib/prisma-client";
import { z } from "zod";

const CreateSupplierSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  category: z.string().optional(),
});

/**
 * GET: Fetch all suppliers for the organization
 */
export const GET = apiHandler(
  async ({ orgId }) => {
    return await prisma.supplier.findMany({
      where: { orgId },
      include: {
        _count: {
          select: { materials: true, purchaseOrders: true },
        },
      },
      orderBy: { name: "asc" },
    });
  },
  { requireAuth: true, requireOrg: true },
);

/**
 * POST: Register a new supplier
 */
export const POST = apiHandler(
  async ({ orgId, body }) => {
    const data = CreateSupplierSchema.parse(body);

    return await prisma.supplier.create({
      data: {
        ...data,
        orgId,
      },
    });
  },
  { requireAuth: true, requireOrg: true },
);
