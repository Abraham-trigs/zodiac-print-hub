import { StateCreator } from "zustand";
import { generateJobRef } from "../shared/generateRef";
import { DeliveryType, PriceItem } from "../../types/zodiac.types";

export interface DraftSlice {
  draft: {
    id: string;
    clientName: string;
    serviceId: string;
    quantity: number;
    width: number;
    height: number;
    deliveryType: DeliveryType;
  };

  prices: PriceItem[]; // required for calculation consistency

  setDraft: (patch: Partial<DraftSlice["draft"]>) => void;
  resetDraft: () => void;

  setPrices: (prices: PriceItem[]) => void;

  calculateLiveEstimate: () => number;
}

export const createDraftSlice: StateCreator<DraftSlice> = (set, get) => ({
  draft: {
    id: generateJobRef(),
    clientName: "",
    serviceId: "",
    quantity: 1,
    width: 0,
    height: 0,
    deliveryType: "PHYSICAL_PICKUP",
  },

  prices: [],

  setPrices: (prices) => set({ prices }),

  setDraft: (patch) =>
    set((state) => ({
      draft: { ...state.draft, ...patch },
    })),

  resetDraft: () =>
    set({
      draft: {
        id: generateJobRef(),
        clientName: "",
        serviceId: "",
        quantity: 1,
        width: 0,
        height: 0,
        deliveryType: "PHYSICAL_PICKUP",
      },
    }),

  calculateLiveEstimate: () => {
    const state = get();

    const selectedService = state.prices.find(
      (p) => p.id === state.draft.serviceId,
    );

    if (!selectedService) return 0;

    const base = selectedService.priceGHS;

    const quantity = state.draft.quantity || 1;

    const isAreaBased =
      selectedService.unit === "sqft" || selectedService.unit === "sqm";

    const area = isAreaBased
      ? (state.draft.width || 1) * (state.draft.height || 1)
      : 1;

    return base * quantity * area;
  },
});
