// src/store/slices/job.slice.ts
import { StateCreator } from "zustand";
import { Job, JobVariable } from "@prisma/client";
import { apiClient } from "@root/lib/api/client";
import { ProductionCalculator } from "@/lib/utils/production-calculator";
import { PriceListFull } from "./price.slice";

/* =========================================================
   TYPES (ALIGNED WITH PRODUCTION SNAPSHOTS)
========================================================= */

export type JobFull = Job & {
  variables?: JobVariable[];
  client?: { name: string; phone: string };
};

export interface JobSlice {
  jobState: {
    jobs: Record<string, JobFull>;
    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;
  };

  // ACTIONS
  setJobs: (data: JobFull[]) => void;
  loadJobs: (orgId: string) => Promise<void>;

  /**
   * 🚀 LIVE CALCULATION ENGINE
   * Called by the Modal to show real-time price updates
   */
  getLiveCalculation: (params: {
    priceItem: PriceListFull;
    quantity: number;
    width?: number;
    height?: number;
  }) => any;

  // MUTATIONS
  createJob: (payload: any) => Promise<void>;
  updateStatus: (id: string, status: string) => Promise<void>;
}

/* =========================================================
   SLICE IMPLEMENTATION
========================================================= */

export const createJobSlice: StateCreator<JobSlice> = (set, get) => ({
  jobState: {
    jobs: {},
    isLoading: false,
    isSubmitting: false,
    error: null,
  },

  setJobs: (data) =>
    set((state) => ({
      jobState: {
        ...state.jobState,
        jobs: data.reduce(
          (acc, job) => {
            acc[job.id] = job;
            return acc;
          },
          {} as Record<string, JobFull>,
        ),
      },
    })),

  /* --- REAL-TIME CALCULATION --- */
  getLiveCalculation: ({ priceItem, quantity, width, height }) => {
    // This uses the SAME logic as the backend
    return ProductionCalculator.calculate({
      quantity,
      width,
      height,
      unit: priceItem.material?.unit ?? "piece",
      salePrice: priceItem.salePrice,
      purchasePrice: priceItem.material?.purchasePrice ?? 0,
      mCalcType: priceItem.material?.calcType,
      sCalcType: priceItem.service?.calcType,
    });
  },

  /* --- READ --- */
  loadJobs: async (orgId: string) => {
    set((s) => ({ jobState: { ...s.jobState, isLoading: true } }));
    try {
      const res = await apiClient<{ data: JobFull[] }>("/api/jobs", {
        query: { orgId },
      });
      get().setJobs(res?.data ?? []);
    } finally {
      set((s) => ({ jobState: { ...s.jobState, isLoading: false } }));
    }
  },

  /* --- CREATE --- */
  createJob: async (payload) => {
    set((s) => ({
      jobState: { ...s.jobState, isSubmitting: true, error: null },
    }));
    try {
      const res = await apiClient<{ data: JobFull }>("/api/jobs", {
        method: "POST",
        body: payload,
      });

      if (res?.data) {
        const newJob = res.data;
        set((state) => ({
          jobState: {
            ...state.jobState,
            jobs: { ...state.jobState.jobs, [newJob.id]: newJob },
          },
        }));

        // 🔥 CROSS-SLICE REFRESH:
        // Sync Inventory counts because a Job just deducted stock
        const store = get() as any;
        if (store.loadInventory) await store.loadInventory();
      }
    } catch (e: any) {
      set((s) => ({ jobState: { ...s.jobState, error: e.message } }));
    } finally {
      set((s) => ({ jobState: { ...s.jobState, isSubmitting: false } }));
    }
  },

  /* --- UPDATE --- */
  updateStatus: async (id, status) => {
    try {
      const res = await apiClient<{ data: JobFull }>(`/api/jobs/${id}`, {
        method: "PATCH",
        body: { status },
      });

      if (res?.data) {
        set((state) => ({
          jobState: {
            ...state.jobState,
            jobs: { ...state.jobState.jobs, [id]: res.data },
          },
        }));
      }
    } catch (e: any) {
      console.error("Status update failed", e);
    }
  },
});
