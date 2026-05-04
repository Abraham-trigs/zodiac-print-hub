"use client";

import { StateCreator } from "zustand";
// ✅ FIX: Type-only imports to prevent Prisma binary leaks in browser
import type { StockItem, Material, StockMovement } from "@prisma/client";
import { apiClient } from "@lib/client/api/client"; // 🚀 Aligned path
import { useAuthStore } from "@store/useAuthStore"; // 🚀 Added to fix attribution

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
    movements: Record<string, StockMovement>;
    isLoading: boolean;
    error: string | null;
  };

  setInventory: (data: StockItemFull[]) => void;
  loadInventory: (query?: { orgId?: string }) => Promise<void>;
  loadMovements: (params: { stockItemId?: string }) => Promise<void>;

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
    movements: {},
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
   * ✅ FIXED: Clears the cache per request so history doesn't mix between items
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
            {}, // 🚀 Start fresh so we only show history for the active item
          ),
        },
      }));
    } catch (e) {
      console.error("[ZODIAC] Ledger fetch failed", e);
    }
  },

  restock: async (payload) => {
    try {
      // 🚀 HANDSHAKE: Get user from the dedicated AuthStore
      const currentUser = useAuthStore.getState().user;

      await apiClient("/api/stock", {
        method: "POST",
        body: {
          ...payload,
          type: "RESTOCK",
          referenceType: "RESTOCK",
          createdBy: currentUser?.name || "SYSTEM",
        },
      });
      await get().loadInventory();
    } catch (e: any) {
      console.error("[ZODIAC] Restock failed", e);
    }
  },

  adjust: async (payload) => {
    try {
      const currentUser = useAuthStore.getState().user;

      await apiClient("/api/stock", {
        method: "POST",
        body: {
          ...payload,
          referenceType: payload.type === "WASTE" ? "WASTE" : "MANUAL",
          createdBy: currentUser?.name || "SYSTEM",
        },
      });
      await get().loadInventory();
    } catch (e: any) {
      console.error("[ZODIAC] Adjustment failed", e);
    }
  },
});
