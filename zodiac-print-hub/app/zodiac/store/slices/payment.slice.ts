import { StateCreator } from "zustand";
import type {
  PaymentRecord,
  PaymentStatus,
  PaymentRecordStatus,
} from "@zodiac/types/zodiac.types";

export interface PaymentSlice {
  // ─────────────────────────────
  // DATA
  // ─────────────────────────────
  payments: Record<string, PaymentRecord[]>;
  selectedPaymentId?: string;

  // ─────────────────────────────
  // UI STATE
  // ─────────────────────────────
  isLoading: boolean;
  isSubmitting: boolean;
  error?: string | null;

  // ─────────────────────────────
  // ACTIONS
  // ─────────────────────────────

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

  // ─────────────────────────────
  // DERIVED
  // ─────────────────────────────

  getJobPayments: (jobId: string) => PaymentRecord[];

  getTotalPaid: (jobId: string) => number;

  getPaymentStatus: (jobId: string, totalDue: number) => PaymentStatus;
}

export const createPaymentSlice: StateCreator<PaymentSlice> = (set, get) => ({
  payments: {},
  selectedPaymentId: undefined,

  isLoading: false,
  isSubmitting: false,
  error: null,

  // ─────────────────────────────
  // ACTIONS
  // ─────────────────────────────

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

  selectPayment: (paymentId) =>
    set({
      selectedPaymentId: paymentId,
    }),

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
      const updated = { ...state.payments };
      delete updated[jobId];

      return {
        payments: updated,
      };
    }),

  setLoading: (value) =>
    set({
      isLoading: value,
    }),

  setSubmitting: (value) =>
    set({
      isSubmitting: value,
    }),

  setError: (error) =>
    set({
      error,
    }),

  // ─────────────────────────────
  // DERIVED
  // ─────────────────────────────

  getJobPayments: (jobId) => {
    return get().payments[jobId] || [];
  },

  getTotalPaid: (jobId) => {
    return (get().payments[jobId] || []).reduce((sum, p) => sum + p.amount, 0);
  },

  getPaymentStatus: (jobId, totalDue) => {
    const totalPaid = (get().payments[jobId] || []).reduce(
      (sum, p) => sum + p.amount,
      0,
    );

    if (totalPaid <= 0) return "UNPAID";
    if (totalPaid < totalDue) return "PARTIAL";

    return "PAID";
  },
});
