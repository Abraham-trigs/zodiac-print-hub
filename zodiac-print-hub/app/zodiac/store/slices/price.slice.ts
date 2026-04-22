import { StateCreator } from "zustand";
import { PriceList } from "@prisma/client";
import { apiClient } from "@root/lib/api/client";

export interface PriceSlice {
  prices: Record<string, PriceList>;

  setPrices: (data: PriceList[]) => void;
  updatePrice: (id: string, priceGHS: number) => void;

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
        {} as Record<string, PriceList>,
      ),
    })),

  updatePrice: (id, priceGHS) =>
    set((state) => {
      const existing = state.prices[id];
      if (!existing) return state;

      return {
        prices: {
          ...state.prices,
          [id]: { ...existing, priceGHS },
        },
      };
    }),

  loadPrices: async (orgId) => {
    const res = await apiClient<{ items: PriceList[] }>("/api/prices", {
      query: { orgId },
    });

    const items = res?.items ?? [];

    set({
      prices: items.reduce(
        (acc, p) => {
          acc[p.id] = p;
          return acc;
        },
        {} as Record<string, PriceList>,
      ),
    });
  },
});
