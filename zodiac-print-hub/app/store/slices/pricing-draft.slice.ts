"use client";

import { StateCreator } from "zustand";
import type {
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

  // --- FINANCIALS ---
  salePrice: number; // PriceList.salePrice
  purchasePrice: number; // Material.purchasePrice
  basePrice: number; // Service.basePrice

  // --- LOGIC & SPECS ---
  unit: ServiceUnit | "";
  calcType: MaterialCalculationType | ServiceCalculationType | "";

  // Dimensional Specs
  width: number;
  height: number;

  // --- 🚚 LOGISTICS & PROCUREMENT (Phase 4 Addition) ---
  leadTimeDays: number; // Days for supplier to deliver
  minOrderQty: number; // Smallest purchase (e.g. 1 roll)
  buyQuantity: number; // Units per pack (e.g. 150 if roll is 150ft)
  buyUnit: string; // "roll", "box", "pack"

  // Inventory Meta
  stockRefId?: string;
  stockThreshold: number;
}

export interface PricingDraftSlice {
  mode: PricingStep;
  type: PricingType | null;
  editingField: keyof PricingDraft | null;
  pricingDraft: PricingDraft;

  setMode: (mode: PricingStep) => void;
  setType: (type: PricingType | null) => void;
  setEditingField: (field: keyof PricingDraft | null) => void;
  setPricingDraft: (patch: Partial<PricingDraft>) => void;
  resetPricingDraft: () => void;
}

// Helper for initial state to keep create and reset in sync
const INITIAL_DRAFT: PricingDraft = {
  name: "",
  category: "General",
  salePrice: 0,
  purchasePrice: 0,
  basePrice: 0,
  unit: "sqft",
  calcType: "",
  width: 0,
  height: 0,
  // Logistics Defaults
  leadTimeDays: 3,
  minOrderQty: 1,
  buyQuantity: 1,
  buyUnit: "roll",
  stockThreshold: 10,
};

export const createPricingDraftSlice: StateCreator<PricingDraftSlice> = (
  set,
) => ({
  mode: "idle",
  type: null,
  editingField: null,
  pricingDraft: INITIAL_DRAFT,

  setMode: (mode) => set(() => ({ mode })),

  setType: (type) =>
    set(() => ({
      type,
      mode: type ? "draft" : "idle",
    })),

  setEditingField: (field) => set(() => ({ editingField: field })),

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
      pricingDraft: INITIAL_DRAFT,
    })),
});
