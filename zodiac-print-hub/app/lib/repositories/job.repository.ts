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
   * CREATE: Saves the final Job snapshot
   */
  static async create(
    data: {
      orgId: string;
      clientId: string;
      priceListId: string; // Aligned: Now links to PriceList Master
      serviceName: string; // Aligned: Snapshot of Display Name
      quantity: number;
      width?: number;
      height?: number;
      unit?: ServiceUnit; // Aligned with Enum
      basePrice: number; // Snapshot of Sale Price
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
   * FIND BY ID: Includes CRM and Logistics relations
   */
  static async findById(orgId: string, id: string, tx?: DbClient) {
    const db = getDb(tx);

    return db.job.findFirst({
      where: { id, orgId },
      include: {
        client: true,
        assignedStaff: true,
        variables: true, // Essential for the Job Ticket view
        deliveries: true, // Essential for tracking
        b2bPush: true, // Track B2B source
      },
    });
  }

  /**
   * LIST: Optimized for Dashboard/Table views
   */
  static async list(
    orgId: string,
    params?: {
      status?: JobStatus;
      paymentStatus?: PaymentStatus;
      take?: number;
      skip?: number;
    },
    tx?: DbClient,
  ) {
    const db = getDb(tx);

    return db.job.findMany({
      where: {
        orgId,
        ...(params?.status && { status: params.status }),
        ...(params?.paymentStatus && {
          paymentStatus: params.paymentStatus,
        }),
      },
      include: {
        client: { select: { name: true, phone: true, type: true } }, // Light fetch
        b2bPush: { select: { status: true } },
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
   * CONFIRM PAYMENT: Updates Job financial state
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
