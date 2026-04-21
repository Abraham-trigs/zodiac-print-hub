import { apiHandler } from "@lib/server/api/apiHandler";
import { clientService } from "@lib/services/client.service";

// GET
export const GET = apiHandler(async ({ orgId, query, pagination }) => {
  const result = await clientService.search(orgId, query.query || "", {
    page: pagination.page,
    perPage: pagination.limit,
  });

  return result;
});

// POST
export const POST = apiHandler(
  async ({ orgId, body }) => {
    const client = await clientService.create({
      ...body,
      orgId,
    });

    return client;
  },
  {
    requireOrg: true,
  },
);
