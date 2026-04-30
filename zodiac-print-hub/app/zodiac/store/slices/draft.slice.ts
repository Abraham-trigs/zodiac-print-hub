// src/store/slices/draft.slice.ts
"use client";

import { StateCreator } from "zustand";
import { generateJobRef } from "../shared/generateRef";
import { DeliveryType, ServiceUnit } from "@prisma/client";

/* =========================================================
   TYPES (ALIGNED WITH JOB CREATION ENGINE)
========================================================= */

export interface JobDraft {
  id: string; // Internal UI reference
  clientId: string; // Must be assigned before pushing to production
  priceListId: string; // The Master Junction ID (The "Product")

  // Dimensions & Quantity
  quantity: number;
  width: number;
  height: number;
  unit?: ServiceUnit; // Visual reference for the UI

  // Logistics & Meta
  deliveryType: DeliveryType;
  b2bPushId?: string; // Link if job originated from a partner
  notes?: string; // Instructions for the workshop
}

export interface DraftSlice {
  draftState: {
    draft: JobDraft;
  };

  setDraft: (patch: Partial<JobDraft>) => void;
  resetDraft: () => void;
}

/* =========================================================
   SLICE IMPLEMENTATION
========================================================= */

export const createDraftSlice: StateCreator<DraftSlice> = (set, get) => ({
  // 1. INITIAL STATE (The Empty Cart)
  draftState: {
    draft: {
      id: generateJobRef(),
      clientId: "",
      priceListId: "",
      quantity: 1,
      width: 0,
      height: 0,
      deliveryType: "PHYSICAL_PICKUP",
      notes: "",
    },
  },

  // 2. ACTIONS
  /**
   * SET DRAFT
   * Updates specific fields in the current job cart.
   * Logic: Merges existing draft with the new patch.
   */
  setDraft: (patch) =>
    set((state) => ({
      draftState: {
        ...state.draftState,
        draft: { ...state.draftState.draft, ...patch },
      },
    })),

  /**
   * RESET DRAFT
   * Clears the cart and generates a fresh Job Reference.
   * Logic: Used after a successful Job creation or "Discard" action.
   */
  resetDraft: () =>
    set((state) => ({
      draftState: {
        ...state.draftState,
        draft: {
          id: generateJobRef(),
          clientId: "",
          priceListId: "",
          quantity: 1,
          width: 0,
          height: 0,
          deliveryType: "PHYSICAL_PICKUP",
          notes: "",
        },
      },
    })),
});
