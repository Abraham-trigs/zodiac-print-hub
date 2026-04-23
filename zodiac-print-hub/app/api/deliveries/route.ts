import { apiHandler } from "@lib/server/api/apiHandler";
import { deliveryService } from "@lib/services/delivery.service";

export const GET = apiHandler(async ({ orgId }) => {
  const data = await deliveryService.list(orgId);

  return { data };
});

export const POST = apiHandler(
  async ({ orgId, body }) => {
    const delivery = await deliveryService.create({
      ...body,
      orgId,
    });

    return { data: delivery };
  },
  {
    requireAuth: true,
    requireOrg: true,
  },
);
