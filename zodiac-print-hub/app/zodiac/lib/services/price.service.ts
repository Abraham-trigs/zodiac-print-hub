import { prisma } from "@/lib/prisma";
import { UnitOfWork } from "@/lib/db/unitOfWork";
import { Outbox } from "@/lib/db/outbox";

export const priceService = {
  async list(orgId: string) {
    return prisma.priceList.findFirst({
      where: {
        companyId: orgId,
        isActive: true,
      },
      include: {
        items: true,
      },
    });
  },

  async updatePrice(serviceId: string, price: number, orgId: string) {
    return UnitOfWork.run(async (tx) => {
      const existing = await tx.priceItem.findFirst({
        where: {
          id: serviceId,
          priceList: {
            companyId: orgId,
          },
        },
      });

      if (!existing) throw new Error("Price item not found");

      const updated = await tx.priceItem.update({
        where: { id: serviceId },
        data: { unitPrice: price },
      });

      await Outbox.add(tx, {
        type: "price.updated",
        orgId,
        payload: updated,
      });

      return updated;
    });
  },
};
