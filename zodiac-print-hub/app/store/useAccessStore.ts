import { create } from "zustand";
import { persist } from "zustand/middleware";

type Role = "ADMIN" | "OPERATOR" | "CASHIER" | "GUEST";
type Plan = "FREE" | "GROW" | "DOMINATE";

interface AccessState {
  userRole: Role;
  subscription: Plan;

  // 🔥 NEW: hydration gate
  hydrated: boolean;

  // Actions
  setRole: (role: Role) => void;
  setSubscription: (plan: Plan) => void;
  setHydrated: (value: boolean) => void;

  // Bootstrap (NEW)
  bootstrapAccess: () => Promise<void>;

  // Logic Helpers
  getJobLimit: () => number;
  can: (
    permission:
      | "EDIT_PRICES"
      | "VIEW_SETTINGS"
      | "DELETE_DATA"
      | "ADVANCED_ANALYTICS",
  ) => boolean;
}

export const useAccessStore = create<AccessState>()(
  persist(
    (set, get) => ({
      userRole: "ADMIN",
      subscription: "FREE",
      hydrated: false,

      setRole: (role) => set({ userRole: role }),
      setSubscription: (plan) => set({ subscription: plan }),
      setHydrated: (value) => set({ hydrated: value }),

      // 🔥 BOOTSTRAP (replace later with real auth/session)
      bootstrapAccess: async () => {
        const mockSession = {
          role: "ADMIN" as Role,
          plan: "FREE" as Plan,
        };

        set({
          userRole: mockSession.role,
          subscription: mockSession.plan,
          hydrated: true,
        });
      },

      getJobLimit: () => {
        const { subscription } = get();

        const limits: Record<Plan, number> = {
          FREE: 10,
          GROW: 100,
          DOMINATE: Infinity,
        };

        return limits[subscription];
      },

      can: (permission) => {
        const { userRole, subscription } = get();

        const permissions: Record<Role, string[]> = {
          ADMIN: [
            "EDIT_PRICES",
            "VIEW_SETTINGS",
            "DELETE_DATA",
            "ADVANCED_ANALYTICS",
          ],
          OPERATOR: [],
          CASHIER: [],
          GUEST: [],
        };

        if (permission === "ADVANCED_ANALYTICS" && subscription === "FREE") {
          return false;
        }

        return permissions[userRole]?.includes(permission) ?? false;
      },
    }),
    { name: "zodiac-access-storage" },
  ),
);
