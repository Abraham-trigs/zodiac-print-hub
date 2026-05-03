import { apiHandler } from "@lib/server/api/apiHandler";
import { clientService } from "@lib/server/services/client.service";

// GET
export const GET = apiHandler(async ({ orgId, query, pagination }) => {
  const result = await clientService.search(orgId, query.query || "", {
    page: pagination.page,
    perPage: pagination.limit,
  });

  // ✅ FIX: Return only the data array.
  // apiHandler will wrap this as { data: [...] }
  // This matches how your Frontend loadClients expects the data.
  return result.data;
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
    requireAuth: true,
    requireOrg: true,
  },
);
