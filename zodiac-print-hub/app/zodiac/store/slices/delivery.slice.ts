import { StateCreator } from "zustand";
import type { DeliveryRecord } from "@/types/zodiac.types";

export interface DeliverySlice {
  deliveries: Record<string, DeliveryRecord>;
  deliveryList: DeliveryRecord[];
  selectedDeliveryId?: string;

  isLoading: boolean;
  isSubmitting: boolean;
  error?: string | null;

  setDeliveries: (deliveries: DeliveryRecord[]) => void;
  addDelivery: (delivery: DeliveryRecord) => void;
  updateDelivery: (id: string, data: Partial<DeliveryRecord>) => void;
  removeDelivery: (id: string) => void;

  selectDelivery: (id?: string) => void;

  setLoading: (value: boolean) => void;
  setSubmitting: (value: boolean) => void;
  setError: (error?: string | null) => void;

  getDeliveryById: (id: string) => DeliveryRecord | undefined;
}

export const createDeliverySlice: StateCreator<DeliverySlice> = (set, get) => ({
  deliveries: {},
  deliveryList: [],
  selectedDeliveryId: undefined,

  isLoading: false,
  isSubmitting: false,
  error: null,

  setDeliveries: (deliveries) =>
    set(() => ({
      deliveries: Object.fromEntries(deliveries.map((d) => [d.id, d])),
      deliveryList: deliveries,
    })),

  addDelivery: (delivery) =>
    set((state) => ({
      deliveries: {
        ...state.deliveries,
        [delivery.id]: delivery,
      },
      deliveryList: [delivery, ...state.deliveryList],
    })),

  updateDelivery: (id, data) =>
    set((state) => {
      const existing = state.deliveries[id];
      if (!existing) return state;

      const updated = { ...existing, ...data };

      return {
        deliveries: {
          ...state.deliveries,
          [id]: updated,
        },
        deliveryList: state.deliveryList.map((d) =>
          d.id === id ? updated : d,
        ),
      };
    }),

  removeDelivery: (id) =>
    set((state) => {
      const { [id]: _, ...rest } = state.deliveries;

      return {
        deliveries: rest,
        deliveryList: state.deliveryList.filter((d) => d.id !== id),
        selectedDeliveryId:
          state.selectedDeliveryId === id
            ? undefined
            : state.selectedDeliveryId,
      };
    }),

  selectDelivery: (id) => set({ selectedDeliveryId: id }),

  setLoading: (value) => set({ isLoading: value }),
  setSubmitting: (value) => set({ isSubmitting: value }),
  setError: (error) => set({ error }),

  getDeliveryById: (id) => get().deliveries[id],
});
