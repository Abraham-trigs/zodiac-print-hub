// src/store/slices/price.slice.ts
import { StateCreator } from "zustand";
import { apiClient } from "@root/lib/api/client";
import { PriceList, Material, Service } from "@prisma/client";

/* =========================================================
   TYPES (ALIGNED WITH PRODUCTION RECIPE)
========================================================= */

/**
 * PriceListFull represents the "Golden Record" from the backend.
 * It includes the underlying Material (for stock/calc) and Service (for labor).
 */
export type PriceListFull = PriceList & {
  material?: Material | null;
  service?: Service | null;
};

export interface PriceSlice {
  priceState: {
    prices: Record<string, PriceListFull>;
    isLoading: boolean;
    isSubmitting: boolean;
    error?: string | null;
  };

  setPrices: (data: PriceListFull[]) => void;

  // READ: Fetches the menu with its recipes
  loadPrices: (query?: {
    category?: string;
    isActive?: boolean;
  }) => Promise<void>;

  loadPriceById: (id: string) => Promise<PriceListFull | null>;

  // CREATE: Pushes a new Junction (Material/Service + PriceList)
  createPrice: (payload: any) => Promise<void>;

  // UPDATE: Patches the pricing or the recipe
  updatePrice: (id: string, patch: any) => Promise<void>;

  // DELETE: Standard cleanup
  deletePrice: (id: string) => Promise<void>;

  // UI HELPERS
  setError: (error?: string | null) => void;
}

/* =========================================================
   SLICE IMPLEMENTATION
========================================================= */

export const createPriceSlice: StateCreator<PriceSlice> = (set, get) => ({
  priceState: {
    prices: {},
    isLoading: false,
    isSubmitting: false,
    error: null,
  },

  // Reducer to map array to a fast-lookup dictionary
  setPrices: (data) =>
    set((state) => ({
      priceState: {
        ...state.priceState,
        prices: data.reduce(
          (acc, p) => {
            acc[p.id] = p;
            return acc;
          },
          {} as Record<string, PriceListFull>,
        ),
      },
    })),

  setError: (error) =>
    set((state) => ({
      priceState: { ...state.priceState, error },
    })),

  /* --- READ --- */
  loadPrices: async (query) => {
    set((s) => ({
      priceState: { ...s.priceState, isLoading: true, error: null },
    }));

    try {
      const res = await apiClient<{ data: PriceListFull[] }>("/api/prices", {
        query,
      });

      get().setPrices(res?.data ?? []);
    } catch (e: any) {
      get().setError(e?.message ?? "Failed to load prices");
    } finally {
      set((s) => ({
        priceState: { ...s.priceState, isLoading: false },
      }));
    }
  },

  loadPriceById: async (id) => {
    const res = await apiClient<{ data: PriceListFull }>(`/api/prices/${id}`);
    return res?.data ?? null;
  },

  /* --- CREATE --- */
  createPrice: async (payload) => {
    set((s) => ({
      priceState: { ...s.priceState, isSubmitting: true, error: null },
    }));

    try {
      const res = await apiClient<{ data: PriceListFull }>("/api/prices", {
        method: "POST",
        body: payload,
      });

      const created = res?.data;

      if (created) {
        set((state) => ({
          priceState: {
            ...state.priceState,
            prices: { ...state.priceState.prices, [created.id]: created },
          },
        }));

        // 🔥 SEAMLESS INVENTORY SYNC:
        // When a new Price item is created that links to a Material,
        // we force an inventory refresh so the stock UI is immediately accurate.
        if (created.materialId) {
          const store = get() as any;
          if (store.loadInventory) await store.loadInventory();
        }
      }
    } catch (e: any) {
      get().setError(e?.message ?? "Failed to create price");
    } finally {
      set((s) => ({
        priceState: { ...s.priceState, isSubmitting: false },
      }));
    }
  },

  /* --- UPDATE --- */
  updatePrice: async (id, patch) => {
    const prev = get().priceState.prices[id];
    if (!prev) return;

    // Optimistic Update for snappy user experience
    set((state) => ({
      priceState: {
        ...state.priceState,
        prices: {
          ...state.priceState.prices,
          [id]: { ...prev, ...patch },
        },
      },
    }));

    try {
      const res = await apiClient<{ data: PriceListFull }>(
        `/api/prices/${id}`,
        {
          method: "PATCH",
          body: patch,
        },
      );

      // Refresh inventory if the underlying material link changed
      if (patch.materialId || prev.materialId) {
        const store = get() as any;
        if (store.loadInventory) await store.loadInventory();
      }
    } catch (e: any) {
      get().setError(e?.message ?? "Failed to update price");
      // Rollback on server failure
      set((state) => ({
        priceState: {
          ...state.priceState,
          prices: { ...state.priceState.prices, [id]: prev },
        },
      }));
    }
  },

  /* --- DELETE --- */
  deletePrice: async (id) => {
    const prev = get().priceState.prices[id];
    if (!prev) return;

    set((state) => {
      const { [id]: _, ...rest } = state.priceState.prices;
      return { priceState: { ...state.priceState, prices: rest } };
    });

    try {
      await apiClient(`/api/prices/${id}`, { method: "DELETE" });
    } catch (e: any) {
      get().setError(e?.message ?? "Failed to delete price");
      set((state) => ({
        priceState: {
          ...state.priceState,
          prices: { ...state.priceState.prices, [id]: prev },
        },
      }));
    }
  },
});
