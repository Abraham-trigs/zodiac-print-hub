import { Worker } from "bullmq";
import { redis } from "../redis";
import { outboxProcessor } from "../processors/outbox.processor";

export const outboxWorker = new Worker(
  "outbox",
  async (job) => {
    return outboxProcessor(job.data);
  },
  { connection: redis },
);
