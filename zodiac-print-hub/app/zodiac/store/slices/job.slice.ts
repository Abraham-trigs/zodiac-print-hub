import { StateCreator } from "zustand";
import { JobTicket } from "@/types/zodiac.types";

export interface JobSlice {
  jobs: JobTicket[];

  // UI state only
  setJobs: (data: JobTicket[]) => void;
  addJob: (job: JobTicket) => void;
  updateJob: (id: string, patch: Partial<JobTicket>) => void;
  removeJob: (id: string) => void;
}

export const createJobSlice: StateCreator<JobSlice> = (set) => ({
  jobs: [],

  setJobs: (data) => set({ jobs: data }),

  addJob: (job) =>
    set((state) => ({
      jobs: [job, ...state.jobs],
    })),

  updateJob: (id, patch) =>
    set((state) => ({
      jobs: state.jobs.map((j) => (j.id === id ? { ...j, ...patch } : j)),
    })),

  removeJob: (id) =>
    set((state) => ({
      jobs: state.jobs.filter((j) => j.id !== id),
    })),
});
