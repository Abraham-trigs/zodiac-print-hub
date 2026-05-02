// src/lib/repositories/job.repository.ts
import { prisma } from "@lib/prisma-client";
import { DbClient } from "@lib/prisma-client";
import { JobStatus, PaymentStatus, ServiceUnit } from "@prisma/client";

type TxOrDb = DbClient | undefined;

const getDb = (tx?: TxOrDb) => {
  if (tx) return tx;
  return prisma;
};

export class JobRepository {
  /**
   * CREATE: Saves the final Job snapshot with 4-char ShortRef
   */
  static async create(
    data: {
      orgId: string;
      clientId: string;
      priceListId: string;
      shortRef: string; // 🚀 REQUIRED: For visual layout boxes
      serviceName: string;
      quantity: number;
      width?: number;
      height?: number;
      unit?: ServiceUnit;
      basePrice: number;
      variableTotal?: number;
      totalPrice: number;
      costPrice?: number;
      profitMargin?: number;
      assignedStaffId?: string;
      notes?: string;
      b2bPushId?: string;
    },
    tx?: DbClient,
  ) {
    const db = getDb(tx);
    return db.job.create({ data });
  }

  /**
   * FIND BY ID: Includes CRM, Logistics, and Layout Tracing
   */
  static async findById(orgId: string, id: string, tx?: DbClient) {
    const db = getDb(tx);

    return db.job.findFirst({
      where: { id, orgId },
      include: {
        client: true,
        assignedStaff: true,
        variables: {
          include: { layoutItem: { include: { layout: true } } }, // 🚀 NEW: Trace Variable Nesting
        },
        deliveries: true,
        b2bPush: true,
        layoutItem: {
          include: { layout: true }, // 🚀 NEW: Trace Main Job Nesting
        },
      },
    });
  }

  /**
   * LIST: Optimized for Dashboard with Layout Awareness
   */
  static async list(
    orgId: string,
    params?: {
      status?: JobStatus;
      paymentStatus?: PaymentStatus;
      take?: number;
      skip?: number;
      shortRef?: string; // 🚀 NEW: Fast search by 4-char ID
    },
    tx?: DbClient,
  ) {
    const db = getDb(tx);

    return db.job.findMany({
      where: {
        orgId,
        ...(params?.status && { status: params.status }),
        ...(params?.paymentStatus && { paymentStatus: params.paymentStatus }),
        ...(params?.shortRef && {
          shortRef: { contains: params.shortRef, mode: "insensitive" },
        }),
      },
      include: {
        client: { select: { name: true, phone: true, type: true } },
        b2bPush: { select: { status: true } },
        layoutItem: { select: { layoutId: true } }, // 🛰️ Visual indicator if job is already nested
      },
      orderBy: { createdAt: "desc" },
      take: params?.take ?? 50,
      skip: params?.skip ?? 0,
    });
  }

  /**
   * UPDATE STATUS
   */
  static async updateStatus(
    orgId: string,
    jobId: string,
    status: JobStatus,
    tx?: DbClient,
  ) {
    const db = getDb(tx);

    return db.job.update({
      where: { id: jobId, orgId },
      data: {
        status,
        ...(status === JobStatus.COMPLETED ? { completedAt: new Date() } : {}),
      },
    });
  }

  /**
   * ASSIGN STAFF
   */
  static async assignStaff(
    orgId: string,
    jobId: string,
    staffId: string,
    tx?: DbClient,
  ) {
    const db = getDb(tx);

    return db.job.update({
      where: { id: jobId, orgId },
      data: { assignedStaffId: staffId },
    });
  }

  /**
   * CONFIRM PAYMENT
   */
  static async confirmPayment(
    orgId: string,
    jobId: string,
    reference?: string,
    tx?: DbClient,
  ) {
    const db = getDb(tx);

    return db.job.update({
      where: { id: jobId, orgId },
      data: {
        paymentStatus: PaymentStatus.PAID,
        isPaid: true,
        paymentRef: reference,
      },
    });
  }

  /**
   * DELETE COMPLETED (Cleanup)
   */
  static async deleteCompleted(orgId: string, tx?: DbClient) {
    const db = getDb(tx);

    return db.job.deleteMany({
      where: {
        orgId,
        status: JobStatus.COMPLETED,
      },
    });
  }
}
