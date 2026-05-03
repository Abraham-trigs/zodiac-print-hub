"use client";

import { StateCreator } from "zustand";
import type { StockItem, Material, StockMovement } from "@prisma/client";
import { apiClient } from "@lib/client/api/client";

/* =========================================================
   TYPES
========================================================= */

export type StockItemFull = StockItem & {
  material?: Material | null;
  movements?: StockMovement[];
};

export interface InventorySlice {
  inventoryState: {
    inventory: Record<string, StockItemFull>;
    movements: Record<string, StockMovement>; // 🔥 NEW: Ledger cache for UI
    isLoading: boolean;
    error: string | null;
  };

  setInventory: (data: StockItemFull[]) => void;
  loadInventory: (query?: { orgId?: string }) => Promise<void>;

  // 🔥 NEW: Fetch historic movements for the Ledger UI
  loadMovements: (params: { stockItemId?: string }) => Promise<void>;

  // LEDGER ACTIONS (Aligned with StockMovement model)
  restock: (payload: {
    stockItemId: string;
    quantity: number;
    unitCost: number;
    note?: string;
  }) => Promise<void>;

  adjust: (payload: {
    stockItemId: string;
    quantity: number;
    type: "WASTE" | "ADJUST";
    note?: string;
  }) => Promise<void>;
}

/* =========================================================
   SLICE IMPLEMENTATION
========================================================= */

export const createInventorySlice: StateCreator<InventorySlice> = (
  set,
  get,
) => ({
  inventoryState: {
    inventory: {},
    movements: {}, // 🔥 Initialized
    isLoading: false,
    error: null,
  },

  setInventory: (data) =>
    set((state) => ({
      inventoryState: {
        ...state.inventoryState,
        inventory: data.reduce(
          (acc, item) => ({ ...acc, [item.id]: item }),
          {},
        ),
      },
    })),

  loadInventory: async (query) => {
    set((s) => ({
      inventoryState: { ...s.inventoryState, isLoading: true, error: null },
    }));
    try {
      const res = await apiClient<{ data: StockItemFull[] }>("/api/stock", {
        query,
      });
      get().setInventory(res?.data ?? []);
    } catch (e: any) {
      set((s) => ({
        inventoryState: { ...s.inventoryState, error: e.message },
      }));
    } finally {
      set((s) => ({
        inventoryState: { ...s.inventoryState, isLoading: false },
      }));
    }
  },

  /**
   * LOAD MOVEMENTS
   * 🔥 NEW: Powers the StockLedgerScreen
   */
  loadMovements: async ({ stockItemId }) => {
    try {
      const res = await apiClient<{ data: StockMovement[] }>(
        "/api/stock/movements",
        {
          query: stockItemId ? { stockItemId } : {},
        },
      );
      const data = res?.data ?? [];

      set((state) => ({
        inventoryState: {
          ...state.inventoryState,
          movements: data.reduce(
            (acc, m) => ({ ...acc, [m.id]: m }),
            state.inventoryState.movements,
          ),
        },
      }));
    } catch (e) {
      console.error("Ledger fetch failed", e);
    }
  },

  restock: async (payload) => {
    try {
      await apiClient("/api/stock", {
        // 🚀 Updated path to match route.ts
        method: "POST",
        body: {
          ...payload,
          type: "RESTOCK",
          referenceType: "RESTOCK",
          createdBy: (get() as any).authState?.user?.id || "SYSTEM", // 🚀 Attribution
        },
      });
      await get().loadInventory();
    } catch (e: any) {
      console.error("Restock failed", e);
    }
  },

  adjust: async (payload) => {
    try {
      await apiClient("/api/stock", {
        // 🚀 Updated path
        method: "POST",
        body: {
          ...payload,
          referenceType: payload.type === "WASTE" ? "WASTE" : "MANUAL",
          createdBy: (get() as any).authState?.user?.id || "SYSTEM",
        },
      });
      await get().loadInventory();
    } catch (e: any) {
      console.error("Adjustment failed", e);
    }
  },
});
