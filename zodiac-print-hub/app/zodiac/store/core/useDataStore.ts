"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { shallow } from "zustand/shallow";

// --- SLICES ---
import { createPriceSlice } from "./slices/price.slice";
import { createInventorySlice } from "./slices/inventory.slice";
import { createJobSlice } from "./slices/job.slice";
import { createDraftSlice } from "./slices/draft.slice";
import { createPricingDraftSlice } from "./slices/pricing-draft.slice";
import { createStaffSlice } from "./slices/staff.slice";
import { createPaymentSlice } from "./slices/payment.slice";
import { createDeliverySlice } from "./slices/delivery.slice";
import { createB2BSlice } from "./slices/b2b.slice";
import { createClientSlice } from "./slices/client.slice";
// 🚀 NEW V2 PRODUCTION & LOGISTICS SLICES
import { createPrintLayoutSlice } from "./slices/PrintLayoutSlice";
import { createProcurementSlice } from "./slices/procurement.slice";

/**
 * MASTER DATA STORE (V2)
 * Orchestrates the full-stack "Recipe" architecture.
 */
export const useDataStore = create<any>()(
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
      // 🚀 Injecting Production & Supply Chain Intelligence
      ...createPrintLayoutSlice(set, get, api),
      ...createProcurementSlice(set, get, api),

      // 2. GLOBAL APP STATE
      currentOrgId: null,

      /**
       * INIT DATA (Parallel Sync)
       * Orchestrates a multi-tenant bootstrap of all shop modules.
       */
      initData: async (orgId: string) => {
        if (!orgId) return;

        set({ currentOrgId: orgId });

        console.log(`[ZODIAC] Syncing Node: ${orgId}...`);

        try {
          await Promise.all([
            get().loadPrices?.({ orgId }),
            get().loadInventory?.({ orgId }),
            get().loadJobs?.(orgId),
            get().loadStaff?.(orgId),
            get().loadClients?.(orgId),
            get().loadB2BPushes?.(orgId),
            // 🚀 Logistics Boot: Load Suppliers for Procurement Node
            get().loadSuppliers?.(),
            // 🚀 Production Boot: Load active Purchase Orders
            get().loadPurchaseOrders?.(),
          ]);
          console.log("[ZODIAC] System Sync Complete.");
        } catch (err) {
          console.error("[ZODIAC] Node Sync Failed:", err);
        }
      },

      /**
       * RESET STORE
       */
      resetStore: () => {
        get().resetDraft?.();
        get().resetPricingDraft?.();
        get().resetLayout?.(); // 🚀 Clear layout workbench
        set({ currentOrgId: null });
      },
    }),
    {
      name: "zodiac-store-v2",
      partialize: (state: any) => ({
        // PERSISTENCE MAP
        draft: state.draft,
        pricingDraft: state.pricingDraft,
        currentOrgId: state.currentOrgId,
        // Optional: Persist active layout if you want to resume after refresh
        activeLayout: state.layoutState?.activeLayout,
      }),
    },
  ),
);

export { shallow };
