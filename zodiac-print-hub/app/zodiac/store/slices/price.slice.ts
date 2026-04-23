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
  updatePrice: (id: string, priceGHS: number) => void;
  loadPrices: (orgId: string) => Promise<void>;
}

export const createPriceSlice: StateCreator<PriceSlice> = (set, get) => ({
  // ✅ INITIAL STATE (The Folder)
  priceState: {
    prices: {},
    isLoading: false,
  },

  // ✅ ACTIONS
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

  updatePrice: (id, priceGHS) =>
    set((state) => {
      const existing = state.priceState?.prices[id];
      if (!existing) return state;

      return {
        priceState: {
          ...state.priceState,
          prices: {
            ...state.priceState.prices,
            [id]: { ...existing, priceGHS },
          },
        },
      };
    }),

  loadPrices: async (orgId) => {
    // 1. Enter Loading State
    set((state) => ({
      priceState: { ...state.priceState, isLoading: true },
    }));

    try {
      const res = await apiClient<{ data: { items: PriceItem[] } }>(
        "/api/prices",
        { query: { orgId } },
      );

      console.log("DEBUG: Full API response ->", res);
      const items = res?.data?.items ?? [];
      console.log("DEBUG: Successfully extracted array ->", items);

      // 2. Hydrate State using the action above
      get().setPrices(items);
    } catch (error) {
      console.error("Failed to load prices:", error);
    } finally {
      // 3. Exit Loading State
      set((state) => ({
        priceState: { ...state.priceState, isLoading: false },
      }));
    }
  },
});
