import { Queue } from "bullmq";
import { redis } from "../redis";

export const outboxQueue = new Queue("outbox", {
  connection: redis,
});
