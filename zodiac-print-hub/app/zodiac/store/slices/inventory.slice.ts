import { StateCreator } from "zustand";
import { StockItem } from "../../types/zodiac.types";

export interface InventorySlice {
  inventory: StockItem[];

  setInventory: (data: StockItem[]) => void;

  // UI-only optimistic updates
  restockLocal: (id: string, qty: number, cost: number) => void;
  consumeLocal: (id: string, qty: number) => void;
}

export const createInventorySlice: StateCreator<InventorySlice> = (set) => ({
  inventory: [],

  setInventory: (data) => set({ inventory: data }),

  restockLocal: (id, qty, cost) =>
    set((state) => ({
      inventory: state.inventory.map((i) =>
        i.id === id
          ? {
              ...i,
              totalRemaining: i.totalRemaining + qty,
              lastUnitCost: cost,
            }
          : i,
      ),
    })),

  consumeLocal: (id, qty) =>
    set((state) => ({
      inventory: state.inventory.map((i) =>
        i.id === id
          ? {
              ...i,
              totalRemaining: Math.max(0, i.totalRemaining - qty),
            }
          : i,
      ),
    })),
});
