"use client";

import { useCallback } from "react";
import { useProcessStore } from "@store/process.store";

export function useProcess(
  processId: string,
  steps: { id: string; label: string }[],
  onComplete: (data: any) => void,
) {
  // 1. Correct the method names to match your Store
  const {
    sessions,
    updateStep,
    updateData: storeUpdateData,
  } = useProcessStore();

  const session = sessions[processId] || {
    currentStep: 0,
    data: {},
    history: [],
  };
  const { currentStep, data } = session;

  // Sync data updates
  const updateData = useCallback(
    (newData: any) => {
      storeUpdateData(processId, newData);
    },
    [processId, storeUpdateData],
  );

  // Note: 'next' and 'back' are now handled by ProcessStepButton,
  // but we keep them here for internal logic if needed.
  const next = useCallback(
    (targetScreen?: string) => {
      const isLast = currentStep >= steps.length - 1;
      if (isLast) {
        onComplete(data);
        return;
      }
      updateStep(processId, currentStep + 1, targetScreen);
    },
    [currentStep, steps.length, processId, updateStep, onComplete, data],
  );

  return {
    currentStep,
    data,
    updateData,
    next,
  };
}
