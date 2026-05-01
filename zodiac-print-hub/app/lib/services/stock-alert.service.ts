// src/lib/services/stock-alert.service.ts
import { Outbox } from "../db/outbox";

export class StockAlertService {
  /**
   * CHECK AND TRIGGER
   * Logic: If current balance <= threshold, fire a high-priority event.
   */
  static async checkThreshold(params: {
    orgId: string;
    stockItemId: string;
    currentBalance: number;
    threshold: number;
    materialName: string;
    tx: any;
  }) {
    if (params.currentBalance <= params.threshold) {
      await Outbox.add(params.tx, {
        type: "inventory.low_stock_alert",
        orgId: params.orgId,
        payload: {
          stockItemId: params.stockItemId,
          materialName: params.materialName,
          remaining: params.currentBalance,
          threshold: params.threshold,
          priority: params.currentBalance <= 0 ? "CRITICAL" : "WARNING",
        },
      });
    }
  }
}
