import { prisma } from "../../lib/prisma-client";
import { UnitOfWork } from "@lib/db/unitOfWork";
import { Outbox } from "@lib/db/outbox";

export const priceService = {
  async list(orgId: string) {
    // 1. Fixed 'companyId' -> 'orgId'
    // 2. Removed 'include' because PriceList is now the flat table
    const items = await prisma.priceList.findMany({
      where: {
        orgId: orgId,
        isActive: true,
      },
    });

    // We wrap it in an object so the frontend still gets a '.items' array
    return { items };
  },

  async updatePrice(serviceId: string, price: number, orgId: string) {
    return UnitOfWork.run(async (tx) => {
      // 3. Changed 'priceItem' to 'priceList'
      // 4. Changed 'unitPrice' to 'priceGHS'
      const existing = await tx.priceList.findFirst({
        where: {
          id: serviceId,
          orgId: orgId,
        },
      });

      if (!existing) throw new Error("Price item not found");

      const updated = await tx.priceList.update({
        where: { id: serviceId },
        data: { priceGHS: price },
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
