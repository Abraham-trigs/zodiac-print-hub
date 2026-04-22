import { StateCreator } from "zustand";
import { PriceItem } from "@/types/zodiac.types";
import { apiClient } from "@root/lib/api/client";

export interface PriceSlice {
  prices: Record<string, PriceItem>;

  setPrices: (data: PriceItem[]) => void;
  updatePrice: (id: string, price: number) => void;

  loadPrices: (orgId: string) => Promise<void>;
}

export const createPriceSlice: StateCreator<PriceSlice> = (set) => ({
  prices: {},

  setPrices: (data) =>
    set(() => ({
      prices: data.reduce(
        (acc, p) => {
          acc[p.id] = p;
          return acc;
        },
        {} as Record<string, PriceItem>,
      ),
    })),

  updatePrice: (id, price) =>
    set((state) => {
      const existing = state.prices[id];
      if (!existing) return state;

      return {
        prices: {
          ...state.prices,
          [id]: { ...existing, priceGHS: price },
        },
      };
    }),

  loadPrices: async (orgId) => {
    const res = await apiClient<{ items: PriceItem[] }>("/api/prices", {
      query: { orgId },
    });

    const items = res?.items ?? [];

    set({
      prices: items.reduce(
        (acc, p) => {
          acc[p.id] = p;
          return acc;
        },
        {} as Record<string, PriceItem>,
      ),
    });
  },
});
