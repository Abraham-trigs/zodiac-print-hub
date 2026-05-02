import { StateCreator } from "zustand";
import {
  Supplier,
  StockPurchaseOrder,
  StockPurchaseItem,
} from "@prisma/client";
import { apiClient } from "@root/lib/api/client";

export type StockPurchaseOrderFull = StockPurchaseOrder & {
  supplier: Supplier;
  items: (StockPurchaseItem & { material: { name: string } })[];
};

export interface ProcurementSlice {
  procurementState: {
    suppliers: Record<string, Supplier>;
    activeOrders: Record<string, StockPurchaseOrderFull>;
    suggestions: any; // Result of the "Advanced Restocking" brain
    isLoading: boolean;
    error: string | null;
  };

  // --- PHASE 1: SUPPLIER REGISTRY ---
  loadSuppliers: () => Promise<void>;
  createSupplier: (data: Partial<Supplier>) => Promise<void>;
  updateSupplier: (id: string, data: Partial<Supplier>) => Promise<void>;

  // --- PHASE 2 & 3: ORDERING ---
  loadPurchaseOrders: () => Promise<void>;
  createPurchaseOrder: (payload: {
    supplierId: string;
    items: { materialId: string; quantity: number; unitPrice: number }[];
    relatedJobId?: string;
  }) => Promise<void>;

  // --- PHASE 2: SHORTFALL CHECK ---
  checkJobShortfall: (jobId: string) => Promise<any>;

  // --- PHASE 4: VELOCITY ANALYTICS ---
  loadVelocityAnalytics: () => Promise<void>;
}

export const createProcurementSlice: StateCreator<ProcurementSlice> = (
  set,
  get,
) => ({
  procurementState: {
    suppliers: {},
    activeOrders: {},
    suggestions: null,
    isLoading: false,
    error: null,
  },

  /* --- SUPPLIER LOGIC --- */
  loadSuppliers: async () => {
    set((s) => ({
      procurementState: { ...s.procurementState, isLoading: true },
    }));
    try {
      const res = await apiClient<{ data: Supplier[] }>(
        "/api/procurement/suppliers",
      );
      const data = res?.data ?? [];
      set((s) => ({
        procurementState: {
          ...s.procurementState,
          suppliers: data.reduce((acc, sup) => ({ ...acc, [sup.id]: sup }), {}),
        },
      }));
    } finally {
      set((s) => ({
        procurementState: { ...s.procurementState, isLoading: false },
      }));
    }
  },

  createSupplier: async (data) => {
    try {
      const res = await apiClient<{ data: Supplier }>(
        "/api/procurement/suppliers",
        {
          method: "POST",
          body: data,
        },
      );
      if (res?.data) {
        set((s) => ({
          procurementState: {
            ...s.procurementState,
            suppliers: {
              ...s.procurementState.suppliers,
              [res.data.id]: res.data,
            },
          },
        }));
      }
    } catch (e: any) {
      console.error("Supplier creation failed", e);
    }
  },

  updateSupplier: async (id, data) => {
    try {
      const res = await apiClient<{ data: Supplier }>(
        `/api/procurement/suppliers/${id}`,
        {
          method: "PATCH",
          body: data,
        },
      );
      if (res?.data) {
        set((s) => ({
          procurementState: {
            ...s.procurementState,
            suppliers: { ...s.procurementState.suppliers, [id]: res.data },
          },
        }));
      }
    } catch (e: any) {
      console.error("Supplier update failed", e);
    }
  },

  /* --- PROCUREMENT LOGIC --- */
  loadPurchaseOrders: async () => {
    set((s) => ({
      procurementState: { ...s.procurementState, isLoading: true },
    }));
    try {
      const res = await apiClient<{ data: StockPurchaseOrderFull[] }>(
        "/api/procurement/orders",
      );
      const data = res?.data ?? [];
      set((s) => ({
        procurementState: {
          ...s.procurementState,
          activeOrders: data.reduce((acc, po) => ({ ...acc, [po.id]: po }), {}),
        },
      }));
    } finally {
      set((s) => ({
        procurementState: { ...s.procurementState, isLoading: false },
      }));
    }
  },

  createPurchaseOrder: async (payload) => {
    set((s) => ({
      procurementState: { ...s.procurementState, isLoading: true },
    }));
    try {
      const res = await apiClient<{ data: StockPurchaseOrderFull }>(
        "/api/procurement/orders",
        {
          method: "POST",
          body: payload,
        },
      );
      if (res?.data) {
        set((s) => ({
          procurementState: {
            ...s.procurementState,
            activeOrders: {
              ...s.procurementState.activeOrders,
              [res.data.id]: res.data,
            },
          },
        }));
      }
    } finally {
      set((s) => ({
        procurementState: { ...s.procurementState, isLoading: false },
      }));
    }
  },

  /**
   * checkJobShortfall
   * 🔥 Phase 2 Handshake: Used by the Job Entry Modal or Job Details
   * to warn the user about inventory gaps.
   */
  checkJobShortfall: async (jobId: string) => {
    try {
      const res = await apiClient<{ data: any }>(
        `/api/procurement/shortfall/${jobId}`,
      );
      return res?.data;
    } catch (e) {
      console.error("Shortfall check failed", e);
      return null;
    }
  },

  /* --- PHASE 4: VELOCITY ANALYTICS --- */
  loadVelocityAnalytics: async () => {
    set((s) => ({
      procurementState: { ...s.procurementState, isLoading: true },
    }));
    try {
      const res = await apiClient<{ data: any[] }>(
        "/api/procurement/analytics/velocity",
      );
      set((s) => ({
        procurementState: {
          ...s.procurementState,
          suggestions: res?.data ?? [],
        },
      }));
    } finally {
      set((s) => ({
        procurementState: { ...s.procurementState, isLoading: false },
      }));
    }
  },
});
