import { StateCreator } from "zustand";
import { JobTicket } from "@/types/zodiac.types";

export interface JobSlice {
  // We move the data into its own nested object to prevent collisions
  jobState: {
    jobs: Record<string, JobTicket>;
    isLoading: boolean;
  };

  // Actions
  setJobs: (data: JobTicket[]) => void;
  addJob: (job: JobTicket) => void;
  updateJob: (id: string, patch: Partial<JobTicket>) => void;
  removeJob: (id: string) => void;
  loadJobs: () => Promise<JobTicket[]>;
}

export const createJobSlice: StateCreator<JobSlice> = (set, get) => ({
  // Initial State nested inside jobState
  jobState: {
    jobs: {},
    isLoading: false,
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
          {} as Record<string, JobTicket>,
        ),
      },
    })),

  loadJobs: async () => {
    // Set loading state
    set((state) => ({ jobState: { ...state.jobState, isLoading: true } }));

    try {
      const res = await fetch("/api/jobs", {
        headers: {
          Authorization: "Bearer cmoa30is40001o0dwpfkom18r",
        },
      });

      if (!res.ok) throw new Error("Failed to load jobs");

      const json = await res.json();
      const jobs: JobTicket[] = json.data ?? [];

      // Hydrate
      get().setJobs(jobs);
      return jobs;
    } finally {
      // Clear loading state
      set((state) => ({ jobState: { ...state.jobState, isLoading: false } }));
    }
  },

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
        jobState: { ...state.jobState, jobs: rest },
      };
    }),
});
