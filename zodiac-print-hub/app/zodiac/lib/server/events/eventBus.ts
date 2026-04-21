import { WebSocketServer } from "ws";

type EventHandler = (payload: any) => void;

export interface RealtimeEnvelope<T = any> {
  type: string;
  payload: T;
  entityId?: string;
  version?: number;
}

type SocketMeta = {
  orgId: string | null;
  userId: string | null;
};

class EventBus {
  private wsServer: WebSocketServer | null = null;
  private handlers: Record<string, EventHandler[]> = {};

  init(server: any) {
    this.wsServer = new WebSocketServer({ server });

    this.wsServer.on("connection", (socket) => {
      // attach metadata per connection (to be filled after auth handshake)
      (socket as any).meta = {
        orgId: null,
        userId: null,
      } satisfies SocketMeta;

      socket.on("message", () => {
        // reserved for client → server events
      });
    });
  }

  publish(
    type: string,
    payload: any,
    meta?: {
      entityId?: string;
      version?: number;
      orgId?: string;
    },
  ) {
    // 1. internal listeners
    (this.handlers[type] || []).forEach((fn) => fn(payload));

    // 2. WS broadcast
    if (!this.wsServer) return;

    const message: RealtimeEnvelope = {
      type,
      payload,
      entityId: meta?.entityId,
      version: meta?.version,
    };

    this.wsServer.clients.forEach((client: any) => {
      if (client.readyState !== 1) return;

      // tenant isolation (safe default)
      if (
        meta?.orgId &&
        client.meta?.orgId &&
        client.meta.orgId !== meta.orgId
      ) {
        return;
      }

      try {
        client.send(JSON.stringify(message));
      } catch {
        client.terminate?.();
      }
    });
  }

  subscribe(type: string, handler: EventHandler) {
    if (!this.handlers[type]) {
      this.handlers[type] = [];
    }
    this.handlers[type].push(handler);
  }
}

export const eventBus = new EventBus();
