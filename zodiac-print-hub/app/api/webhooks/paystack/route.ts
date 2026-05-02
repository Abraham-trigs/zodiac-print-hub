import { prisma } from "@/lib/prisma";
import { UnitOfWork } from "@/lib/db/unitOfWork";
import { Outbox } from "@/lib/db/outbox";
import crypto from "crypto";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  // 🛡️ SECURITY: Verify the event actually came from Paystack
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
    .update(body)
    .digest("hex");

  if (hash !== signature)
    return new Response("Invalid Signature", { status: 401 });

  const event = JSON.parse(body);

  if (event.event === "charge.success") {
    const { jobId, orgId, shortRef } = event.data.metadata;
    const amount = event.data.amount / 100; // Pesewas back to GHS

    await UnitOfWork.run(async (tx) => {
      // 1. Log the Payment in the Financial Ledger
      await tx.payment.create({
        data: {
          orgId,
          jobId,
          amount,
          method: "MOMO_ONLINE",
          reference: event.data.reference,
          note: `Paystack Online: Ref ${event.data.reference}`,
        },
      });

      // 2. Automate Production Flow
      // We move the job from DRAFT/PENDING to production-ready
      await tx.job.update({
        where: { id: jobId },
        data: {
          status: "PENDING", // Visible in the shop's main queue
          // Record that it was fully authorized by client
          approvedAt: new Date(),
        },
      });

      // 3. Notify the Workstation (Dashboard Toast)
      await Outbox.add(tx, {
        type: "payment.verified",
        orgId,
        payload: {
          jobId,
          shortRef,
          amount,
          message: `💰 Payment of ₵${amount} verified for Job ${shortRef}`,
        },
      });
    });
  }

  return new Response("Captured", { status: 200 });
}
