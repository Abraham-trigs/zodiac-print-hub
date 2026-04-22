import { StateCreator } from "zustand";
import type { DeliveryRecord } from "@/types/zodiac.types";

export interface DeliverySlice {
  deliveries: Record<string, DeliveryRecord>;
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
}

export const createDeliverySlice: StateCreator<DeliverySlice> = (set, get) => ({
  deliveries: {},
  selectedDeliveryId: undefined,

  isLoading: false,
  isSubmitting: false,
  error: null,

  setDeliveries: (deliveries) =>
    set(() => ({
      deliveries: deliveries.reduce(
        (acc, d) => {
          acc[d.id] = d;
          return acc;
        },
        {} as Record<string, DeliveryRecord>,
      ),
    })),

  addDelivery: (delivery) =>
    set((state) => ({
      deliveries: {
        ...state.deliveries,
        [delivery.id]: delivery,
      },
    })),

  updateDelivery: (id, data) =>
    set((state) => {
      const existing = state.deliveries[id];
      if (!existing) return state;

      return {
        deliveries: {
          ...state.deliveries,
          [id]: { ...existing, ...data },
        },
      };
    }),

  removeDelivery: (id) =>
    set((state) => {
      const { [id]: _, ...rest } = state.deliveries;

      return {
        deliveries: rest,
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
});
