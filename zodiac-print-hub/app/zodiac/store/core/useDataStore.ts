"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { createPriceSlice } from "../slices/price.slice";
import { createInventorySlice } from "../slices/inventory.slice";
import { createJobSlice } from "../slices/job.slice";
import { createDraftSlice } from "../slices/draft.slice";
import { createPricingDraftSlice } from "../slices/pricing-draft.slice"; // ✅ Added
import { createStaffSlice } from "../slices/staff.slice";
import { createPaymentSlice } from "../slices/payment.slice";
import { createDeliverySlice } from "../slices/delivery.slice";
import { createB2BSlice } from "../slices/b2b.slice";
import { createClientSlice } from "../slices/client.slice";

export const useDataStore = create(
  persist(
    (set, get, api) => ({
      ...createDraftSlice(set, get, api),
      ...createPricingDraftSlice(set, get, api), // ✅ Plugged in
      ...createPriceSlice(set, get, api),
      ...createInventorySlice(set, get, api),
      ...createJobSlice(set, get, api),
      ...createStaffSlice(set, get, api),
      ...createPaymentSlice(set, get, api),
      ...createB2BSlice(set, get, api),
      ...createDeliverySlice(set, get, api),
      ...createClientSlice(set, get, api),

      initData: async () => {
        const orgId = "cmoa30ire0000o0dwz69fjgah";

        console.log("--- SYNC START ---");

        await Promise.all([
          get().loadPrices?.(orgId),
          get().loadInventory?.(orgId),
          get().loadJobs?.(),
          get().loadStaff?.(orgId),
          get().loadClients?.(orgId),
        ]);

        console.log("--- SYNC COMPLETE ---");
      },
    }),
    {
      name: "zodiac-store-v2", // ✅ Version bump for structural change
      partialize: (state: any) => ({
        // ✅ Persist both the Job Cart and the Pricing Workstation data
        draft: state.draft,
        pricingDraft: state.pricingDraft,
      }),
    },
  ),
);
