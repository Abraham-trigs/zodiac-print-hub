import { StateCreator } from "zustand";
import { JobTicket } from "@/types/zodiac.types";

export interface JobSlice {
  jobs: Record<string, JobTicket>;

  // UI state only
  setJobs: (data: JobTicket[]) => void;
  addJob: (job: JobTicket) => void;
  updateJob: (id: string, patch: Partial<JobTicket>) => void;
  removeJob: (id: string) => void;
}

export const createJobSlice: StateCreator<JobSlice> = (set) => ({
  jobs: {},

  setJobs: (data) =>
    set(() => ({
      jobs: data.reduce(
        (acc, job) => {
          acc[job.id] = job;
          return acc;
        },
        {} as Record<string, JobTicket>,
      ),
    })),

  addJob: (job) =>
    set((state) => ({
      jobs: {
        ...state.jobs,
        [job.id]: job,
      },
    })),

  updateJob: (id, patch) =>
    set((state) => {
      const existing = state.jobs[id];
      if (!existing) return state;

      return {
        jobs: {
          ...state.jobs,
          [id]: { ...existing, ...patch },
        },
      };
    }),

  removeJob: (id) =>
    set((state) => {
      const { [id]: _, ...rest } = state.jobs;
      return { jobs: rest };
    }),
});
