"use client";

import { StateCreator } from "zustand";
import { generateJobRef } from "../shared/generateRef";
import { DeliveryType } from "../../types/zodiac.types";

export interface DraftSlice {
  // ✅ FIXED: Grouped state for path consistency
  draftState: {
    draft: {
      id: string;
      clientId: string; // 🔥 FIXED: Matches JobService requirement
      serviceId: string;
      quantity: number;
      width: number;
      height: number;
      deliveryType: DeliveryType;
      b2bPushId?: string; // 🔥 NEW: Link for Negotiated prices
      notes?: string; // 🔥 NEW: Align with CreateJobSchema
    };
  };

  setDraft: (patch: Partial<DraftSlice["draftState"]["draft"]>) => void;
  resetDraft: () => void;

  // Note: calculateLiveEstimate is now handled by selectLiveEstimate
  // in selectors.ts to avoid cross-slice data duplication.
}

export const createDraftSlice: StateCreator<DraftSlice> = (set, get) => ({
  // =========================================================
  // STATE
  // =========================================================
  draftState: {
    draft: {
      id: generateJobRef(),
      clientId: "",
      serviceId: "",
      quantity: 1,
      width: 0,
      height: 0,
      deliveryType: "PHYSICAL_PICKUP",
      notes: "",
    },
  },

  // =========================================================
  // ACTIONS
  // =========================================================

  setDraft: (patch) =>
    set((state) => ({
      draftState: {
        ...state.draftState,
        draft: { ...state.draftState.draft, ...patch },
      },
    })),

  resetDraft: () =>
    set((state) => ({
      draftState: {
        ...state.draftState,
        draft: {
          id: generateJobRef(),
          clientId: "",
          serviceId: "",
          quantity: 1,
          width: 0,
          height: 0,
          deliveryType: "PHYSICAL_PICKUP",
          notes: "",
        },
      },
    })),
});
