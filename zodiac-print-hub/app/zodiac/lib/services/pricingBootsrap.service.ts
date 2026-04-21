import { StockRepository } from "@/lib/repositories/stock.repository";
import { UnitOfWork } from "@/lib/db/unitOfWork";
import { Outbox } from "@/lib/db/outbox";

export class StockService {
  static async restock(params: {
    orgId: string;
    stockItemId: string;
    quantity: number;
    unitCost: number;
  }) {
    return UnitOfWork.run(async (tx) => {
      const res = await StockRepository.restock(
        params.orgId,
        params.stockItemId,
        params.quantity,
        params.unitCost,
        tx,
      );

      await Outbox.add(tx, {
        type: "stock.restocked",
        orgId: params.orgId,
        payload: res,
      });

      return res;
    });
  }

  static async deduct(params: {
    orgId: string;
    stockItemId: string;
    amount: number;
  }) {
    return UnitOfWork.run(async (tx) => {
      const res = await StockRepository.deduct(
        params.orgId,
        params.stockItemId,
        params.amount,
        tx,
      );

      await Outbox.add(tx, {
        type: "stock.updated",
        orgId: params.orgId,
        payload: res,
      });

      return res;
    });
  }

  static async list(orgId: string) {
    return StockRepository.list(orgId);
  }

  static async findById(orgId: string, id: string) {
    return StockRepository.findById(orgId, id);
  }
}
