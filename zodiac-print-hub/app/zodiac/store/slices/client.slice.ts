import { StateCreator } from "zustand";
import type { Client } from "@/types/zodiac.types";

export interface ClientSlice {
  clients: Record<string, Client>;
  selectedClientId?: string;

  isLoading: boolean;
  isSubmitting: boolean;
  error?: string | null;

  setClients: (clients: Client[]) => void;
  addClient: (client: Client) => void;
  updateClient: (id: string, data: Partial<Client>) => void;
  removeClient: (id: string) => void;

  selectClient: (id?: string) => void;

  setLoading: (value: boolean) => void;
  setSubmitting: (value: boolean) => void;
  setError: (error?: string | null) => void;
}

export const createClientSlice: StateCreator<ClientSlice> = (set, get) => ({
  clients: {},
  selectedClientId: undefined,

  isLoading: false,
  isSubmitting: false,
  error: null,

  setClients: (clients) =>
    set(() => ({
      clients: clients.reduce(
        (acc, c) => {
          acc[c.id] = c;
          return acc;
        },
        {} as Record<string, Client>,
      ),
    })),

  addClient: (client) =>
    set((state) => ({
      clients: {
        ...state.clients,
        [client.id]: client,
      },
    })),

  updateClient: (id, data) =>
    set((state) => {
      const existing = state.clients[id];
      if (!existing) return state;

      return {
        clients: {
          ...state.clients,
          [id]: { ...existing, ...data },
        },
      };
    }),

  removeClient: (id) =>
    set((state) => {
      const { [id]: _, ...rest } = state.clients;

      return {
        clients: rest,
        selectedClientId:
          state.selectedClientId === id ? undefined : state.selectedClientId,
      };
    }),

  selectClient: (id) => set({ selectedClientId: id }),

  setLoading: (value) => set({ isLoading: value }),
  setSubmitting: (value) => set({ isSubmitting: value }),
  setError: (error) => set({ error }),
});
