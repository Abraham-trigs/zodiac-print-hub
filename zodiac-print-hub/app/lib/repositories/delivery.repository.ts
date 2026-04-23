import { prisma } from "@lib/prisma-client";
import { DeliveryType, DeliveryStatus } from "@/types/zodiac.types";

export class DeliveryRepository {
  static create(
    data: {
      orgId: string;
      jobId: string;
      clientId: string;
      type: DeliveryType;
      address?: string;
    },
    tx?: any,
  ) {
    const db = tx ?? prisma;

    return db.delivery.create({
      data: {
        ...data,
        status: "PENDING",
      },
    });
  }

  static list(orgId: string, tx?: any) {
    const db = tx ?? prisma;

    return db.delivery.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
    });
  }

  static updateStatus(id: string, status: DeliveryStatus, tx?: any) {
    const db = tx ?? prisma;

    return db.delivery.update({
      where: { id },
      data: { status },
    });
  }
}
