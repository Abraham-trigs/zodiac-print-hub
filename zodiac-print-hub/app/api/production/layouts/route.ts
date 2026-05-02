import { apiHandler, ApiError } from "@/lib/apiHandler";
import { prisma } from "@/lib/prisma";
import { UnitOfWork } from "@/lib/db/unitOfWork";
import { LayoutStatus } from "@prisma/client";
import { z } from "zod";

/**
 * SCHEMA: The "Sufficient" Layout Payload
 * 🔥 UPDATED: Items now accept jobId OR jobVariableId
 */
const SaveLayoutSchema = z.object({
  materialId: z.string(),
  rollWidth: z.number().positive(),
  cutLineHeight: z.number().positive(),
  totalWastedArea: z.number().nonnegative(),
  efficiency: z.number().min(0).max(100),
  items: z
    .array(
      z.object({
        jobId: z.string().optional(),
        jobVariableId: z.string().optional(),
        posX: z.number(),
        posY: z.number(),
        width: z.number(),
        height: z.number(),
        isRotated: z.boolean(),
      }),
    )
    .min(1)
    .refine((items) => items.every((i) => i.jobId || i.jobVariableId), {
      message: "Each item must be linked to a Job or a JobVariable",
    }),
});

export const POST = apiHandler(
  async ({ orgId, body }) => {
    const data = SaveLayoutSchema.parse(body);

    return await UnitOfWork.run(async (tx) => {
      // 1. Create the Master Layout Record
      const layout = await tx.materialPrintLayout.create({
        data: {
          orgId,
          materialId: data.materialId,
          rollWidth: data.rollWidth,
          cutLineHeight: data.cutLineHeight,
          totalWastedArea: data.totalWastedArea,
          efficiency: data.efficiency,
          status: LayoutStatus.LOCKED,
        },
      });

      // 2. Create Layout Items (The Boxes)
      const itemCreations = data.items.map((item) =>
        tx.printLayoutItem.create({
          data: {
            layoutId: layout.id,
            jobId: item.jobId,
            jobVariableId: item.jobVariableId,
            posX: item.posX,
            posY: item.posY,
            width: item.width,
            height: item.height,
            isRotated: item.isRotated,
          },
        }),
      );

      await Promise.all(itemCreations);

      // 3. Status Sync: Move all Jobs/Variables to IN_PROGRESS
      const jobIds = data.items.map((i) => i.jobId).filter(Boolean) as string[];
      if (jobIds.length > 0) {
        await tx.job.updateMany({
          where: { id: { in: jobIds } },
          data: { status: "IN_PROGRESS" },
        });
      }

      return layout;
    });
  },
  { requireAuth: true, requireOrg: true },
);

/**
 * GET: Fetch "Shootable" Pool (Jobs + Variables)
 * 🔥 UPDATED: Includes Material-linked JobVariables
 */
export const GET = apiHandler(
  async ({ orgId, query }) => {
    const { materialId } = query;
    if (!materialId) throw new ApiError("Material ID required", 400);

    // 1. Fetch available Main Jobs
    const jobs = await prisma.job.findMany({
      where: {
        orgId,
        priceList: { materialId: String(materialId) },
        paymentStatus: { in: ["PAID", "PARTIAL"] },
        layoutItem: null,
        status: "PENDING",
      },
      select: {
        id: true,
        shortRef: true,
        width: true,
        height: true,
        serviceName: true,
      },
    });

    // 2. Fetch available JobVariables (e.g. Lamination roll needed)
    const variables = await prisma.jobVariable.findMany({
      where: {
        orgId,
        materialId: String(materialId),
        job: {
          paymentStatus: { in: ["PAID", "PARTIAL"] },
          status: { not: "CANCELLED" },
        },
        layoutItem: null,
      },
      select: {
        id: true,
        shortRef: true,
        width: true,
        height: true,
        priceList: { select: { displayName: true } },
      },
    });

    // 3. Merge into a single Pool for the Builder
    return [
      ...jobs.map((j) => ({ ...j, type: "JOB" })),
      ...variables.map((v) => ({
        id: v.id,
        shortRef: v.shortRef,
        width: v.width,
        height: v.height,
        serviceName: `ADD-ON: ${v.priceList.displayName}`,
        type: "VARIABLE",
      })),
    ];
  },
  { requireAuth: true, requireOrg: true },
);
