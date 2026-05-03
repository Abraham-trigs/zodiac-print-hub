"use client";
import { StateCreator } from "zustand";
import type { Job, JobStatus, ProofStatus } from "@prisma/client";
import { apiClient } from "@client/api/client";

/**
 * JOB_SLICE
 * The central nervous system for production data.
 */
export interface JobSlice {
  jobState: {
    jobs: Record<string, Job>; // Normalized Map (id -> Job)
    activeJobId: string | null;
    isLoading: boolean;
    error: string | null;
  };

  // --- CORE ACTIONS ---
  loadJobs: () => Promise<void>;
  createJob: (payload: any) => Promise<Job | null>;
  updateJobStatus: (jobId: string, status: JobStatus) => Promise<void>;
  setActiveJob: (id: string | null) => void;

  // --- v2 INDUSTRIAL HANDSHAKES ---
  submitProof: (jobId: string, url: string) => Promise<void>;
  syncJobFromOutbox: (payload: any) => void;
}

export const createJobSlice: StateCreator<JobSlice> = (set, get) => ({
  jobState: {
    jobs: {},
    activeJobId: null,
    isLoading: false,
    error: null,
  },

  /**
   * LOAD_JOBS
   * Fetches the current production queue.
   */
  loadJobs: async () => {
    set((s) => ({ jobState: { ...s.jobState, isLoading: true } }));
    try {
      const res = await apiClient<{ data: Job[] }>("/api/jobs");
      const data = res?.data ?? [];

      // Normalize array into Record for high-speed lookups
      const jobMap = data.reduce((acc, job) => ({ ...acc, [job.id]: job }), {});

      set((s) => ({
        jobState: { ...s.jobState, jobs: jobMap, isLoading: false },
      }));
    } catch (err) {
      set((s) => ({
        jobState: { ...s.jobState, error: "Sync Failed", isLoading: false },
      }));
    }
  },

  /**
   * CREATE_JOB
   * Injects a new job into the ledger.
   */
  createJob: async (payload) => {
    try {
      const res = await apiClient<{ data: Job }>("/api/jobs", {
        method: "POST",
        body: payload,
      });

      if (res?.data) {
        set((s) => ({
          jobState: {
            ...s.jobState,
            jobs: { ...s.jobState.jobs, [res.data.id]: res.data },
          },
        }));
        return res.data;
      }
      return null;
    } catch (err) {
      console.error("Job Creation Error", err);
      return null;
    }
  },

  /**
   * SUBMIT_PROOF (Industrial Handshake)
   * Moves job to AWAITING and triggers WhatsApp Node.
   */
  submitProof: async (jobId, url) => {
    try {
      const res = await apiClient<{ data: Job }>(`/api/jobs/${jobId}/proof`, {
        method: "PATCH",
        body: { proofUrl: url },
      });

      if (res?.data) {
        set((s) => ({
          jobState: {
            ...s.jobState,
            jobs: { ...s.jobState.jobs, [jobId]: res.data },
          },
        }));
      }
    } catch (err) {
      console.error("Proof Submission Error", err);
    }
  },

  /**
   * UPDATE_JOB_STATUS
   * Direct state mutation for fast UI feedback.
   */
  updateJobStatus: async (jobId, status) => {
    try {
      const res = await apiClient<{ data: Job }>(`/api/jobs/${jobId}/status`, {
        method: "PATCH",
        body: { status },
      });

      if (res?.data) {
        set((s) => ({
          jobState: {
            ...s.jobState,
            jobs: { ...s.jobState.jobs, [jobId]: res.data },
          },
        }));
      }
    } catch (err) {
      console.error("Status Update Error", err);
    }
  },

  /**
   * SYNC_JOB_FROM_OUTBOX
   * The Real-Time Engine: Updates state when events arrive from Pusher/Sockets.
   */
  syncJobFromOutbox: (payload) => {
    const jobId = payload.jobId || payload.id;
    if (!jobId) return;

    set((s) => ({
      jobState: {
        ...s.jobState,
        jobs: {
          ...s.jobState.jobs,
          [jobId]: { ...s.jobState.jobs[jobId], ...payload },
        },
      },
    }));
  },

  setActiveJob: (id) =>
    set((s) => ({ jobState: { ...s.jobState, activeJobId: id } })),
});
