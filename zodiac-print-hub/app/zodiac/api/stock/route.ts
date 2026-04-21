import { apiHandler } from "@lib/server/api/apiHandler";
import { stockService } from "@lib/services/stock.service";

export const GET = apiHandler(async ({ orgId }) => {
  return stockService.list(orgId);
});

export const POST = apiHandler(
  async ({ orgId, body }) => {
    return stockService.restock({
      ...body,
      orgId,
    });
  },
  { requireOrg: true },
);
