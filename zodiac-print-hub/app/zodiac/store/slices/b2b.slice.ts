"use client";

import { StateCreator } from "zustand";
import type { B2BPush } from "@/types/zodiac.types";

export interface B2BSlice {
  // ✅ FIXED: Grouped state for consistency across the store
  b2bState: {
    items: Record<string, B2BPush>;
    selectedId?: string;
    isLoading: boolean;
  };

  setB2B: (items: B2BPush[]) => void;
  addB2B: (item: B2BPush) => void;
  updateB2B: (id: string, data: Partial<B2BPush>) => void;
  removeB2B: (id: string) => void;
  selectB2B: (id?: string) => void;
}

export const createB2BSlice: StateCreator<B2BSlice> = (set, get) => ({
  // =========================================================
  // STATE
  // =========================================================
  b2bState: {
    items: {},
    selectedId: undefined,
    isLoading: false,
  },

  // =========================================================
  // ACTIONS
  // =========================================================

  setB2B: (items) =>
    set((state) => ({
      b2bState: {
        ...state.b2bState,
        items: items.reduce(
          (acc, b) => {
            acc[b.id] = b;
            return acc;
          },
          {} as Record<string, B2BPush>,
        ),
      },
    })),

  addB2B: (item) =>
    set((state) => ({
      b2bState: {
        ...state.b2bState,
        items: {
          ...state.b2bState.items,
          [item.id]: item,
        },
      },
    })),

  updateB2B: (id, data) =>
    set((state) => {
      const existing = state.b2bState.items[id];
      if (!existing) return state;

      return {
        b2bState: {
          ...state.b2bState,
          items: {
            ...state.b2bState.items,
            [id]: { ...existing, ...data },
          },
        },
      };
    }),

  removeB2B: (id) =>
    set((state) => {
      const { [id]: _, ...rest } = state.b2bState.items;

      return {
        b2bState: {
          ...state.b2bState,
          items: rest,
          selectedId:
            state.b2bState.selectedId === id
              ? undefined
              : state.b2bState.selectedId,
        },
      };
    }),

  selectB2B: (id) =>
    set((state) => ({
      b2bState: {
        ...state.b2bState,
        selectedId: id,
      },
    })),
});
