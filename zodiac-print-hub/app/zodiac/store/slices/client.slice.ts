import { StateCreator } from "zustand";
import type { Client } from "@/types/zodiac.types";

export interface ClientSlice {
  // DATA
  clients: Record<string, Client>;
  clientList: Client[];

  selectedClientId?: string;

  // UI STATE
  isLoading: boolean;
  isSubmitting: boolean;
  error?: string | null;

  // ACTIONS
  setClients: (clients: Client[]) => void;
  addClient: (client: Client) => void;
  updateClient: (id: string, data: Partial<Client>) => void;
  removeClient: (id: string) => void;

  selectClient: (id?: string) => void;

  setLoading: (value: boolean) => void;
  setSubmitting: (value: boolean) => void;
  setError: (error?: string | null) => void;

  // DERIVED
  getClientById: (id: string) => Client | undefined;
}

export const createClientSlice: StateCreator<ClientSlice> = (set, get) => ({
  clients: {},
  clientList: [],
  selectedClientId: undefined,

  isLoading: false,
  isSubmitting: false,
  error: null,

  // ─────────────────────────────
  // ACTIONS
  // ─────────────────────────────

  setClients: (clients) =>
    set(() => {
      const map: Record<string, Client> = Object.fromEntries(
        clients.map((c) => [c.id, c]),
      );

      return {
        clients: map,
        clientList: clients,
      };
    }),

  addClient: (client) =>
    set((state) => ({
      clients: {
        ...state.clients,
        [client.id]: client,
      },
      clientList: [client, ...state.clientList],
    })),

  updateClient: (id, data) =>
    set((state) => {
      const existing = state.clients[id];
      if (!existing) return state;

      const updated: Client = {
        ...existing,
        ...data,
      };

      return {
        clients: {
          ...state.clients,
          [id]: updated,
        },
        clientList: state.clientList.map((c) => (c.id === id ? updated : c)),
      };
    }),

  removeClient: (id) =>
    set((state) => {
      const { [id]: _, ...rest } = state.clients;

      return {
        clients: rest,
        clientList: state.clientList.filter((c) => c.id !== id),
        selectedClientId:
          state.selectedClientId === id ? undefined : state.selectedClientId,
      };
    }),

  selectClient: (id) => set({ selectedClientId: id }),

  setLoading: (value) => set({ isLoading: value }),

  setSubmitting: (value) => set({ isSubmitting: value }),

  setError: (error) => set({ error }),

  // DERIVED
  getClientById: (id) => get().clients[id],
});
