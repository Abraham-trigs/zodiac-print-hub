import { DbClient } from "@lib/prisma-client";

export class Outbox {
  /**
   * Persists an event to the Outbox table within a transaction.
   * This ensures that if the database change fails, the event is never sent.
   */
  static async put(tx: DbClient, type: string, orgId: string, payload: any) {
    return await tx.outboxEvent.create({
      data: {
        type,
        orgId,
        payload,
        status: "PENDING",
        attempts: 0,
      },
    });
  }
}
