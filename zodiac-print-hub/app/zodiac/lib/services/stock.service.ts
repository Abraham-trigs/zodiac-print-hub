import { StockRepository } from "@/lib/repositories/stock.repository";

export class StockService {
  static async restock(params: {
    orgId: string;
    stockItemId: string;
    quantity: number;
    unitCost: number;
  }) {
    return StockRepository.restock(
      params.orgId,
      params.stockItemId,
      params.quantity,
      params.unitCost,
    );
  }

  static async deduct(params: {
    orgId: string;
    stockItemId: string;
    amount: number;
  }) {
    return StockRepository.deduct(
      params.orgId,
      params.stockItemId,
      params.amount,
    );
  }

  static async list(orgId: string) {
    return StockRepository.list(orgId);
  }

  static async findById(orgId: string, id: string) {
    return StockRepository.findById(orgId, id);
  }
}
