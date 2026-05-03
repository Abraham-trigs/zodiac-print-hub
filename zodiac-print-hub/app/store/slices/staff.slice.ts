import { StateCreator } from "zustand";
import { Staff, StaffStatus } from "@prisma/client";
import { apiClient } from "@root/lib/api/client";

// Joined type for UI hydration
export type StaffWithUser = Staff & {
  user: { name: string; email: string; image?: string };
};

export interface StaffSlice {
  staffState: {
    staff: Record<string, StaffWithUser>;
    isLoading: boolean;
    error: string | null;
  };
  loadStaff: (orgId: string) => Promise<void>;
  applyStaffAssigned: (staffId: string, jobId: string) => void;
  applyStaffStatus: (staffId: string, status: StaffStatus) => void;
}

export const createStaffSlice: StateCreator<StaffSlice> = (set, get) => ({
  staffState: { staff: {}, isLoading: false, error: null },

  loadStaff: async (orgId) => {
    set((s) => ({ staffState: { ...s.staffState, isLoading: true } }));
    try {
      const res = await apiClient<{ data: StaffWithUser[] }>("/api/staff");
      const data = res?.data ?? [];
      set((s) => ({
        staffState: {
          ...s.staffState,
          staff: data.reduce((acc, st) => ({ ...acc, [st.id]: st }), {}),
        },
      }));
    } catch (err: any) {
      set((s) => ({ staffState: { ...s.staffState, error: err.message } }));
    } finally {
      set((s) => ({ staffState: { ...s.staffState, isLoading: false } }));
    }
  },

  applyStaffAssigned: (staffId, jobId) =>
    set((state) => {
      const existing = state.staffState.staff[staffId];
      if (!existing) return state;
      return {
        staffState: {
          ...state.staffState,
          staff: {
            ...state.staffState.staff,
            [staffId]: {
              ...existing,
              currentJobId: jobId,
              status: StaffStatus.BUSY,
            },
          },
        },
      };
    }),

  applyStaffStatus: (staffId, status) =>
    set((state) => {
      const existing = state.staffState.staff[staffId];
      if (!existing) return state;
      return {
        staffState: {
          ...state.staffState,
          staff: {
            ...state.staffState.staff,
            [staffId]: { ...existing, status },
          },
        },
      };
    }),
});
