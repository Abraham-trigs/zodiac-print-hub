export function createRealtimeClient(onMessage: (data: any) => void) {
  let eventSource: EventSource | null = null;
  let retryTimeout: ReturnType<typeof setTimeout> | null = null;
  let closed = false;

  const connect = () => {
    if (closed) return;

    eventSource = new EventSource("/api/events");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch {}
    };

    eventSource.onerror = () => {
      eventSource?.close();
      if (closed) return;

      retryTimeout = setTimeout(connect, 3000);
    };
  };

  connect();

  return () => {
    closed = true;
    eventSource?.close();
    if (retryTimeout) clearTimeout(retryTimeout);
  };
}
