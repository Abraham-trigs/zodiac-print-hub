"use client";

import { StateCreator } from "zustand";
import { PrintLayoutBuilder as BuilderLogic } from "@components/workstation/production/PrintLayoutBuilder";
import { apiClient } from "@lib/client/api/client";

export interface PrintLayoutSlice {
  layoutState: {
    activeLayout: {
      materialId: string;
      rollWidth: number;
      items: any[];
      cutLineHeight: number;
      efficiency: number;
      wasteArea: number;
    } | null;
    isSubmitting: boolean;
    error: string | null;
  };

  // UI State Management
  initNewLayout: (materialId: string, rollWidth: number) => void;
  addItemToLayout: (job: any, x: number, y: number, isRotated: boolean) => void;
  removeItemFromLayout: (jobId: string) => void;
  resetLayout: () => void;

  /**
   * shootLayout
   * 🔥 THE FINAL PUDH: Saves map and triggers physical stock deduction.
   */
  shootLayout: () => Promise<void>;
}

export const createPrintLayoutSlice: StateCreator<PrintLayoutSlice> = (
  set,
  get,
) => ({
  layoutState: {
    activeLayout: null,
    isSubmitting: false,
    error: null,
  },

  initNewLayout: (materialId, rollWidth) =>
    set((s) => ({
      layoutState: {
        ...s.layoutState,
        activeLayout: {
          materialId,
          rollWidth,
          items: [],
          cutLineHeight: 0,
          efficiency: 0,
          wasteArea: 0,
        },
      },
    })),

  addItemToLayout: (job, x, y, isRotated) => {
    const state = get().layoutState.activeLayout;
    if (!state) return;

    // 🚀 Reducer Logic: Calculate new metrics with the added job
    const updated = BuilderLogic.addItem(state, job, x, y, isRotated);

    set((s) => ({
      layoutState: {
        ...s.layoutState,
        activeLayout: updated,
      },
    }));
  },

  removeItemFromLayout: (jobId) => {
    const state = get().layoutState.activeLayout;
    if (!state) return;

    const filteredItems = state.items.filter((i) => i.jobId !== jobId);
    const updated = BuilderLogic.calculateMetrics({
      ...state,
      items: filteredItems,
    });

    set((s) => ({
      layoutState: {
        ...s.layoutState,
        activeLayout: updated,
      },
    }));
  },

  /**
   * SHOOT LAYOUT (Execution Pipeline)
   */
  shootLayout: async () => {
    const { activeLayout } = get().layoutState;
    if (!activeLayout || activeLayout.items.length === 0) return;

    set((s) => ({
      layoutState: { ...s.layoutState, isSubmitting: true, error: null },
    }));

    try {
      // 1. PERSIST THE MAP
      const res = await apiClient<{ data: { id: string } }>(
        "/api/production/layouts",
        {
          method: "POST",
          body: {
            ...activeLayout,
            totalWastedArea: activeLayout.wasteArea, // Syncing field names with schema
          },
        },
      );

      const layoutId = res.data?.id;

      // 2. TRIGGER PHYSICAL DEDUCTION
      if (layoutId) {
        await apiClient(`/api/production/layouts/${layoutId}/shoot`, {
          method: "POST",
        });

        // 3. UI CLEANUP & CROSS-SLICE SYNC
        get().resetLayout();

        // Refresh inventory to reflect the new roll length
        const store = get() as any;
        if (store.loadInventory) await store.loadInventory();
        if (store.loadJobs) await store.loadJobs(); // Refresh job statuses
      }
    } catch (err: any) {
      set((s) => ({
        layoutState: {
          ...s.layoutState,
          error: err.message || "Failed to shoot layout",
        },
      }));
    } finally {
      set((s) => ({ layoutState: { ...s.layoutState, isSubmitting: false } }));
    }
  },

  resetLayout: () =>
    set((s) => ({ layoutState: { ...s.layoutState, activeLayout: null } })),
});
