import { StateCreator } from "zustand";
import { StockItem } from "../../types/zodiac.types";

export interface InventorySlice {
  inventory: Record<string, StockItem>;

  setInventory: (data: StockItem[]) => void;

  restockLocal: (id: string, qty: number, cost: number) => void;
  consumeLocal: (id: string, qty: number) => void;
}

export const createInventorySlice: StateCreator<InventorySlice> = (set) => ({
  inventory: {},

  setInventory: (data) =>
    set(() => ({
      inventory: data.reduce(
        (acc, item) => {
          acc[item.id] = item;
          return acc;
        },
        {} as Record<string, StockItem>,
      ),
    })),

  restockLocal: (id, qty, cost) =>
    set((state) => {
      const item = state.inventory[id];
      if (!item) return state;

      return {
        inventory: {
          ...state.inventory,
          [id]: {
            ...item,
            totalRemaining: item.totalRemaining + qty,
            lastUnitCost: cost,
          },
        },
      };
    }),

  consumeLocal: (id, qty) =>
    set((state) => {
      const item = state.inventory[id];
      if (!item) return state;

      return {
        inventory: {
          ...state.inventory,
          [id]: {
            ...item,
            totalRemaining: Math.max(0, item.totalRemaining - qty),
          },
        },
      };
    }),
});
