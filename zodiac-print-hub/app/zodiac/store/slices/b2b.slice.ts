import { StateCreator } from "zustand";
import type { B2BPush } from "@/types/zodiac.types";

export interface B2BSlice {
  b2b: Record<string, B2BPush>;
  selectedB2BId?: string;

  setB2B: (items: B2BPush[]) => void;
  addB2B: (item: B2BPush) => void;
  updateB2B: (id: string, data: Partial<B2BPush>) => void;
  removeB2B: (id: string) => void;

  selectB2B: (id?: string) => void;
}

export const createB2BSlice: StateCreator<B2BSlice> = (set, get) => ({
  b2b: {},
  selectedB2BId: undefined,

  setB2B: (items) =>
    set(() => ({
      b2b: items.reduce(
        (acc, b) => {
          acc[b.id] = b;
          return acc;
        },
        {} as Record<string, B2BPush>,
      ),
    })),

  addB2B: (item) =>
    set((state) => ({
      b2b: {
        ...state.b2b,
        [item.id]: item,
      },
    })),

  updateB2B: (id, data) =>
    set((state) => {
      const existing = state.b2b[id];
      if (!existing) return state;

      return {
        b2b: {
          ...state.b2b,
          [id]: { ...existing, ...data },
        },
      };
    }),

  removeB2B: (id) =>
    set((state) => {
      const { [id]: _, ...rest } = state.b2b;

      return {
        b2b: rest,
        selectedB2BId:
          state.selectedB2BId === id ? undefined : state.selectedB2BId,
      };
    }),

  selectB2B: (id) => set({ selectedB2BId: id }),
});
