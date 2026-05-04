"use client";

import { StateCreator } from "zustand";
import { generateShortRef } from "@/store/shared/generateShortRef";
import type { DeliveryType, ServiceUnit } from "@prisma/client";

/* =========================================================
   TYPES (ALIGNED WITH V2 INDUSTRIAL ENGINE)
========================================================= */

export interface JobDraft {
  id: string; // Internal UI reference
  clientId: string;
  priceListId: string; // Master Junction ID

  // Dimensions & Quantity
  quantity: number;
  width: number;
  height: number;
  unit: ServiceUnit; // Made required for V2 logic consistency

  // Logistics & Meta
  deliveryType: DeliveryType;
  deliveryAddress?: string; // 🚀 Added for V2 Dispatch Node
  notes?: string;
}

export interface DraftSlice {
  draftState: {
    draft: JobDraft;
  };

  setDraft: (patch: Partial<JobDraft>) => void;
  resetDraft: () => void;
}

// Initial state helper for DRY code
const INITIAL_DRAFT = (): JobDraft => ({
  id: generateShortRef(),
  clientId: "",
  priceListId: "",
  quantity: 1,
  width: 0,
  height: 0,
  unit: "sqft", // Defaulting to industrial standard
  deliveryType: "PICKUP", // Aligned with V2 Schema Enums
  deliveryAddress: "",
  notes: "",
});

/* =========================================================
   SLICE IMPLEMENTATION
========================================================= */

export const createDraftSlice: StateCreator<DraftSlice> = (set) => ({
  draftState: {
    draft: INITIAL_DRAFT(),
  },

  /**
   * SET DRAFT
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
   * Logic: Used after successful Job creation or "Discard".
   */
  resetDraft: () =>
    set(() => ({
      draftState: {
        draft: INITIAL_DRAFT(),
      },
    })),
});
