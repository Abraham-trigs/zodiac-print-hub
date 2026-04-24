import { StateCreator } from "zustand";
import { PriceItem } from "@/types/zodiac.types";
import { apiClient } from "@root/lib/api/client";

// 🔥 UPDATED: Added costPrice, stockRefId, and isActive to align with Zod schema
type PricePatch = Partial<
  Pick<
    PriceItem,
    | "priceGHS"
    | "costPrice"
    | "name"
    | "unit"
    | "category"
    | "stockRefId"
    | "isActive"
  >
>;

export interface PriceSlice {
  priceState: {
    prices: Record<string, PriceItem>;
    isLoading: boolean;
    isSubmitting: boolean;
  };

  setPrices: (data: PriceItem[]) => void;

  // READ
  loadPrices: () => Promise<void>;
  loadPriceById: (id: string) => Promise<PriceItem | null>;

  // CREATE
  createPrice: (payload: Partial<PriceItem>) => Promise<void>;

  // UPDATE
  updatePrice: (id: string, patch: PricePatch) => Promise<void>;

  // DELETE
  deletePrice: (id: string) => Promise<void>;
}

export const createPriceSlice: StateCreator<PriceSlice> = (set, get) => ({
  // =========================================================
  // STATE
  // =========================================================
  priceState: {
    prices: {},
    isLoading: false,
    isSubmitting: false,
  },

  // =========================================================
  // HYDRATION
  // =========================================================
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

  // =========================================================
  // READ
  // =========================================================
  loadPrices: async () => {
    set((s) => ({
      priceState: { ...s.priceState, isLoading: true },
    }));

    try {
      // Logic Sync: backend returns { items: [] }
      const res = await apiClient<{ data: { items: PriceItem[] } }>(
        "/api/prices",
      );

      get().setPrices(res?.data?.items ?? []);
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

  // =========================================================
  // CREATE
  // =========================================================
  createPrice: async (payload) => {
    set((s) => ({
      priceState: { ...s.priceState, isSubmitting: true },
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
    } finally {
      set((s) => ({
        priceState: { ...s.priceState, isSubmitting: false },
      }));
    }
  },

  // =========================================================
  // UPDATE (OPTIMISTIC + ROLLBACK SAFE)
  // =========================================================
  // 🔥 FIX: Removed unused orgId param (handled by backend auth)
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
      // Silent re-fetch to ensure server sync
      await get().loadPrices();
    } catch (e) {
      // rollback on failure
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

  // =========================================================
  // DELETE
  // =========================================================
  // 🔥 FIX: Removed unused orgId param
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
    } catch (e) {
      // rollback on failure
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

export const priceService = new PriceService();
