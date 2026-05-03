"use client";
import { create } from "zustand";

type AppBootState = {
  isHydrated: boolean;

  setHydrated: (v: boolean) => void;
};

export const useAppBootStore = create<AppBootState>((set) => ({
  isHydrated: false,

  setHydrated: (v) => set({ isHydrated: v }),
}));
