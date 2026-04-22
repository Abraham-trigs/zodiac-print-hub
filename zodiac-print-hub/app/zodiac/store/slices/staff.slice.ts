import { StateCreator } from "zustand";
import { StaffMember, StaffStatus } from "@/types/zodiac.types";

export interface StaffSlice {
  staff: Record<string, StaffMember>;

  setStaff: (data: StaffMember[]) => void;
  addStaff: (staff: StaffMember) => void;
  updateStaff: (id: string, patch: Partial<StaffMember>) => void;
  setStaffStatus: (id: string, status: StaffStatus) => void;
  assignCurrentJob: (id: string, jobId?: string) => void;

  applyStaffAssigned: (staffId: string, jobId: string) => void;
  applyStaffStatus: (staffId: string, status: StaffStatus) => void;
}

export const createStaffSlice: StateCreator<StaffSlice> = (set) => ({
  staff: {},

  setStaff: (data) =>
    set(() => ({
      staff: data.reduce(
        (acc, s) => {
          acc[s.id] = s;
          return acc;
        },
        {} as Record<string, StaffMember>,
      ),
    })),

  addStaff: (staff) =>
    set((state) => ({
      staff: {
        ...state.staff,
        [staff.id]: staff,
      },
    })),

  updateStaff: (id, patch) =>
    set((state) => {
      const existing = state.staff[id];
      if (!existing) return state;

      return {
        staff: {
          ...state.staff,
          [id]: { ...existing, ...patch },
        },
      };
    }),

  setStaffStatus: (id, status) =>
    set((state) => ({
      staff: {
        ...state.staff,
        [id]: { ...state.staff[id], status },
      },
    })),

  assignCurrentJob: (id, jobId) =>
    set((state) => ({
      staff: {
        ...state.staff,
        [id]: { ...state.staff[id], currentJobId: jobId },
      },
    })),

  applyStaffAssigned: (staffId, jobId) =>
    set((state) => ({
      staff: {
        ...state.staff,
        [staffId]: {
          ...state.staff[staffId],
          currentJobId: jobId,
          status: "BUSY",
        },
      },
    })),

  applyStaffStatus: (staffId, status) =>
    set((state) => ({
      staff: {
        ...state.staff,
        [staffId]: { ...state.staff[staffId], status },
      },
    })),
});
