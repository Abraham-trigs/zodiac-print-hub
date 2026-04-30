import { Worker } from "bullmq";
import { redis } from "../redis";
import { stockEventHandler } from "@lib/events/handlers/stock.handler";

export const outboxWorker = new Worker(
  "outbox",
  async (job) => {
    const event = job.data;

    if (
      event.type === "stock.movement_created" ||
      event.type === "stock.item_registered"
    ) {
      await stockEventHandler(event);
    }
  },
  { connection: redis },
);
