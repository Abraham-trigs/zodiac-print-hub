// app/zodiac/store/slices/price.slice.ts

import { StateCreator } from "zustand";
import { PriceItem } from "@/types/zodiac.types";
import { apiClient } from "@root/lib/api/client";

export interface PriceSlice {
  priceState: {
    prices: Record<string, PriceItem>;
    isLoading: boolean;
  };

  setPrices: (data: PriceItem[]) => void;

  updatePrice: (id: string, priceGHS: number, orgId: string) => Promise<void>;

  loadPrices: (orgId: string) => Promise<void>;
}

export const createPriceSlice: StateCreator<PriceSlice> = (set, get) => ({
  // =========================================================
  // INITIAL STATE
  // =========================================================
  priceState: {
    prices: {},
    isLoading: false,
  },

  // =========================================================
  // SET PRICES (HYDRATION)
  // =========================================================
  setPrices: (data) =>
    set((state) => {
      const safeData = Array.isArray(data) ? data : [];

      return {
        priceState: {
          ...state.priceState,
          prices: safeData.reduce(
            (acc, p) => {
              acc[p.id] = p;
              return acc;
            },
            {} as Record<string, PriceItem>,
          ),
        },
      };
    }),

  // =========================================================
  // UPDATE PRICE (OPTIMISTIC + SYNC)
  // =========================================================
  updatePrice: async (id, priceGHS, orgId) => {
    const prev = get().priceState.prices[id];

    if (!prev) return;

    // 1. Optimistic update
    set((state) => ({
      priceState: {
        ...state.priceState,
        prices: {
          ...state.priceState.prices,
          [id]: {
            ...prev,
            priceGHS,
          },
        },
      },
    }));

    try {
      // 2. Persist to backend
      await apiClient("/api/prices", {
        method: "PATCH",
        body: {
          priceListId: id,
          priceGHS,
        },
      });

      // Optional: re-sync for absolute correctness
      await get().loadPrices(orgId);
    } catch (error) {
      console.error("Failed to update price:", error);

      // 3. Rollback on failure
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
  // LOAD PRICES (SERVER SOURCE OF TRUTH)
  // =========================================================
  loadPrices: async (orgId) => {
    set((state) => ({
      priceState: { ...state.priceState, isLoading: true },
    }));

    try {
      const res = await apiClient<{ data: { items: PriceItem[] } }>(
        "/api/prices",
        {
          query: { orgId },
        },
      );

      const items = res?.data?.items ?? [];

      get().setPrices(items);
    } catch (error) {
      console.error("Failed to load prices:", error);
    } finally {
      set((state) => ({
        priceState: { ...state.priceState, isLoading: false },
      }));
    }
  },
});
