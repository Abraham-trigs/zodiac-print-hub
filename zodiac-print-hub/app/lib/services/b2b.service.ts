// src/store/slices/b2b.slice.ts
import { StateCreator } from "zustand";
import type { B2BPush } from "@/types/zodiac.types";
import { apiClient } from "@root/lib/api/client";

export interface B2BSlice {
  b2bState: {
    items: Record<string, B2BPush>;
    selectedId?: string;
    isLoading: boolean;
    error: string | null;
  };

  // ACTIONS
  loadB2BPushes: (params: { orgId: string }) => Promise<void>;
  setB2B: (items: B2BPush[]) => void;
  updateB2BStatus: (id: string, status: string) => Promise<void>;
  selectB2B: (id?: string) => void;
}

export const createB2BSlice: StateCreator<B2BSlice> = (set, get) => ({
  b2bState: {
    items: {},
    selectedId: undefined,
    isLoading: false,
    error: null,
  },

  setB2B: (items) =>
    set((state) => ({
      b2bState: {
        ...state.b2bState,
        items: items.reduce(
          (acc, b) => {
            acc[b.id] = b;
            return acc;
          },
          {} as Record<string, B2BPush>,
        ),
      },
    })),

  /* =========================================================
     LOAD B2B (API HANDSHAKE)
  ========================================================= */
  loadB2BPushes: async ({ orgId }) => {
    set((s) => ({ b2bState: { ...s.b2bState, isLoading: true } }));
    try {
      const res = await apiClient<{ data: B2BPush[] }>("/api/b2b");
      get().setB2B(res?.data ?? []);
    } catch (err: any) {
      set((s) => ({ b2bState: { ...s.b2bState, error: err.message } }));
    } finally {
      set((s) => ({ b2bState: { ...s.b2bState, isLoading: false } }));
    }
  },

  /* =========================================================
     UPDATE STATUS (e.g. ACCEPT/REJECT)
  ========================================================= */
  updateB2BStatus: async (id, status) => {
    try {
      await apiClient(`/api/b2b/${id}`, {
        method: "PATCH",
        body: { status },
      });

      // Optimistic update
      set((state) => ({
        b2bState: {
          ...state.b2bState,
          items: {
            ...state.b2bState.items,
            [id]: { ...state.b2bState.items[id], status: status as any },
          },
        },
      }));
    } catch (err) {
      console.error("Failed to update B2B status", err);
    }
  },

  selectB2B: (id) =>
    set((state) => ({
      b2bState: { ...state.b2bState, selectedId: id },
    })),
});
