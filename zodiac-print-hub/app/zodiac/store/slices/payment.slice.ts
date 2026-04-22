import { StateCreator } from "zustand";
import type { PaymentRecord, PaymentRecordStatus } from "@/types/zodiac.types";

export interface PaymentSlice {
  payments: Record<string, PaymentRecord[]>;
  selectedPaymentId?: string;

  isLoading: boolean;
  isSubmitting: boolean;
  error?: string | null;

  setPayments: (jobId: string, payments: PaymentRecord[]) => void;

  addPaymentOptimistic: (jobId: string, payment: PaymentRecord) => void;

  updatePaymentStatus: (
    jobId: string,
    paymentId: string,
    status: PaymentRecordStatus,
  ) => void;

  selectPayment: (paymentId?: string) => void;

  removePayment: (jobId: string, paymentId: string) => void;

  clearJobPayments: (jobId: string) => void;

  setLoading: (value: boolean) => void;
  setSubmitting: (value: boolean) => void;
  setError: (error?: string | null) => void;

  getJobPayments: (jobId: string) => PaymentRecord[];

  getTotalPaid: (jobId: string) => number;
}

export const createPaymentSlice: StateCreator<PaymentSlice> = (set, get) => ({
  payments: {},
  selectedPaymentId: undefined,

  isLoading: false,
  isSubmitting: false,
  error: null,

  setPayments: (jobId, payments) =>
    set((state) => ({
      payments: {
        ...state.payments,
        [jobId]: payments,
      },
    })),

  addPaymentOptimistic: (jobId, payment) =>
    set((state) => ({
      payments: {
        ...state.payments,
        [jobId]: [payment, ...(state.payments[jobId] || [])],
      },
    })),

  updatePaymentStatus: (jobId, paymentId, status) =>
    set((state) => ({
      payments: {
        ...state.payments,
        [jobId]: (state.payments[jobId] || []).map((p) =>
          p.id === paymentId ? { ...p, status } : p,
        ),
      },
    })),

  selectPayment: (paymentId) => set({ selectedPaymentId: paymentId }),

  removePayment: (jobId, paymentId) =>
    set((state) => ({
      payments: {
        ...state.payments,
        [jobId]: (state.payments[jobId] || []).filter(
          (p) => p.id !== paymentId,
        ),
      },
    })),

  clearJobPayments: (jobId) =>
    set((state) => {
      const copy = { ...state.payments };
      delete copy[jobId];
      return { payments: copy };
    }),

  setLoading: (value) => set({ isLoading: value }),
  setSubmitting: (value) => set({ isSubmitting: value }),
  setError: (error) => set({ error }),

  getJobPayments: (jobId) => get().payments[jobId] || [],

  getTotalPaid: (jobId) =>
    (get().payments[jobId] || []).reduce((sum, p) => sum + p.amount, 0),
});
