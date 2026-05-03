// src/workers/outbox-processor.ts
import type { prisma } from "@lib/prisma-client";
import { Resend } from "resend";
import { eventBus } from "@events/eventBus"; // 🚀 Connect to WebSocket

const resend = new Resend(process.env.RESEND_API_KEY);

export async function outboxProcessor(event: any) {
  try {
    // 1. BROADCAST TO UI (The Real-time Handshake)
    // Every event going through the outbox should hit the WebSocket
    // so the Frontend can "apply" the changes optimistically or via sync.
    eventBus.publish(event.orgId, event.type, event.payload);

    // 2. HANDLE SIDE EFFECTS (Emails, External APIs)
    switch (event.type) {
      case "SEND_MAGIC_LINK": {
        const { email, magicLink, orgSlug } = event.payload;
        await resend.emails.send({
          from: process.env.EMAIL_FROM!,
          to: email,
          subject: `Login to ${orgSlug}`,
          html: `<p>Click the link to login: <a href="${magicLink}">Login</a></p>`,
        });
        break;
      }

      case "job.created": {
        // Logic: Send "Order Received" SMS or Email to Client
        break;
      }

      case "payment.confirmed": {
        // Logic: Send Receipt PDF to Client
        break;
      }

      default:
        // Internal data-only events like 'staff.assigned' only need the broadcast above
        break;
    }

    // 3. SUCCESS: Mark as COMPLETED in DB
    await prisma.outboxEvent.update({
      where: { id: event.id },
      data: { status: "COMPLETED", processedAt: new Date() },
    });
  } catch (error: any) {
    // 4. FAILURE: Logic for retries (BullMQ handles the queue retry,
    // but we log the error in the DB for the Admin Dashboard)
    await prisma.outboxEvent.update({
      where: { id: event.id },
      data: {
        status: "PENDING",
        attempts: { increment: 1 },
        lastError: error.message,
        nextAttemptAt: new Date(
          Date.now() + Math.pow(2, event.attempts + 1) * 60000,
        ),
      },
    });
    throw error; // Re-throw so BullMQ knows it failed
  }
}
