import { StateCreator } from "zustand";
import { PriceItem } from "@/types/zodiac.types";
import { apiClient } from "@root/lib/api/client";

export interface PriceSlice {
  priceState: {
    prices: Record<string, PriceItem>;
    isLoading: boolean;
  };

  setPrices: (data: PriceItem[]) => void;

  updatePrice: (
    id: string,
    patch: Partial<Pick<PriceItem, "priceGHS" | "name" | "unit" | "category">>,
    orgId: string,
  ) => Promise<void>;

  loadPrices: () => Promise<void>;
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
  // UPDATE PRICE (OPTIMISTIC + PATCH PATCH PATCH)
  // =========================================================
  updatePrice: async (id, patch, orgId) => {
    const prev = get().priceState.prices[id];
    if (!prev) return;

    // 1. optimistic update (safe merge)
    set((state) => ({
      priceState: {
        ...state.priceState,
        prices: {
          ...state.priceState.prices,
          [id]: {
            ...prev,
            ...patch,
          },
        },
      },
    }));

    try {
      await apiClient("/api/prices", {
        method: "PATCH",
        body: {
          priceListId: id,
          ...patch,
        },
      });

      // full sync ensures backend truth alignment
      await get().loadPrices();
    } catch (error) {
      console.error("Failed to update price:", error);

      // rollback
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
  // LOAD PRICES (SOURCE OF TRUTH)
  // =========================================================
  loadPrices: async () => {
    set((state) => ({
      priceState: { ...state.priceState, isLoading: true },
    }));

    try {
      const res = await apiClient<{ data: { items: PriceItem[] } }>(
        "/api/prices",
        {
          method: "GET",
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
