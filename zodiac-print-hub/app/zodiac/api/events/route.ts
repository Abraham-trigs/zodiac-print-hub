import { eventBus } from "@lib/server/events/eventBus";

export const dynamic = "force-dynamic";

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      const unsubscribe = eventBus.subscribe(send);

      const interval = setInterval(() => {
        controller.enqueue(encoder.encode(`:\n\n`));
      }, 15000);

      return () => {
        unsubscribe();
        clearInterval(interval);
      };
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
