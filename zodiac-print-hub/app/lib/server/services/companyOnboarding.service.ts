import type { prisma } from "@/lib/prisma";
import { UnitOfWork } from "@/lib/db/unitOfWork";
import { Outbox } from "@/lib/db/outbox";

export class CompanyOnboardingService {
  async createCompany(input: {
    orgId: string;
    name: string;
    logoUrl?: string;
  }) {
    return UnitOfWork.run(async (tx) => {
      const version = Date.now();

      const company = await tx.company.create({
        data: {
          name: input.name,
          logoUrl: input.logoUrl,
          orgId: input.orgId,
          isActive: false,
        },
      });

      await Outbox.add(tx, {
        type: "company.created",
        orgId: input.orgId,
        entityId: company.id,
        version,
        payload: company,
      });

      return company;
    });
  }

  async setLocation(input: {
    orgId: string;
    companyId: string;
    digitalAddress?: string;
    locationUrl?: string;
  }) {
    return UnitOfWork.run(async (tx) => {
      const version = Date.now();

      const company = await tx.company.update({
        where: {
          id: input.companyId,
          orgId: input.orgId,
        },
        data: {
          digitalAddress: input.digitalAddress,
          locationUrl: input.locationUrl,
        },
      });

      await Outbox.add(tx, {
        type: "company.location.updated",
        orgId: input.orgId,
        entityId: company.id,
        version,
        payload: {
          id: company.id,
          digitalAddress: company.digitalAddress,
          locationUrl: company.locationUrl,
        },
      });

      return company;
    });
  }

  async activateCompany(input: { orgId: string; companyId: string }) {
    return UnitOfWork.run(async (tx) => {
      const version = Date.now();

      const company = await tx.company.update({
        where: {
          id: input.companyId,
          orgId: input.orgId,
        },
        data: {
          isActive: true,
          activatedAt: new Date().toISOString(),
        },
      });

      await Outbox.add(tx, {
        type: "company.activated",
        orgId: input.orgId,
        entityId: company.id,
        version,
        payload: {
          id: company.id,
          isActive: company.isActive,
        },
      });

      return company;
    });
  }
}
