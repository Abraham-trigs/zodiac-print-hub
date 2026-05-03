"use client";

import { StateCreator } from "zustand";
import type { Client } from "@lib/shared/types/zodiac.types";
import { apiClient } from "@lib/client/api/client";

export interface ClientSlice {
  clientState: {
    clients: Record<string, Client>;
    selectedClientId?: string;
    isLoading: boolean;
    isSubmitting: boolean;
    error?: string | null;
  };

  setClients: (clients: Client[]) => void;
  selectClient: (id?: string) => void;

  loadClients: () => Promise<void>;

  createClient: (payload: Partial<Client>) => Promise<void>;
  updateClient: (id: string, data: Partial<Client>) => Promise<void>;
  removeClient: (id: string) => Promise<void>;

  setLoading: (value: boolean) => void;
  setSubmitting: (value: boolean) => void;
  setError: (error?: string | null) => void;
}

export const createClientSlice: StateCreator<ClientSlice> = (set, get) => ({
  // =========================================================
  // STATE
  // =========================================================
  clientState: {
    clients: {},
    selectedClientId: undefined,
    isLoading: false,
    isSubmitting: false,
    error: null,
  },

  // =========================================================
  // HYDRATION
  // =========================================================
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

  // =========================================================
  // LOAD (SERVER SOURCE OF TRUTH)
  // =========================================================
  loadClients: async () => {
    get().setLoading(true);
    get().setError(null);

    try {
      const res = await apiClient<{ data: Client[] }>("/api/clients", {
        method: "GET",
      });

      const data = res?.data ?? [];

      get().setClients(data);
    } catch (err: any) {
      get().setError(err?.message ?? "Failed to load clients");
    } finally {
      get().setLoading(false);
    }
  },

  // =========================================================
  // CREATE (SERVER AUTHORITATIVE)
  // =========================================================
  createClient: async (payload) => {
    get().setSubmitting(true);
    get().setError(null);

    try {
      const res = await apiClient<{ data: Client }>("/api/clients", {
        method: "POST",
        body: payload,
      });

      const client = res.data;

      set((state) => ({
        clientState: {
          ...state.clientState,
          clients: {
            ...state.clientState.clients,
            [client.id]: client,
          },
        },
      }));
    } catch (err: any) {
      get().setError(err?.message ?? "Failed to create client");
    } finally {
      get().setSubmitting(false);
    }
  },

  // =========================================================
  // UPDATE (OPTIMISTIC + ROLLBACK)
  // =========================================================
  updateClient: async (id, data) => {
    const prev = get().clientState.clients[id];
    if (!prev) return;

    // optimistic
    set((state) => ({
      clientState: {
        ...state.clientState,
        clients: {
          ...state.clientState.clients,
          [id]: { ...prev, ...data },
        },
      },
    }));

    try {
      await apiClient(`/api/clients/${id}`, {
        method: "PATCH",
        body: data,
      });
    } catch (err: any) {
      // rollback
      set((state) => ({
        clientState: {
          ...state.clientState,
          clients: {
            ...state.clientState.clients,
            [id]: prev,
          },
        },
      }));

      get().setError(err?.message ?? "Failed to update client");
    }
  },

  // =========================================================
  // DELETE (SERVER SOURCE OF TRUTH)
  // =========================================================
  removeClient: async (id) => {
    const prev = get().clientState.clients[id];
    if (!prev) return;

    // optimistic remove
    set((state) => {
      const { [id]: _, ...rest } = state.clientState.clients;

      return {
        clientState: {
          ...state.clientState,
          clients: rest,
        },
      };
    });

    try {
      await apiClient(`/api/clients/${id}`, {
        method: "DELETE",
      });
    } catch (err: any) {
      // rollback
      set((state) => ({
        clientState: {
          ...state.clientState,
          clients: {
            ...state.clientState.clients,
            [id]: prev,
          },
        },
      }));

      get().setError(err?.message ?? "Failed to delete client");
    }
  },

  // =========================================================
  // UI STATE
  // =========================================================
  selectClient: (id) =>
    set((state) => ({
      clientState: {
        ...state.clientState,
        selectedClientId: id,
      },
    })),

  setLoading: (value) =>
    set((state) => ({
      clientState: {
        ...state.clientState,
        isLoading: value,
      },
    })),

  setSubmitting: (value) =>
    set((state) => ({
      clientState: {
        ...state.clientState,
        isSubmitting: value,
      },
    })),

  setError: (error) =>
    set((state) => ({
      clientState: {
        ...state.clientState,
        error,
      },
    })),
});
