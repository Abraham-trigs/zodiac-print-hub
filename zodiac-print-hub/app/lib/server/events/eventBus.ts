import { WebSocketServer } from "ws";
import type {
  DomainEventType,
  DomainEventEnvelope,
} from "@/lib/shared/types/zodiac.types"; // 🚀 Aligned path

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
  private handlers: Partial<Record<DomainEventType, EventHandler[]>> = {};

  init(server: any) {
    // Prevent double initialization in HMR (Next.js dev mode)
    if (this.wsServer) return;

    this.wsServer = new WebSocketServer({ server });

    this.wsServer.on("connection", (socket) => {
      (socket as any).meta = {
        orgId: null,
        userId: null,
      } satisfies SocketMeta;
    });
  }

  /**
   * 🛰️ PUBLISH
   * Handles both full envelopes and flat arguments from the Outbox Worker.
   */
  publish<T>(
    eventOrOrgId: DomainEventEnvelope<T> | string,
    type?: DomainEventType,
    payload?: T,
  ) {
    // 1. Normalize Input (Handshake between Envelope and Flat args)
    let event: DomainEventEnvelope<T>;

    if (typeof eventOrOrgId === "string" && type && payload !== undefined) {
      event = {
        orgId: eventOrOrgId,
        type,
        payload,
        timestamp: new Date().toISOString() as any,
      };
    } else {
      event = eventOrOrgId as DomainEventEnvelope<T>;
    }

    // 2. Internal handlers (Side effects / Projections)
    const handlers = this.handlers[event.type] ?? [];
    for (const fn of handlers) fn(event.payload);

    // 3. WebSocket Broadcast
    if (!this.wsServer) return;

    const message = JSON.stringify(event);

    this.wsServer.clients.forEach((client: any) => {
      if (client.readyState !== 1) return;

      const meta = getMeta(client);

      // 🛡️ TENANT ISOLATION GUARD
      // Only send if the event has no Org (Global) or matches the client's Org
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

  subscribe<T>(type: DomainEventType, handler: EventHandler<T>) {
    if (!this.handlers[type]) this.handlers[type] = [];
    this.handlers[type]!.push(handler as EventHandler);
  }
}

export const eventBus = new EventBus();
