import { StateCreator } from "zustand";
import { StaffMember, StaffStatus } from "@/types/zodiac.types";

export interface StaffSlice {
  staff: StaffMember[];

  setStaff: (data: StaffMember[]) => void;
  addStaff: (staff: StaffMember) => void;
  updateStaff: (id: string, patch: Partial<StaffMember>) => void;
  setStaffStatus: (id: string, status: StaffStatus) => void;
  assignCurrentJob: (id: string, jobId?: string) => void;
}

export const createStaffSlice: StateCreator<StaffSlice> = (set) => ({
  staff: [],

  setStaff: (data) => set({ staff: data }),

  addStaff: (staff) =>
    set((state) => ({
      staff: [staff, ...state.staff],
    })),

  updateStaff: (id, patch) =>
    set((state) => ({
      staff: state.staff.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    })),

  setStaffStatus: (id, status) =>
    set((state) => ({
      staff: state.staff.map((s) => (s.id === id ? { ...s, status } : s)),
    })),

  assignCurrentJob: (id, jobId) =>
    set((state) => ({
      staff: state.staff.map((s) =>
        s.id === id ? { ...s, currentJobId: jobId } : s,
      ),
    })),

  applyStaffAssigned: (staffId, jobId) =>
    set((state) => ({
      staff: state.staff.map((s) =>
        s.id === staffId ? { ...s, currentJobId: jobId, status: "BUSY" } : s,
      ),
    })),

  applyStaffStatus: (staffId, status) =>
    set((state) => ({
      staff: state.staff.map((s) => (s.id === staffId ? { ...s, status } : s)),
    })),
});
