import { prisma } from "@lib/db/prisma-client";
import { eventBus } from "@lib/server/events/eventBus";

export async function processOutbox() {
  // 1. Claim events safely
  await prisma.outboxEvent.updateMany({
    where: { status: "PENDING" },
    data: { status: "PROCESSING" },
  });

  // 2. Fetch batch
  const events = await prisma.outboxEvent.findMany({
    where: { status: "PROCESSING" },
    take: 50,
    orderBy: { createdAt: "asc" },
  });

  for (const event of events) {
    try {
      eventBus.publish(event.type, event.payload, {
        orgId: event.orgId,
        entityId: event.entityId,
        version: event.version,
      });

      await prisma.outboxEvent.update({
        where: { id: event.id },
        data: { status: "SENT" },
      });
    } catch (err) {
      await prisma.outboxEvent.update({
        where: { id: event.id },
        data: {
          status: "FAILED",
          error: err instanceof Error ? err.message : "Unknown error",
        },
      });
    }
  }
}
