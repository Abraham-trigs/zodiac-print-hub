"use client";

import { StateCreator } from "zustand";
import { JobTicket } from "@/types/zodiac.types";
import { apiClient } from "@root/lib/api/client";

export interface JobSlice {
  jobState: {
    jobs: Record<string, JobTicket>;
    isLoading: boolean;
  };

  setJobs: (data: JobTicket[]) => void;
  addJob: (job: JobTicket) => void;
  updateJob: (id: string, patch: Partial<JobTicket>) => void;
  removeJob: (id: string) => void;

  loadJobs: (orgId: string) => Promise<JobTicket[]>;
}

export const createJobSlice: StateCreator<JobSlice> = (set, get) => ({
  // =========================================================
  // STATE
  // =========================================================
  jobState: {
    jobs: {},
    isLoading: false,
  },

  // =========================================================
  // HYDRATION
  // =========================================================
  setJobs: (data) =>
    set((state) => ({
      jobState: {
        ...state.jobState,
        jobs: data.reduce(
          (acc, job) => {
            acc[job.id] = job;
            return acc;
          },
          {} as Record<string, JobTicket>,
        ),
      },
    })),

  // =========================================================
  // LOAD (SERVER SOURCE OF TRUTH)
  // =========================================================
  loadJobs: async (orgId: string) => {
    set((state) => ({
      jobState: { ...state.jobState, isLoading: true },
    }));

    try {
      const res = await apiClient<{ data: JobTicket[] }>("/api/jobs", {
        query: { orgId },
      });

      const jobs = res?.data ?? [];

      get().setJobs(jobs);
      return jobs;
    } finally {
      set((state) => ({
        jobState: { ...state.jobState, isLoading: false },
      }));
    }
  },

  // =========================================================
  // LOCAL STATE OPS
  // =========================================================
  addJob: (job) =>
    set((state) => ({
      jobState: {
        ...state.jobState,
        jobs: { ...state.jobState.jobs, [job.id]: job },
      },
    })),

  updateJob: (id, patch) =>
    set((state) => {
      const existing = state.jobState.jobs[id];
      if (!existing) return state;

      return {
        jobState: {
          ...state.jobState,
          jobs: {
            ...state.jobState.jobs,
            [id]: { ...existing, ...patch },
          },
        },
      };
    }),

  removeJob: (id) =>
    set((state) => {
      const { [id]: _, ...rest } = state.jobState.jobs;

      return {
        jobState: {
          ...state.jobState,
          jobs: rest,
        },
      };
    }),
});
