// src/store/slices/inventory.slice.ts
import { StateCreator } from "zustand";
import { StockItem, Material, StockMovement } from "@prisma/client";
import { apiClient } from "@root/lib/api/client";

/* =========================================================
   TYPES (ALIGNED WITH MATERIAL ↔ STOCK LINK)
========================================================= */

export type StockItemFull = StockItem & {
  material?: Material | null;
  movements?: StockMovement[]; // Optional: for the "Stock History" tab
};

export interface InventorySlice {
  inventoryState: {
    inventory: Record<string, StockItemFull>;
    isLoading: boolean;
    error: string | null;
  };

  setInventory: (data: StockItemFull[]) => void;
  loadInventory: (query?: { orgId?: string }) => Promise<void>;

  // LEDGER ACTIONS
  restock: (payload: {
    stockItemId: string;
    quantity: number;
    unitCost: number;
    note?: string;
  }) => Promise<void>;

  adjust: (payload: {
    stockItemId: string;
    quantity: number; // Negative for loss, Positive for correction
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
    isLoading: false,
    error: null,
  },

  setInventory: (data) =>
    set((state) => ({
      inventoryState: {
        ...state.inventoryState,
        inventory: data.reduce(
          (acc, item) => {
            acc[item.id] = item;
            return acc;
          },
          {} as Record<string, StockItemFull>,
        ),
      },
    })),

  /* --- READ (Server Source of Truth) --- */
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

  /* --- RESTOCK (Adding Value) --- */
  restock: async (payload) => {
    try {
      await apiClient("/api/stock/movement", {
        method: "POST",
        body: { ...payload, type: "RESTOCK" },
      });

      // Refresh to get the new totalRemaining and updated lastUnitCost
      await get().loadInventory();
    } catch (e: any) {
      console.error("Restock failed", e);
    }
  },

  /* --- ADJUST / WASTE (Manual Corrections) --- */
  adjust: async (payload) => {
    try {
      await apiClient("/api/stock/movement", {
        method: "POST",
        body: payload,
      });

      await get().loadInventory();
    } catch (e: any) {
      console.error("Adjustment failed", e);
    }
  },
});
