import { prisma } from "@/lib/db/prisma";
import { ClientType } from "@/types/zodiac.types";

type UpdateClientInput = Partial<{
  name: string;
  type: ClientType;
  phone: string;
  email: string;
  companyName: string;
  location: string;
  profilePictureUrl: string;
  notes: string;

  lastStaffId: string;
  mostPrintedServiceId: string;
  lastJobDate: string;
  isNew: boolean;
}>;

export class ClientRepository {
  static async create(data: {
    orgId: string;
    name: string;
    type: ClientType;
    phone: string;
    email?: string;
  }) {
    return prisma.client.create({
      data: {
        ...data,
        isNew: true,
      },
    });
  }

  static async list(orgId: string) {
    return prisma.client.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findById(orgId: string, id: string) {
    return prisma.client.findFirst({
      where: { id, orgId },
    });
  }

  static async update(orgId: string, id: string, data: UpdateClientInput) {
    return prisma.client.update({
      where: {
        id,
        orgId, // IMPORTANT: enforce tenant safety (requires composite or unique constraint)
      },
      data,
    });
  }
}
