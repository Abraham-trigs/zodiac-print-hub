import { StateCreator } from "zustand";
import { PriceItem } from "@types/zodiac.types";
import { apiClient } from "@root/lib/api/client";
export interface PriceSlice {
  prices: PriceItem[];

  setPrices: (data: PriceItem[]) => void;
  updatePrice: (id: string, price: number) => void;

  loadPrices: (orgId: string) => Promise<void>;
}

export const createPriceSlice: StateCreator<PriceSlice> = (set) => ({
  prices: [],

  setPrices: (data) => set({ prices: data }),

  updatePrice: (id, price) =>
    set((state) => ({
      prices: state.prices.map((p) =>
        p.id === id ? { ...p, priceGHS: price } : p,
      ),
    })),

  loadPrices: async (orgId) => {
    const res = await apiClient<{ items: PriceItem[] }>("/api/prices", {
      query: { orgId },
    });

    set({
      prices: res?.items ?? [],
    });
  },
});
