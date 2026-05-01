import { StateCreator } from "zustand";
import { Payment, PaymentMethod } from "@prisma/client";

export interface PaymentSlice {
  paymentState: {
    payments: Record<string, Payment[]>; // Keyed by JobID
    isLoading: boolean;
    error: string | null;
  };

  setPayments: (jobId: string, payments: Payment[]) => void;
  applyPaymentConfirmed: (
    jobId: string,
    payment: Payment,
    newJobStatus: string,
  ) => void;
}

export const createPaymentSlice: StateCreator<PaymentSlice> = (set) => ({
  paymentState: {
    payments: {},
    isLoading: false,
    error: null,
  },

  setPayments: (jobId, payments) =>
    set((state) => ({
      paymentState: {
        ...state.paymentState,
        payments: { ...state.paymentState.payments, [jobId]: payments },
      },
    })),

  /**
   * APPLY PAYMENT (Outbox/Socket Handshake)
   * Logic: Appends to ledger and provides immediate UI feedback.
   */
  applyPaymentConfirmed: (jobId, payment) =>
    set((state) => {
      const existing = state.paymentState.payments[jobId] || [];
      return {
        paymentState: {
          ...state.paymentState,
          payments: {
            ...state.paymentState.payments,
            [jobId]: [...existing, payment],
          },
        },
      };
    }),
});
