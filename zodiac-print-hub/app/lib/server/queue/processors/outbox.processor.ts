import { prisma } from "@/lib/prisma-client"; // 🚀 FIX: Must be the live instance, not just a type
import { Resend } from "resend";
import { eventBus } from "@/lib/server/events/eventBus"; // 🚀 Aligned with root paths

const resend = new Resend(process.env.RESEND_API_KEY);

export async function outboxProcessor(event: any) {
  try {
    // 1. BROADCAST TO UI (The Real-time Handshake)
    // Ensures the frontend "Supply Node" or "Login Screen" reacts instantly
    if (eventBus && event.orgId) {
      eventBus.publish(event.orgId, event.type, event.payload);
    }

    // 2. HANDLE SIDE EFFECTS (Emails, External APIs)
    switch (event.type) {
      case "SEND_MAGIC_LINK": {
        const { email, token, orgSlug } = event.payload;
        // Construct the link here or use the one from the payload
        const magicLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?token=${token}&slug=${orgSlug}`;

        await resend.emails.send({
          from:
            process.env.EMAIL_FROM || "Zodiac Node <auth@zodiac.industrial>",
          to: email,
          subject: `Access Node: ${orgSlug}`,
          html: `<p>Click the link to login: <a href="${magicLink}">Authorize Session</a></p>`,
        });
        break;
      }

      case "job.created": {
        // Future: SMS or Client Email triggers
        break;
      }

      default:
        // Internal events only need the broadcast above
        break;
    }

    // 3. SUCCESS: Mark as COMPLETED in DB
    await prisma.outboxEvent.update({
      where: { id: event.id },
      data: {
        status: "COMPLETED", // 🚀 Matches your OutboxStatus enum
        processedAt: new Date(),
      },
    });
  } catch (error: any) {
    console.error(`[OUTBOX ERROR] Failed to process ${event.type}:`, error);

    // 4. FAILURE: Update DB so the Admin Dashboard can track the leak
    await prisma.outboxEvent.update({
      where: { id: event.id },
      data: {
        status: "FAILED", // Mark as failed so worker can retry based on backoff
        attempts: { increment: 1 },
        lastError: error.message,
        // Exponential backoff: next attempt in (2^attempts) minutes
        nextAttemptAt: new Date(
          Date.now() + Math.pow(2, (event.attempts || 0) + 1) * 60000,
        ),
      },
    });

    throw error; // Re-throw for BullMQ/Queue manager retry logic
  }
}
