"use client";

import { useShallow } from "zustand/react/shallow";
import { useDataStore } from "@store/core/useDataStore";
import {
  useSelectedPriceItem, // 🔥 UPDATED NAME
  useLiveEstimate,
} from "@store/selectors/data.selectors";

/**
 * Generic slice hook generator
 * UPDATED: Now looks inside the state wrappers (jobState, priceState, etc.)
 */
const slice = (selector: (s: any) => any) => () => useDataStore(selector);

/* =========================
   STATE SLICES (V2 PATHS)
========================= */
// We now point to the specific state buckets we defined in the slices
export const useDraft = slice((s) => s.draftState.draft);
export const usePrices = slice((s) => s.priceState.prices);
export const useInventory = slice((s) => s.inventoryState.inventory);
export const useJobs = slice((s) => s.jobState.jobs);

// Logic helpers
export const useIsLoading = slice(
  (s) =>
    s.jobState.isLoading ||
    s.priceState.isLoading ||
    s.inventoryState.isLoading,
);

/* =========================
   SELECTORS (PURE EXPORTS)
========================= */
// 🔥 ALIGNMENT: useSelectedPriceItem replaces useSelectedService
export { useSelectedPriceItem, useLiveEstimate };

/* =========================
   ACTION HOOK (WRITE OPS ONLY)
========================= */
export const useDataActions = () =>
  useDataStore(
    useShallow((s: any) => ({
      // Draft Management
      setDraft: s.setDraft,
      resetDraft: s.resetDraft,

      // 🔥 NEW: Pricing Workstation Draft
      setPricingDraft: s.setPricingDraft,
      resetPricingDraft: s.resetPricingDraft,

      // Core Business Logic (Junction Aware)
      createJob: s.createJob,
      updateJobStatus: s.updateStatus, // Check slice for naming (updateStatus vs updateJobStatus)
      createPrice: s.createPrice, // The "Finalize Recipe" action

      // Financials & Stock (Ledger Based)
      updatePrice: s.updatePrice,
      restock: s.restock, // Aligned with inventory.slice
      adjustStock: s.adjust, // Aligned with inventory.slice

      // System Utilities
      initData: s.initData,
      resetStore: s.resetStore,
    })),
  );
