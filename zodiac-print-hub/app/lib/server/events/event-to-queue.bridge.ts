import { outboxQueue } from "@lib/server/queue/queues/outbox.queue";

export const eventToQueueBridge = {
  async handle(event: any) {
    await outboxQueue.add(event.type, event, {
      attempts: 5,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: true,
    });
  },
};
