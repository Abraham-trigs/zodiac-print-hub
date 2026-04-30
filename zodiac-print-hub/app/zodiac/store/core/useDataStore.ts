// src/store/useDataStore.ts
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

      // 2. GLOBAL APP STATE
      currentOrgId: null,

      /**
       * INIT DATA (Parallel Sync)
       * Use this in your Layout or Dashboard to boot the shop.
       * It ensures strict multi-tenant isolation by requiring orgId.
       */
      initData: async (orgId: string) => {
        if (!orgId) return;

        set({ currentOrgId: orgId });

        console.log(`[ZODIAC] Syncing Shop: ${orgId}...`);

        try {
          await Promise.all([
            get().loadPrices?.({ orgId }),
            get().loadInventory?.({ orgId }),
            get().loadJobs?.(orgId),
            get().loadStaff?.(orgId),
            get().loadClients?.(orgId),
            get().loadB2BPushes?.(orgId),
          ]);
          console.log("[ZODIAC] Sync Complete.");
        } catch (err) {
          console.error("[ZODIAC] Sync Failed:", err);
        }
      },

      /**
       * RESET STORE
       * Used for logging out or switching organisations.
       */
      resetStore: () => {
        get().resetDraft();
        get().resetPricingDraft();
        set({ currentOrgId: null });
      },
    }),
    {
      name: "zodiac-store-v2", // Structural Change Versioning
      partialize: (state: any) => ({
        // PERSISTENCE MAP: Only keep what's essential for UX
        draft: state.draft,
        pricingDraft: state.pricingDraft,
        currentOrgId: state.currentOrgId,
      }),
    },
  ),
);

// Exporting shallow hook for performance optimization
export { shallow };
