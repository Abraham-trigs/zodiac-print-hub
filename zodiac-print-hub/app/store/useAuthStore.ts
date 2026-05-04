"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient } from "@lib/client/api/client"; // 🚀 Aligned with your root structure

// 🚀 SYNCED: Matches your UserRole enum in schema.prisma
export type UserRole =
  | "ADMIN"
  | "STAFF"
  | "CUSTOMER"
  | "SUPPLIER"
  | "GUEST"
  | "GRAPHIC_DESIGNER";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  activeOrgId: string | null;
  isAuthenticated: boolean;

  // Actions
  setSession: (token: string, orgId: string, user: User) => void;
  logout: () => void;
  checkSession: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      activeOrgId: null,
      isAuthenticated: false,

      /**
       * SET_SESSION
       * Handshake after Magic Link verification.
       */
      setSession: (token, orgId, user) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("token", token);
          localStorage.setItem("active_org_id", orgId);
          localStorage.setItem("user_role", user.role);
        }

        set({
          token,
          activeOrgId: orgId,
          user,
          isAuthenticated: true,
        });
      },

      /**
       * LOGOUT
       * Complete system wipe.
       */
      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.clear(); // 🚀 Clean sweep for security
        }
        set({
          user: null,
          token: null,
          activeOrgId: null,
          isAuthenticated: false,
        });
        window.location.href = "/"; // 🚀 Redirect to Landing/Slug Discovery
      },

      /**
       * CHECK_SESSION
       * The 'Keep-Alive' handshake for page refreshes.
       */
      checkSession: async () => {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) return false;

        try {
          // 🚀 Calls the /api/auth/me route we just built
          const res = await apiClient<{ data: { user: User } }>("/api/auth/me");
          if (res.data?.user) {
            set({ user: res.data.user, isAuthenticated: true });
            return true;
          }
          return false;
        } catch (err) {
          console.error("[AUTH] Session check failed, logging out.");
          get().logout();
          return false;
        }
      },
    }),
    {
      name: "zodiac-auth-storage",
      // Only persist the non-sensitive state
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        activeOrgId: state.activeOrgId,
        user: state.user, // Keeping user profile in memory for UI branding
      }),
    },
  ),
);
