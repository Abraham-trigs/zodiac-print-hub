import { StateCreator } from "zustand";
import { PriceItem } from "@/types/zodiac.types";
import { apiClient } from "@root/lib/api/client";
import type {
  CreatePriceInput,
  UpdatePriceInput,
} from "@lib/schema/price.schema";

type PricePatch = Partial<
  Pick<PriceItem, "priceGHS" | "name" | "unit" | "category">
>;

export interface PriceSlice {
  priceState: {
    prices: Record<string, PriceItem>;
    isLoading: boolean;
    isSubmitting: boolean;
    error?: string | null;
  };

  setPrices: (data: PriceItem[]) => void;

  // READ
  loadPrices: (query?: {
    search?: string;
    category?: string;
    unit?: string;
  }) => Promise<void>;

  loadPriceById: (id: string) => Promise<PriceItem | null>;

  // CREATE
  createPrice: (payload: CreatePriceInput) => Promise<void>;

  // UPDATE
  updatePrice: (id: string, patch: UpdatePriceInput) => Promise<void>;

  // DELETE
  deletePrice: (id: string) => Promise<void>;

  // UI
  setError: (error?: string | null) => void;
}

export const createPriceSlice: StateCreator<PriceSlice> = (set, get) => ({
  priceState: {
    prices: {},
    isLoading: false,
    isSubmitting: false,
    error: null,
  },

  setPrices: (data) =>
    set((state) => ({
      priceState: {
        ...state.priceState,
        prices: data.reduce(
          (acc, p) => {
            acc[p.id] = p;
            return acc;
          },
          {} as Record<string, PriceItem>,
        ),
      },
    })),

  /* =========================================================
     ERROR HANDLING
  ========================================================= */

  setError: (error) =>
    set((state) => ({
      priceState: { ...state.priceState, error },
    })),

  /* =========================================================
     READ
  ========================================================= */

  loadPrices: async (query) => {
    set((s) => ({
      priceState: { ...s.priceState, isLoading: true, error: null },
    }));

    try {
      const res = await apiClient<{ data: { items: PriceItem[] } }>(
        "/api/prices",
        {
          query,
        },
      );

      get().setPrices(res?.data?.items ?? []);
    } catch (e: any) {
      get().setError(e?.message ?? "Failed to load prices");
    } finally {
      set((s) => ({
        priceState: { ...s.priceState, isLoading: false },
      }));
    }
  },

  loadPriceById: async (id) => {
    const res = await apiClient<{ data: PriceItem }>(`/api/prices/${id}`);

    return res?.data ?? null;
  },

  /* =========================================================
     CREATE
  ========================================================= */

  createPrice: async (payload) => {
    set((s) => ({
      priceState: {
        ...s.priceState,
        isSubmitting: true,
        error: null,
      },
    }));

    try {
      const res = await apiClient<{ data: PriceItem }>("/api/prices", {
        method: "POST",
        body: payload,
      });

      const created = res?.data;

      if (created) {
        set((state) => ({
          priceState: {
            ...state.priceState,
            prices: {
              ...state.priceState.prices,
              [created.id]: created,
            },
          },
        }));
      }
    } catch (e: any) {
      get().setError(e?.message ?? "Failed to create price");
    } finally {
      set((s) => ({
        priceState: { ...s.priceState, isSubmitting: false },
      }));
    }
  },

  /* =========================================================
     UPDATE
  ========================================================= */

  updatePrice: async (id, patch) => {
    const prev = get().priceState.prices[id];
    if (!prev) return;

    // optimistic update
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
      await apiClient(`/api/prices/${id}`, {
        method: "PATCH",
        body: patch,
      });

      await get().loadPrices();
    } catch (e: any) {
      get().setError(e?.message ?? "Failed to update price");

      set((state) => ({
        priceState: {
          ...state.priceState,
          prices: {
            ...state.priceState.prices,
            [id]: prev,
          },
        },
      }));
    }
  },

  /* =========================================================
     DELETE
  ========================================================= */

  deletePrice: async (id) => {
    const prev = get().priceState.prices[id];
    if (!prev) return;

    // optimistic remove
    set((state) => {
      const { [id]: _, ...rest } = state.priceState.prices;

      return {
        priceState: {
          ...state.priceState,
          prices: rest,
        },
      };
    });

    try {
      await apiClient(`/api/prices/${id}`, {
        method: "DELETE",
      });
    } catch (e: any) {
      get().setError(e?.message ?? "Failed to delete price");

      set((state) => ({
        priceState: {
          ...state.priceState,
          prices: {
            ...state.priceState.prices,
            [id]: prev,
          },
        },
      }));
    }
  },
});
