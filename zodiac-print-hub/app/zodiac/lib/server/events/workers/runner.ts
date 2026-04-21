import { processOutbox } from "@/lib/db/outbox.worker";

let isRunning = false;

const INTERVAL_MS = 2000;

/**
 * Outbox polling worker
 * - prevents overlapping executions
 * - ensures at-least-once delivery safety
 */
async function runOutboxCycle() {
  if (isRunning) return;

  isRunning = true;

  try {
    await processOutbox();
  } catch (err) {
    console.error("[Outbox Worker] failed cycle:", err);
  } finally {
    isRunning = false;
  }
}

// initial run
runOutboxCycle();

// interval loop
setInterval(runOutboxCycle, INTERVAL_MS);

// future upgrade path:
// replace with BullMQ / Redis queue consumer
// keeping processOutbox() as the execution unit
