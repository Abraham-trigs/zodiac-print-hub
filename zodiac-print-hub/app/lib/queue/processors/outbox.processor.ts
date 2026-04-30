// src/workers/outbox-processor.ts
import { prisma } from "../lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function processOutbox() {
  // 1. Fetch PENDING events that are due for an attempt
  const events = await prisma.outboxEvent.findMany({
    where: {
      status: "PENDING",
      nextAttemptAt: { lte: new Date() },
      attempts: { lt: 5 }, // Max 5 retries
    },
    take: 10, // Process in small batches
    orderBy: { createdAt: "asc" },
  });

  for (const event of events) {
    try {
      // 2. Mark as PROCESSING to prevent double-sends
      await prisma.outboxEvent.update({
        where: { id: event.id },
        data: { status: "PROCESSING" },
      });

      // 3. Handle specific event types
      if (event.type === "SEND_MAGIC_LINK") {
        const { email, magicLink, orgSlug } = event.payload as any;

        await resend.emails.send({
          from: process.env.EMAIL_FROM!,
          to: email,
          subject: `Login to ${orgSlug}`,
          html: `<p>You requested a login for ${orgSlug}. Click the link below to continue:</p>
                 <a href="${magicLink}">Login to Dashboard</a>`,
        });
      }

      // 4. Mark as COMPLETED
      await prisma.outboxEvent.update({
        where: { id: event.id },
        data: { status: "COMPLETED", processedAt: new Date() },
      });
    } catch (error: any) {
      // 5. Exponential Backoff on Failure
      const nextAttempt = new Date();
      // Wait longer after each failed attempt: 2^attempts minutes
      const waitMinutes = Math.pow(2, event.attempts + 1);
      nextAttempt.setMinutes(nextAttempt.getMinutes() + waitMinutes);

      await prisma.outboxEvent.update({
        where: { id: event.id },
        data: {
          status: "PENDING",
          attempts: { increment: 1 },
          lastError: error.message,
          nextAttemptAt: nextAttempt,
        },
      });
    }
  }
}
