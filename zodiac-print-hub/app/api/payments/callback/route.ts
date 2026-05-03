import { apiHandler } from "@root/server/api/apiHandler";
import { PaymentService } from "@lib/services/payment.service";
import { PaymentMethod } from "@prisma/client";

export const POST = apiHandler(
  async ({ req }) => {
    const data = await req.json();

    // Hubtel Response Mapping
    const isSuccessful =
      data.ResponseCode === "000" || data.Status === "Success";
    if (!isSuccessful) return { received: true };

    const { OrgId, JobId, Amount, ClientReference, TransactionId } =
      data.Data || {};

    // 🔥 V2 CONFIRMATION: Hits our balance-aware service
    await PaymentService.confirmPayment({
      orgId: OrgId,
      jobId: JobId,
      amount: parseFloat(Amount),
      method: PaymentMethod.MOMO,
      reference: ClientReference || TransactionId,
      confirmedBy: "HUBTEL_WEBHOOK",
    });

    return { received: true };
  },
  { requireOrg: false, requireAuth: false },
);
