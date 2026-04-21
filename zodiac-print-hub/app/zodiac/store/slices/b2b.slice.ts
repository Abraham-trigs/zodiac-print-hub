// store/slices/b2b.slice.ts

import { StateCreator } from "zustand";
import type { B2BPush } from "@/types/zodiac.types";

export interface B2BSlice {
  b2b: Record<string, B2BPush>;
  b2bList: B2BPush[];

  selectedB2BId?: string;

  setB2B: (items: B2BPush[]) => void;
  addB2B: (item: B2BPush) => void;
  updateB2B: (id: string, data: Partial<B2BPush>) => void;
  removeB2B: (id: string) => void;

  selectB2B: (id?: string) => void;
  getB2BById: (id: string) => B2BPush | undefined;
}

export const createB2BSlice: StateCreator<B2BSlice> = (set, get) => ({
  b2b: {},
  b2bList: [],
  selectedB2BId: undefined,

  setB2B: (items) =>
    set(() => ({
      b2b: Object.fromEntries(items.map((b) => [b.id, b])),
      b2bList: items,
    })),

  addB2B: (item) =>
    set((state) => ({
      b2b: {
        ...state.b2b,
        [item.id]: item,
      },
      b2bList: [item, ...state.b2bList],
    })),

  updateB2B: (id, data) =>
    set((state) => {
      const existing = state.b2b[id];
      if (!existing) return state;

      const updated = { ...existing, ...data };

      return {
        b2b: {
          ...state.b2b,
          [id]: updated,
        },
        b2bList: state.b2bList.map((b) => (b.id === id ? updated : b)),
      };
    }),

  removeB2B: (id) =>
    set((state) => {
      const { [id]: _, ...rest } = state.b2b;

      return {
        b2b: rest,
        b2bList: state.b2bList.filter((b) => b.id !== id),
        selectedB2BId:
          state.selectedB2BId === id ? undefined : state.selectedB2BId,
      };
    }),

  selectB2B: (id) => set({ selectedB2BId: id }),

  getB2BById: (id) => get().b2b[id],
});
