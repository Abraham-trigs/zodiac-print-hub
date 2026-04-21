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

export const useDataStore = create(
  persist(
    (set, get, api) => ({
      ...createDraftSlice(set, get, api),

      ...createPriceSlice(set, get, api),
      ...createInventorySlice(set, get, api),
      ...createJobSlice(set, get, api),
      ...createStaffSlice(set, get, api),
      ...createPaymentSlice(set, get, api),
      ...createB2BSlice(set, get, api), // optional if you implement later

      // ✅ DELIVERY SLICE ADDED
      ...createDeliverySlice(set, get, api),

      initData: async () => {
        const {
          loadPrices,
          loadInventory,
          loadJobs,
          loadStaff,
          loadDeliveries,
        } = get();

        await Promise.all([
          loadPrices?.(),
          loadInventory?.(),
          loadJobs?.(),
          loadStaff?.(),
          loadDeliveries?.(), // optional if you implement later
        ]);
      },
    }),
    {
      name: "zodiac-store",
      partialize: (state: any) => ({
        draft: state.draft,
      }),
    },
  ),
);
