"use client";

import { useShallow } from "zustand/react/shallow";
import { useDataStore } from "@store/core/useDataStore";
import {
  useSelectedService,
  useLiveEstimate,
} from "@store/selectors/data.selectors";

/**
 * Generic slice hook generator to prevent full-store subscriptions
 */
const slice =
  <K extends keyof ReturnType<typeof useDataStore.getState>>(key: K) =>
  () =>
    useDataStore((s) => s[key]);

/* =========================
   STATE SLICES (READ ONLY)
========================= */
export const useDraft = slice("draft");
export const usePrices = slice("prices");
export const useInventory = slice("inventory");
export const useJobs = slice("jobs");
export const useDeliveries = slice("deliveries");
export const useJobFiles = slice("jobFiles");
export const useIsLoading = slice("isLoading");

/* =========================
   SELECTORS (PURE EXPORT ONLY)
   NO WRAPPER FUNCTIONS
========================= */
export { useSelectedService, useLiveEstimate };

/* =========================
   ACTION HOOK (WRITE OPS ONLY)
========================= */
export const useDataActions = () =>
  useDataStore(
    useShallow((s) => ({
      // Draft Management
      setDraft: s.setDraft,
      resetDraft: s.resetDraft,

      // Core Business Logic
      createJob: s.createJob,
      updateJobStatus: s.updateJobStatus,
      assignStaff: s.assignStaff,
      recordWastage: s.recordWastage,

      // Financials & Stock
      updatePrice: s.updatePrice,
      restockItem: s.restockItem,
      confirmPayment: s.confirmPayment,

      // Fulfillment & Files
      addDelivery: s.addDelivery,
      updateDelivery: s.updateDelivery,
      addFileVersion: s.addFileVersion,

      // System Utilities
      initData: s.initData,
      clearStore: s.clearStore,
      clearCompletedJobs: s.clearCompletedJobs,
      getUniqueJobRef: s.getUniqueJobRef,
    })),
  );
