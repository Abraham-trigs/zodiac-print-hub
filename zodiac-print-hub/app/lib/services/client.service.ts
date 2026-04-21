import { ClientRepository } from "@/lib/repositories/client.repository";

type ClientType = "PRIVATE" | "COMPANY";

type UpdateClientInput = Partial<{
  name: string;
  type: ClientType;
  phone: string;
  email: string;
  companyName: string;
  location: string;
  profilePictureUrl: string;
  notes: string;

  lastStaffId: string;
  mostPrintedServiceId: string;
  lastJobDate: string;
}>;

export const clientService = {
  async create(data: {
    orgId: string;
    name: string;
    type: ClientType;
    phone: string;
    email?: string;
  }) {
    return ClientRepository.create(data);
  },

  async search(
    orgId: string,
    query: string,
    pagination: { page: number; perPage: number },
  ) {
    const all = await ClientRepository.list(orgId);

    const q = query.toLowerCase().trim();

    const filtered = q
      ? all.filter((c) => c.name.toLowerCase().includes(q))
      : all;

    const start = (pagination.page - 1) * pagination.perPage;

    return {
      data: filtered.slice(start, start + pagination.perPage),
      total: filtered.length,
      page: pagination.page,
      perPage: pagination.perPage,
    };
  },

  async findById(orgId: string, id: string) {
    return ClientRepository.findById(orgId, id);
  },

  async update(orgId: string, id: string, data: UpdateClientInput) {
    return ClientRepository.update(orgId, id, data);
  },
};
