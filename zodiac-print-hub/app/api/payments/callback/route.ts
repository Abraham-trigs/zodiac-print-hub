import { apiHandler } from "@lib/server/api/apiHandler";
import { PaymentService } from "@lib/services/payment.service";

export const POST = apiHandler(
  async ({ req }) => {
    const data = await req.json();

    const isSuccessful =
      data.ResponseCode === "000" || data.Data?.Status === "Success";

    if (!isSuccessful) {
      return { received: true };
    }

    const reference = data.Data?.ClientReference;

    await PaymentService.handleWebhookConfirmation({
      orgId: data.Data?.OrgId,
      jobId: data.Data?.JobId,
      amount: data.Data?.Amount,
      reference,
      providerEventId: data.Data?.TransactionId,
    });

    return { received: true };
  },
  {
    requireOrg: false,
    requireAuth: false,
  },
);
