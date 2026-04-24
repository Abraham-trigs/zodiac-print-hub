"use client";

import { StateCreator } from "zustand";
import { StockItem } from "../../types/zodiac.types";
import { apiClient } from "@root/lib/api/client";

export interface InventorySlice {
  // ✅ FIXED: Grouped state to match priceState/jobState
  inventoryState: {
    inventory: Record<string, StockItem>;
    isLoading: boolean;
  };

  setInventory: (data: StockItem[]) => void;
  loadInventory: (orgId: string) => Promise<StockItem[]>;

  restock: (payload: {
    orgId: string;
    stockItemId: string;
    quantity: number;
    unitCost: number;
    createdBy: string; // 🔥 Added to align with StockMovement schema
  }) => Promise<void>;

  consume: (payload: {
    orgId: string;
    stockItemId: string;
    quantity: number;
    createdBy: string;
  }) => Promise<void>;
}

export const createInventorySlice: StateCreator<InventorySlice> = (
  set,
  get,
) => ({
  // =========================================================
  // STATE
  // =========================================================
  inventoryState: {
    inventory: {},
    isLoading: false,
  },

  // =========================================================
  // HYDRATION
  // =========================================================
  setInventory: (data) =>
    set((state) => ({
      inventoryState: {
        ...state.inventoryState,
        inventory: data.reduce<Record<string, StockItem>>((acc, item) => {
          acc[item.id] = item;
          return acc;
        }, {}),
      },
    })),

  // =========================================================
  // LOAD FROM SERVER
  // =========================================================
  loadInventory: async (orgId: string) => {
    set((state) => ({
      inventoryState: { ...state.inventoryState, isLoading: true },
    }));

    try {
      const res = await apiClient<{ data: StockItem[] }>("/api/stock", {
        query: { orgId },
      });

      const items = res?.data ?? [];
      get().setInventory(items);
      return items;
    } finally {
      set((state) => ({
        inventoryState: { ...state.inventoryState, isLoading: false },
      }));
    }
  },

  // =========================================================
  // DOMAIN ACTIONS (LEDGER-BASED)
  // =========================================================

  restock: async ({ orgId, stockItemId, quantity, unitCost, createdBy }) => {
    await apiClient("/api/stock/movement", {
      method: "POST",
      body: {
        orgId,
        stockItemId,
        type: "RESTOCK",
        quantity,
        unitCost,
        createdBy,
      },
    });

    await get().loadInventory(orgId);
  },

  consume: async ({ orgId, stockItemId, quantity, createdBy }) => {
    await apiClient("/api/stock/movement", {
      method: "POST",
      body: {
        orgId,
        stockItemId,
        type: "DEDUCT",
        quantity,
        createdBy,
      },
    });

    await get().loadInventory(orgId);
  },
});
