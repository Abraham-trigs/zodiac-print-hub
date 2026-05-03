import { eventToQueueBridge } from "./event-to-queue.bridge";
import { eventBus } from "@root/server/events/eventBus";

export class EventDispatcher {
  constructor(
    private bus: typeof eventBus,
    private handlers: Record<string, any> = {},
  ) {}

  async dispatch(event: any) {
    // 1. realtime (optional immediate feedback)
    this.bus.publish(event);

    // 2. queue (reliability layer) ✅ THIS WAS MISSING
    await eventToQueueBridge.handle(event);

    // 3. sync handlers (optional side effects)
    const handler = this.handlers[event.type];
    if (handler) await handler(event);
  }
}
