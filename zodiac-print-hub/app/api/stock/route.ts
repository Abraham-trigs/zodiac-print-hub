import { apiHandler } from "@lib/server/api/apiHandler";
import { stockService } from "@lib/services/stock.service";

export const GET = apiHandler(
  async ({ orgId }) => {
    return stockService.list(orgId);
  },
  {
    requireAuth: true,
    requireOrg: true,
  },
);

export const POST = apiHandler(
  async ({ orgId, body }) => {
    return stockService.restock({
      ...body,
      orgId,
    });
  },
  {
    requireAuth: true,
    requireOrg: true,
  },
);
