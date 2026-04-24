"use client";

import { StateCreator } from "zustand";
import { StockItem } from "../../types/zodiac.types";
import { apiClient } from "@root/lib/api/client";

export interface InventorySlice {
  inventory: Record<string, StockItem>;
  isLoading: boolean;

  setInventory: (data: StockItem[]) => void;

  loadInventory: (orgId: string) => Promise<StockItem[]>;

  restock: (payload: {
    orgId: string;
    stockItemId: string;
    quantity: number;
    unitCost: number;
  }) => Promise<void>;

  consume: (payload: {
    orgId: string;
    stockItemId: string;
    quantity: number;
  }) => Promise<void>;
}

export const createInventorySlice: StateCreator<InventorySlice> = (
  set,
  get,
) => ({
  // =========================================================
  // STATE
  // =========================================================
  inventory: {},
  isLoading: false,

  // =========================================================
  // HYDRATION
  // =========================================================
  setInventory: (data) =>
    set(() => ({
      inventory: data.reduce<Record<string, StockItem>>((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {}),
    })),

  // =========================================================
  // LOAD FROM SERVER
  // =========================================================
  loadInventory: async (orgId: string) => {
    set((state) => ({ ...state, isLoading: true }));

    try {
      const res = await apiClient<{ data: StockItem[] }>("/api/stock", {
        query: { orgId },
      });

      const items = res?.data ?? [];

      get().setInventory(items);
      return items;
    } finally {
      set((state) => ({ ...state, isLoading: false }));
    }
  },

  // =========================================================
  // DOMAIN ACTIONS (SOURCE OF TRUTH = SERVER)
  // =========================================================

  restock: async ({ orgId, stockItemId, quantity, unitCost }) => {
    await apiClient("/api/stock/movement", {
      method: "POST",
      body: JSON.stringify({
        orgId,
        stockItemId,
        type: "RESTOCK",
        quantity,
        unitCost,
      }),
    });

    // refresh for consistency (safe model)
    await get().loadInventory(orgId);
  },

  consume: async ({ orgId, stockItemId, quantity }) => {
    await apiClient("/api/stock/movement", {
      method: "POST",
      body: JSON.stringify({
        orgId,
        stockItemId,
        type: "DEDUCT",
        quantity,
      }),
    });

    await get().loadInventory(orgId);
  },
});
