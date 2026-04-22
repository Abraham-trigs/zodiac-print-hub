import { prisma } from "../../lib/prisma-client";
import { UnitOfWork } from "@lib/db/unitOfWork";
import { Outbox } from "@lib/db/outbox";

export const priceService = {
  async list(orgId: string) {
    const items = await prisma.priceList.findMany({
      where: {
        orgId,
        isActive: true,
      },
    });

    return { items };
  },

  async updatePrice(priceListId: string, priceGHS: number, orgId: string) {
    return UnitOfWork.run(async (tx) => {
      const existing = await tx.priceList.findFirst({
        where: {
          id: priceListId,
          orgId,
        },
      });

      if (!existing) throw new Error("Price item not found");

      const updated = await tx.priceList.update({
        where: { id: priceListId },
        data: { priceGHS },
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
