import { UnitOfWork } from "@/lib/db/unitOfWork";
import { Outbox } from "@/lib/db/outbox";

function isNewer(a?: string, b: string) {
  if (!a) return true;
  return new Date(b) > new Date(a);
}

export class PaymentService {
  static async confirmPayment(params: {
    orgId: string;
    jobId: string;
    amount: number;
    method: any;
    reference?: string;
    confirmedBy?: string;
  }) {
    const { orgId, jobId, amount, method, reference, confirmedBy } = params;

    return UnitOfWork.run(async (tx) => {
      const now = new Date().toISOString();

      const job = await tx.job.findUnique({
        where: { id: jobId },
      });

      if (!job) throw new Error("Job not found");

      // IDEMPOTENCY GUARD
      if (job.paymentStatus === "PAID") return job;

      const payment = await tx.payment.create({
        data: {
          orgId,
          jobId,
          amount,
          method,
          reference,
          confirmedBy,
        },
      });

      const updatedJob = await tx.job.update({
        where: { id: jobId },
        data: {
          isPaid: true,
          paymentStatus: "PAID",
          paymentRef: reference,
        },
      });

      // CLIENT PROJECTION (SAFE MERGE)
      const client = await tx.client.findUnique({
        where: { id: job.clientId },
        select: { lastJobDate: true },
      });

      await tx.client.update({
        where: { id: job.clientId },
        data: {
          totalSpend: {
            increment: amount,
          },
          lastJobDate: isNewer(client?.lastJobDate, now)
            ? now
            : client?.lastJobDate,
        },
      });

      await Outbox.add(tx, {
        type: "payment.confirmed",
        orgId,
        payload: {
          paymentId: payment.id,
          jobId: job.id,
          amount,
        },
      });

      return updatedJob;
    });
  }
}
