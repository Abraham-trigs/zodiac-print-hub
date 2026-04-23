import { StateCreator } from "zustand";
import type { Client } from "@/types/zodiac.types";

export interface ClientSlice {
  // ✅ Data folder
  clientState: {
    clients: Record<string, Client>;
    selectedClientId?: string;
    isLoading: boolean;
    isSubmitting: boolean;
    error?: string | null;
  };

  // Actions
  setClients: (clients: Client[]) => void;
  addClient: (client: Client) => void;
  updateClient: (id: string, data: Partial<Client>) => void;
  removeClient: (id: string) => void;
  selectClient: (id?: string) => void;
  loadClients: (orgId: string) => Promise<void>;

  // UI Actions
  setLoading: (value: boolean) => void;
  setSubmitting: (value: boolean) => void;
  setError: (error?: string | null) => void;
}

export const createClientSlice: StateCreator<ClientSlice> = (set, get) => ({
  // ✅ Initial State (Nested)
  clientState: {
    clients: {},
    selectedClientId: undefined,
    isLoading: false,
    isSubmitting: false,
    error: null,
  },

  setClients: (clients) =>
    set((state) => ({
      clientState: {
        ...state.clientState,
        clients: clients.reduce(
          (acc, c) => {
            acc[c.id] = c;
            return acc;
          },
          {} as Record<string, Client>,
        ),
      },
    })),

  loadClients: async (orgId: string) => {
    get().setLoading(true);
    try {
      // Adjusted to match your common API structure
      const res = await fetch(`/api/clients?orgId=${orgId}`);
      if (!res.ok) throw new Error("Failed to load clients");

      const json = await res.json();
      const data = json.data ?? [];

      get().setClients(data);
    } catch (err: any) {
      get().setError(err.message);
    } finally {
      get().setLoading(false);
    }
  },

  addClient: (client) =>
    set((state) => ({
      clientState: {
        ...state.clientState,
        clients: {
          ...state.clientState.clients,
          [client.id]: client,
        },
      },
    })),

  updateClient: (id, data) =>
    set((state) => {
      const existing = state.clientState.clients[id];
      if (!existing) return state;

      return {
        clientState: {
          ...state.clientState,
          clients: {
            ...state.clientState.clients,
            [id]: { ...existing, ...data },
          },
        },
      };
    }),

  removeClient: (id) =>
    set((state) => {
      const { [id]: _, ...rest } = state.clientState.clients;

      return {
        clientState: {
          ...state.clientState,
          clients: rest,
          selectedClientId:
            state.clientState.selectedClientId === id
              ? undefined
              : state.clientState.selectedClientId,
        },
      };
    }),

  selectClient: (id) =>
    set((state) => ({
      clientState: { ...state.clientState, selectedClientId: id },
    })),

  setLoading: (value) =>
    set((state) => ({
      clientState: { ...state.clientState, isLoading: value },
    })),

  setSubmitting: (value) =>
    set((state) => ({
      clientState: { ...state.clientState, isSubmitting: value },
    })),

  setError: (error) =>
    set((state) => ({
      clientState: { ...state.clientState, error },
    })),
});
