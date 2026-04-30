import { enqueueOutboxEvents } from "./workers/outbox.worker";
import { outboxWorker } from "./workers/outbox.worker";

const POLL_INTERVAL = 2000;

// producer loop (DB → queue)
setInterval(() => {
  enqueueOutboxEvents();
}, POLL_INTERVAL);

// consumer already runs automatically when imported
console.log("BullMQ Outbox system running...");
