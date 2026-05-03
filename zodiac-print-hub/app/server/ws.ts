import http from "http";
import { eventBus } from "./events/eventBus";

export function initWebSocket(server: http.Server) {
  eventBus.init(server);
}
