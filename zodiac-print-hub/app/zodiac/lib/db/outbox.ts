import { DbClient } from "@/lib/db/prisma-client";
import type { RealtimeEvent } from "@/types/zodiac.types";

export class Outbox {
  static async add(tx: DbClient, event: RealtimeEvent) {
    return tx.outboxEvent.create({
      data: {
        type: event.type,
        payload: event.payload,
        orgId: event.orgId,
        entityId: event.entityId,
      },
    });
  }
}
