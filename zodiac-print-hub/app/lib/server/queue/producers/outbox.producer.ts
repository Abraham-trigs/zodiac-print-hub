import type { prisma } from "@lib/prisma-client";
import { outboxQueue } from "../queues/outbox.queue";

export async function enqueueOutboxEvents() {
  const events = await prisma.outboxEvent.findMany({
    where: { status: "PENDING" },
    take: 50,
    orderBy: { createdAt: "asc" },
  });

  if (!events.length) return;

  await prisma.outboxEvent.updateMany({
    where: { id: { in: events.map((e) => e.id) } },
    data: { status: "PROCESSING" },
  });

  await outboxQueue.addBulk(
    events.map((event) => ({
      name: event.type,
      data: event,
      opts: {
        attempts: 5,
        backoff: { type: "exponential", delay: 2000 },
      },
    })),
  );
}
