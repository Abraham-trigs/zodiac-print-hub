"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { shallow } from "zustand/shallow";

// --- SLICE TYPES ---
import { PriceSlice } from "@store-slices/price.slice";
import { InventorySlice } from "@store-slices/inventory.slice";
import { JobSlice } from "@store-slices/job.slice";
import { DraftSlice } from "@store-slices/draft.slice";
import { PricingDraftSlice } from "@store-slices/pricing-draft.slice";
import { StaffSlice } from "@store-slices/staff.slice";
import { PaymentSlice } from "@store-slices/payment.slice";
import { DeliverySlice } from "@store-slices/delivery.slice";
import { B2BSlice } from "@store-slices/b2b.slice";
import { ClientSlice } from "@store-slices/client.slice";
import { PrintLayoutSlice } from "@store-slices/PrintLayoutSlice";
import { ProcurementSlice } from "@store-slices/ProcurementSlice";

// --- SLICE CREATORS ---
import { createPriceSlice } from "@store-slices/price.slice";
import { createInventorySlice } from "@store-slices/inventory.slice";
import { createJobSlice } from "@store-slices/job.slice";
import { createDraftSlice } from "@store-slices/draft.slice";
import { createPricingDraftSlice } from "@store-slices/pricing-draft.slice";
import { createStaffSlice } from "@store-slices/staff.slice";
import { createPaymentSlice } from "@store-slices/payment.slice";
import { createDeliverySlice } from "@store-slices/delivery.slice";
import { createB2BSlice } from "@store-slices/b2b.slice";
import { createClientSlice } from "@store-slices/client.slice";
import { createPrintLayoutSlice } from "@store-slices/PrintLayoutSlice";
import { createProcurementSlice } from "@store-slices/ProcurementSlice";

/**
 * 🧠 MASTER STATE INTERFACE
 * This ensures your selectors (like selectSuppliersMap) have full intellisense.
 */
export type State = DraftSlice &
  PricingDraftSlice &
  PriceSlice &
  InventorySlice &
  JobSlice &
  StaffSlice &
  PaymentSlice &
  B2BSlice &
  DeliverySlice &
  ClientSlice &
  PrintLayoutSlice &
  ProcurementSlice & {
    currentOrgId: string | null;
    initData: (orgId: string) => Promise<void>;
    resetStore: () => void;
  };

export const useDataStore = create<State>()(
  persist(
    (set, get, api) => ({
      // 1. PLUGINS (SLICES)
      ...createDraftSlice(set, get, api),
      ...createPricingDraftSlice(set, get, api),
      ...createPriceSlice(set, get, api),
      ...createInventorySlice(set, get, api),
      ...createJobSlice(set, get, api),
      ...createStaffSlice(set, get, api),
      ...createPaymentSlice(set, get, api),
      ...createB2BSlice(set, get, api),
      ...createDeliverySlice(set, get, api),
      ...createClientSlice(set, get, api),
      ...createPrintLayoutSlice(set, get, api),
      ...createProcurementSlice(set, get, api),

      // 2. GLOBAL APP STATE
      currentOrgId: null,

      /**
       * INIT DATA (Parallel Sync)
       */
      initData: async (orgId: string) => {
        if (!orgId) return;

        // 🚀 Set the Org ID first so apiClient can grab it from headers
        set({ currentOrgId: orgId });
        if (typeof window !== "undefined") {
          localStorage.setItem("active_org_id", orgId);
        }

        try {
          // Fire all loads. If any slice hasn't implemented a load, the ?. handles it.
          await Promise.all([
            get().loadPrices?.(),
            get().loadInventory?.(),
            get().loadJobs?.(orgId),
            get().loadStaff?.(orgId),
            get().loadClients?.(orgId),
            get().loadB2BPushes?.(orgId),
            get().loadSuppliers?.(),
            get().loadPurchaseOrders?.(),
          ]);
          console.log(`[ZODIAC] Node ${orgId} synchronized.`);
        } catch (err) {
          console.error("[ZODIAC] Node Sync Failed:", err);
        }
      },

      resetStore: () => {
        // ... your reset logic
        set({ currentOrgId: null });
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("active_org_id");
        }
      },
    }),
    {
      name: "zodiac-store-v2",
      // 🛡️ SECURITY: Only persist UI drafts, never sensitive lists.
      // This forces a fresh fetch from the server on every refresh.
      partialize: (state: State) => ({
        currentOrgId: state.currentOrgId,
        draftState: state.draftState, // Persist the job they were building
        pricingDraft: state.pricingDraft,
        // Don't persist jobs, prices, or staff - keep them fresh!
      }),
    },
  ),
);
export { shallow };
