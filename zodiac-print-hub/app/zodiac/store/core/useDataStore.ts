import { create } from "zustand";
import { persist } from "zustand/middleware";

import { createPriceSlice } from "../slices/price.slice";
import { createInventorySlice } from "../slices/inventory.slice";
import { createJobSlice } from "../slices/job.slice";
import { createDraftSlice } from "../slices/draft.slice";
import { createStaffSlice } from "../slices/staff.slice";
import { createPaymentSlice } from "../slices/payment.slice";
import { createDeliverySlice } from "../slices/delivery.slice";
import { createB2BSlice } from "../slices/b2b.slice";
import { createClientSlice } from "../slices/client.slice";

export const useDataStore = create(
  persist(
    (set, get, api) => ({
      ...createDraftSlice(set, get, api),
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

        const finalState = get();
        console.log("--- SYNC COMPLETE ---");
        console.log(
          "Target Folder (priceState):",
          finalState.priceState?.prices,
        );
        console.log("Old Shelf (prices):", finalState.prices);
        console.log("FULL STATE:", finalState);
      },
    }),
    {
      name: "zodiac-store-v4", // ✅ Incrementing version to force a fresh start
      partialize: (state: any) => ({
        draft: state.draft,
      }),
    },
  ),
);
