import { StateCreator } from "zustand";
import type { DeliveryRecord } from "@/types/zodiac.types";
import { apiClient } from "@root/lib/api/client"; // Added for future API sync

export interface DeliverySlice {
  // 🔥 ALIGNMENT: Grouped state for V2 consistency
  deliveryState: {
    deliveries: Record<string, DeliveryRecord>;
    selectedDeliveryId?: string;
    isLoading: boolean;
    isSubmitting: boolean;
    error?: string | null;
  };

  setDeliveries: (deliveries: DeliveryRecord[]) => void;
  addDelivery: (delivery: DeliveryRecord) => void;
  updateDelivery: (id: string, data: Partial<DeliveryRecord>) => void;
  removeDelivery: (id: string) => void;
  selectDelivery: (id?: string) => void;

  // UI Helpers (Now internal to the state update)
  setDeliveryLoading: (value: boolean) => void;
  setDeliveryError: (error?: string | null) => void;
}

export const createDeliverySlice: StateCreator<DeliverySlice> = (set, get) => ({
  // 1. INITIAL STATE (Grouped)
  deliveryState: {
    deliveries: {},
    selectedDeliveryId: undefined,
    isLoading: false,
    isSubmitting: false,
    error: null,
  },

  // 2. ACTIONS
  setDeliveries: (deliveries) =>
    set((state) => ({
      deliveryState: {
        ...state.deliveryState,
        deliveries: deliveries.reduce(
          (acc, d) => {
            acc[d.id] = d;
            return acc;
          },
          {} as Record<string, DeliveryRecord>,
        ),
      },
    })),

  addDelivery: (delivery) =>
    set((state) => ({
      deliveryState: {
        ...state.deliveryState,
        deliveries: {
          ...state.deliveryState.deliveries,
          [delivery.id]: delivery,
        },
      },
    })),

  updateDelivery: (id, data) =>
    set((state) => {
      const existing = state.deliveryState.deliveries[id];
      if (!existing) return state;

      return {
        deliveryState: {
          ...state.deliveryState,
          deliveries: {
            ...state.deliveryState.deliveries,
            [id]: { ...existing, ...data },
          },
        },
      };
    }),

  removeDelivery: (id) =>
    set((state) => {
      const { [id]: _, ...rest } = state.deliveryState.deliveries;
      return {
        deliveryState: {
          ...state.deliveryState,
          deliveries: rest,
          selectedDeliveryId:
            state.deliveryState.selectedDeliveryId === id
              ? undefined
              : state.deliveryState.selectedDeliveryId,
        },
      };
    }),

  selectDelivery: (id) =>
    set((state) => ({
      deliveryState: { ...state.deliveryState, selectedDeliveryId: id },
    })),

  setDeliveryLoading: (value) =>
    set((state) => ({
      deliveryState: { ...state.deliveryState, isLoading: value },
    })),

  setDeliveryError: (error) =>
    set((state) => ({
      deliveryState: { ...state.deliveryState, error },
    })),
});
