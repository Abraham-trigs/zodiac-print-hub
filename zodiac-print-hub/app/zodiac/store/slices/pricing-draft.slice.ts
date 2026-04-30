"use client";

import { StateCreator } from "zustand";

export type PricingStep =
  | "idle"
  | "select_type"
  | "draft"
  | "review"
  | "submitting";

export type PricingType = "material" | "service";

export interface PricingDraft {
  name: string;
  unit: string;
  costPrice: number;
  priceGHS: number;
  width: number;
  height: number;
  stockRefId?: string;
  category?: string;
}

export interface PricingDraftSlice {
  // ======================
  // FSM FLOW STATE
  // ======================
  step: PricingStep;
  type: PricingType | null;

  // Optional UI interaction state (for quick edits)
  editingField: keyof PricingDraft | null;

  // ======================
  // DATA STATE
  // ======================
  pricingDraft: PricingDraft;

  // ======================
  // ACTIONS (FLOW)
  // ======================
  setStep: (step: PricingStep) => void;
  setType: (type: PricingType) => void;

  goToReview: () => void;
  startSubmission: () => void;

  // ======================
  // ACTIONS (UI CONTEXT)
  // ======================
  setEditingField: (field: keyof PricingDraft | null) => void;

  // ======================
  // ACTIONS (DATA)
  // ======================
  setPricingDraft: (patch: Partial<PricingDraft>) => void;

  // ======================
  // RESET
  // ======================
  resetPricingDraft: () => void;
}

export const createPricingDraftSlice: StateCreator<PricingDraftSlice> = (
  set,
) => ({
  // ======================
  // INITIAL STATE
  // ======================
  step: "idle",
  type: null,
  editingField: null,

  pricingDraft: {
    name: "",
    unit: "sqft",
    costPrice: 0,
    priceGHS: 0,
    width: 0,
    height: 0,
    category: undefined,
  },

  // ======================
  // FLOW CONTROL
  // ======================
  setStep: (step) =>
    set(() => ({
      step,
    })),

  setType: (type) =>
    set(() => ({
      type,
      step: "draft",
    })),

  goToReview: () =>
    set(() => ({
      step: "review",
    })),

  startSubmission: () =>
    set(() => ({
      step: "submitting",
    })),

  // ======================
  // UI CONTEXT (editing)
  // ======================
  setEditingField: (field) =>
    set(() => ({
      editingField: field,
    })),

  // ======================
  // DATA PATCH
  // ======================
  setPricingDraft: (patch) =>
    set((state) => ({
      pricingDraft: {
        ...state.pricingDraft,
        ...patch,
      },
    })),

  // ======================
  // RESET ALL STATE
  // ======================
  resetPricingDraft: () =>
    set(() => ({
      step: "idle",
      type: null,
      editingField: null,
      pricingDraft: {
        name: "",
        unit: "sqft",
        costPrice: 0,
        priceGHS: 0,
        width: 0,
        height: 0,
        category: undefined,
      },
    })),
});
