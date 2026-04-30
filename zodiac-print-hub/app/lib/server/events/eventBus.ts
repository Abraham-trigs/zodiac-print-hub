import { WebSocketServer } from "ws";
import type {
  DomainEventType,
  DomainEventEnvelope,
} from "@/types/zodiac.types";

type EventHandler<T = unknown> = (payload: T) => void;

type SocketMeta = {
  orgId: string | null;
  userId: string | null;
};

function getMeta(client: any): SocketMeta {
  return client.meta ?? { orgId: null, userId: null };
}

class EventBus {
  private wsServer: WebSocketServer | null = null;

  // strongly typed event registry
  private handlers: Partial<Record<DomainEventType, EventHandler[]>> = {};

  init(server: any) {
    this.wsServer = new WebSocketServer({ server });

    this.wsServer.on("connection", (socket) => {
      (socket as any).meta = {
        orgId: null,
        userId: null,
      } satisfies SocketMeta;
    });
  }

  /**
   * SINGLE SOURCE OF TRUTH DISPATCH
   * - used by Outbox processor
   * - used by internal services (optional)
   */
  publish<T>(event: DomainEventEnvelope<T>) {
    // internal handlers (side effects, projections, etc.)
    const handlers = this.handlers[event.type] ?? [];
    for (const fn of handlers) fn(event.payload);

    if (!this.wsServer) return;

    const message = JSON.stringify(event);

    this.wsServer.clients.forEach((client: any) => {
      if (client.readyState !== 1) return;

      const meta = getMeta(client);

      // HARD TENANT ISOLATION
      if (event.orgId && meta.orgId && meta.orgId !== event.orgId) {
        return;
      }

      try {
        client.send(message);
      } catch {
        client.terminate?.();
      }
    });
  }

  /**
   * INTERNAL SUBSCRIPTIONS ONLY
   * (projections, caches, analytics hooks)
   */
  subscribe<T>(type: DomainEventType, handler: EventHandler<T>) {
    if (!this.handlers[type]) {
      this.handlers[type] = [];
    }

    this.handlers[type]!.push(handler as EventHandler);
  }
}

export const eventBus = new EventBus();
