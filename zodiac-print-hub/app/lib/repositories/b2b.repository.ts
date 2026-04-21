import { prisma } from "@lib/db/prisma-client";
import { B2BStatus } from "@types/zodiac.types";

export class B2BRepository {
  static async create(data: {
    orgId: string;
    originalJobId: string;
    clientName: string;
    serviceName: string;
    specs: string;
    deadline: Date;
    suggestedPrice?: number;
  }) {
    return prisma.b2BPush.create({ data });
  }

  static async list(orgId: string) {
    return prisma.b2BPush.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async updateStatus(id: string, status: B2BStatus) {
    return prisma.b2BPush.update({
      where: { id },
      data: { status },
    });
  }
}
