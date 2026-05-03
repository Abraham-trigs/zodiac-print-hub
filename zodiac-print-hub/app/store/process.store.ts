"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useZodiac } from "./zodiac.store";

interface ProcessState {
  currentStep: number;
  data: Record<string, any>;
  history: string[];
}

interface ProcessStore {
  sessions: Record<string, ProcessState>;
  updateStep: (
    processId: string,
    step: number,
    targetScreenId?: string,
  ) => void;
  goBack: (processId: string) => void;
  updateData: (processId: string, newData: Record<string, any>) => void;
  resetProcess: (processId: string) => void;
  getProcess: (processId: string) => ProcessState;
}

export const useProcessStore = create<ProcessStore>()(
  persist(
    (set, get) => ({
      sessions: {},

      getProcess: (id) => {
        return get().sessions[id] || { currentStep: 0, data: {}, history: [] };
      },

      updateStep: (id, step, targetScreenId) => {
        const currentScreen = useZodiac.getState().activeScreenId;

        // 1. Physical Navigation (Only if it's a new screen)
        if (targetScreenId && targetScreenId !== currentScreen) {
          useZodiac.getState().setScreen(targetScreenId as any);
        }

        // 2. Update Progress & History
        set((state) => {
          const prev = state.sessions[id] || {
            currentStep: 0,
            data: {},
            history: [],
          };

          // 🔥 Only add to history if we are actually leaving the current screen
          const isNewScreen =
            targetScreenId && targetScreenId !== currentScreen;
          const newHistory = isNewScreen
            ? [...prev.history, currentScreen]
            : prev.history;

          return {
            sessions: {
              ...state.sessions,
              [id]: {
                ...prev,
                currentStep: step,
                history: newHistory,
              },
            },
          };
        });
      },

      goBack: (id) => {
        const session = get().sessions[id];
        if (!session) return;

        // 🔥 Case A: Internal step back (stay on same screen)
        if (
          session.currentStep > 0 &&
          session.history.length <= session.currentStep
        ) {
          set((state) => ({
            sessions: {
              ...state.sessions,
              [id]: { ...session, currentStep: session.currentStep - 1 },
            },
          }));
          return;
        }

        // 🔥 Case B: Screen back (requires navigation)
        const newHistory = [...session.history];
        const lastScreen = newHistory.pop();

        if (lastScreen) {
          useZodiac.getState().setScreen(lastScreen as any);
        }

        set((state) => ({
          sessions: {
            ...state.sessions,
            [id]: {
              ...session,
              currentStep: Math.max(0, session.currentStep - 1),
              history: newHistory,
            },
          },
        }));
      },

      updateData: (id, newData) =>
        set((state) => {
          const prev = state.sessions[id] || {
            currentStep: 0,
            data: {},
            history: [],
          };
          const prevData = prev.data;
          const hasChange = Object.keys(newData).some(
            (key) => prevData[key] !== newData[key],
          );

          if (!hasChange) return state;

          return {
            sessions: {
              ...state.sessions,
              [id]: { ...prev, data: { ...prevData, ...newData } },
            },
          };
        }),

      resetProcess: (id) =>
        set((state) => {
          const newSessions = { ...state.sessions };
          delete newSessions[id];
          return { sessions: newSessions };
        }),
    }),
    {
      name: "zodiac-process-memory",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : undefined,
      ),
    },
  ),
);

// "use client";

// import { create } from "zustand";
// import { persist, createJSONStorage } from "zustand/middleware";

// import type {
//   LoadingMap,
//   ErrorMap,
//   LoadingKey,
//   ErrorKey,
// } from "@/types/zodiac.types";

// interface ProcessState {
//   loading: LoadingMap;
//   errors: ErrorMap;

//   // ─────────────────────────────
//   // CORE CONTROL
//   // ─────────────────────────────
//   start: (key: LoadingKey) => void;
//   stop: (key: LoadingKey) => void;
//   fail: (key: ErrorKey, message: string) => void;
//   clearError: (key: ErrorKey) => void;

//   reset: () => void;

//   // ─────────────────────────────
//   // SAFE HELPERS
//   // ─────────────────────────────
//   isLoading: (key: LoadingKey) => boolean;
//   getError: (key: ErrorKey) => string | null | undefined;
// }

// const initialState = {
//   loading: {},
//   errors: {},
// };

// export const useProcessStore = create<ProcessState>()(
//   persist(
//     (set, get) => ({
//       ...initialState,

//       // START LOADING
//       start: (key) =>
//         set((state) => ({
//           loading: {
//             ...state.loading,
//             [key]: true,
//           },
//           errors: {
//             ...state.errors,
//             [key]: null,
//           },
//         })),

//       // STOP LOADING
//       stop: (key) =>
//         set((state) => ({
//           loading: {
//             ...state.loading,
//             [key]: false,
//           },
//         })),

//       // FAIL STATE
//       fail: (key, message) =>
//         set((state) => ({
//           loading: {
//             ...state.loading,
//             [key]: false,
//           },
//           errors: {
//             ...state.errors,
//             [key]: message,
//           },
//         })),

//       clearError: (key) =>
//         set((state) => ({
//           errors: {
//             ...state.errors,
//             [key]: null,
//           },
//         })),

//       reset: () => set(initialState),

//       // HELPERS
//       isLoading: (key) => !!get().loading[key],
//       getError: (key) => get().errors[key],
//     }),
//     {
//       name: "zodiac-process-store",
//       storage: createJSONStorage(() => localStorage),
//     },
//   ),
// );
