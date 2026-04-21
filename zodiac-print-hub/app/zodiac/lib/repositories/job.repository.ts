import { prisma } from "@/lib/db/prisma";
import { DbClient } from "@/lib/db/prisma-client";
import { JobStatus, PaymentStatus } from "@prisma/client";

type TxOrDb = DbClient | undefined;

const getDb = (tx?: TxOrDb) => {
  if (tx) return tx;
  return prisma;
};

/**
 * Repository must be transaction-aware.
 * If a tx is passed, ALL operations must use it.
 * No mixed implicit writes.
 */
export class JobRepository {
  static async create(
    data: {
      orgId: string;
      clientId: string;
      serviceId: string;
      serviceName: string;
      quantity: number;
      width?: number;
      height?: number;
      unit?: string;
      totalPrice: number;
      costPrice?: number;
      profitMargin?: number;
      assignedStaffId?: string;
      notes?: string;
    },
    tx?: DbClient,
  ) {
    const db = getDb(tx);
    return db.job.create({ data });
  }

  static async findById(orgId: string, id: string, tx?: DbClient) {
    const db = getDb(tx);

    return db.job.findFirst({
      where: { id, orgId },
      include: {
        client: true,
        assignedStaff: true,
      },
    });
  }

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
      orderBy: { createdAt: "desc" },
      take: params?.take ?? 50,
      skip: params?.skip ?? 0,
    });
  }

  static async updateStatus(
    orgId: string,
    jobId: string,
    status: JobStatus,
    tx?: DbClient,
  ) {
    const db = getDb(tx);

    return db.job.update({
      where: { id: jobId, orgId },
      data: { status },
    });
  }

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
