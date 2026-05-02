import { apiHandler, ApiError } from "@/lib/apiHandler";
import { prisma } from "@/lib/prisma";

export const POST = apiHandler<{ token: string }>(
  async ({ params }) => {
    const { token } = await params;

    // 1. Resolve Job via public token
    const job = await prisma.job.findUnique({
      where: { approvalToken: token },
      include: { client: { select: { email: true, name: true } } },
    });

    if (!job || !job.proofUrl) {
      throw new ApiError(
        "Job not ready for payment. Proof must be uploaded first.",
        400,
      );
    }

    // 2. Initialize Paystack
    const response = await fetch("https://paystack.co", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: job.client.email || "billing@zodiac-node.com", // Paystack requires an email
        amount: Math.round(job.totalPrice * 100), // GHS to Pesewas
        currency: "GHS",
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/approve/${token}/success`,
        metadata: {
          jobId: job.id,
          shortRef: job.shortRef,
          orgId: job.orgId,
          custom_fields: [
            {
              display_name: "Order Reference",
              variable_name: "order_ref",
              value: job.shortRef,
            },
            {
              display_name: "Service",
              variable_name: "service",
              value: job.serviceName,
            },
          ],
        },
      }),
    });

    const data = await response.json();
    if (!data.status)
      throw new ApiError(data.message || "Gateway Node Offline", 500);

    // Return the URL for the frontend to redirect the user
    return { checkoutUrl: data.data.authorization_url };
  },
  { requireAuth: false },
);
