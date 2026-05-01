// src/store/slices/pricing-draft.slice.ts
"use client";

import { StateCreator } from "zustand";
import {
  MaterialCalculationType,
  ServiceCalculationType,
  ServiceUnit,
} from "@prisma/client";

export type PricingStep =
  | "idle"
  | "select_type"
  | "draft"
  | "review"
  | "submitting";
export type PricingType = "material" | "service";

export interface PricingDraft {
  name: string; // -> PriceList.displayName
  category: string; // -> Category link

  // --- FINANCIALS (The Triple-Price Logic) ---
  salePrice: number; // What the customer pays (PriceList.salePrice)
  purchasePrice: number; // What you pay for stock (Material.purchasePrice)
  basePrice: number; // Your internal labor rate (Service.basePrice)

  // --- LOGIC & SPECS ---
  unit: ServiceUnit | "";
  calcType: MaterialCalculationType | ServiceCalculationType | "";

  // Dimensional Specs
  width: number;
  height: number;

  // Inventory Meta
  stockRefId?: string;
  stockThreshold: number;
}

export interface PricingDraftSlice {
  mode: PricingStep;
  type: PricingType | null;
  editingField: keyof PricingDraft | null;
  pricingDraft: PricingDraft;

  // FLOW ACTIONS
  setMode: (mode: PricingStep) => void;
  setType: (type: PricingType | null) => void;

  // UI CONTEXT ACTIONS
  setEditingField: (field: keyof PricingDraft | null) => void;

  // DATA ACTIONS
  setPricingDraft: (patch: Partial<PricingDraft>) => void;
  resetPricingDraft: () => void;
}

export const createPricingDraftSlice: StateCreator<PricingDraftSlice> = (
  set,
) => ({
  // =========================================================
  // INITIAL STATE
  // =========================
  mode: "idle",
  type: null,
  editingField: null,

  pricingDraft: {
    name: "",
    category: "General",
    salePrice: 0,
    purchasePrice: 0,
    basePrice: 0,
    unit: "sqft",
    calcType: "",
    width: 0,
    height: 0,
    stockThreshold: 10,
  },

  // =========================================================
  // FLOW & CONTEXT CONTROL
  // =========================
  setMode: (mode) => set(() => ({ mode })),

  setType: (type) =>
    set(() => ({
      type,
      mode: type ? "draft" : "idle",
    })),

  setEditingField: (field) => set(() => ({ editingField: field })),

  // =========================================================
  // DATA ACTIONS
  // =========================
  setPricingDraft: (patch) =>
    set((state) => ({
      pricingDraft: {
        ...state.pricingDraft,
        ...patch,
      },
    })),

  resetPricingDraft: () =>
    set(() => ({
      mode: "idle",
      type: null,
      editingField: null,
      pricingDraft: {
        name: "",
        category: "General",
        salePrice: 0,
        purchasePrice: 0,
        basePrice: 0,
        unit: "sqft",
        calcType: "",
        width: 0,
        height: 0,
        stockThreshold: 10,
      },
    })),
});
