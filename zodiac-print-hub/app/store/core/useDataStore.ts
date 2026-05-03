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

      initData: async (orgId: string) => {
        if (!orgId) return;
        set({ currentOrgId: orgId });

        try {
          await Promise.all([
            get().loadPrices?.(),
            get().loadInventory?.(),
            get().loadJobs?.(orgId),
            get().loadStaff?.(orgId),
            get().loadClients?.(orgId),
            get().loadB2BPushes?.(orgId),
            // 🚀 Logistics Boot
            get().loadSuppliers?.(),
            get().loadPurchaseOrders?.(),
          ]);
        } catch (err) {
          console.error("[ZODIAC] Node Sync Failed:", err);
        }
      },

      resetStore: () => {
        get().resetDraft?.();
        // @ts-ignore - pricingDraftSlice might not have resetDraft named differently
        get().resetPricingDraft?.();
        get().resetLayout?.();
        set({ currentOrgId: null });
      },
    }),
    {
      name: "zodiac-store-v2",
      partialize: (state: State) => ({
        // PERSISTENCE MAP
        draft: state.draft,
        pricingDraft: state.pricingDraft,
        currentOrgId: state.currentOrgId,
        // @ts-ignore
        activeLayout: state.layoutState?.activeLayout,
      }),
    },
  ),
);

export { shallow };
