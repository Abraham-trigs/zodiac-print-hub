"use client";

import { useProcessStore } from "../zodiac/store/process.store";
import { ScreenID } from "../zodiac/view/screen.registry";

interface ProcessStepButtonProps {
  processId: string;
  nextScreenId?: ScreenID; // Made optional for internal steps
  totalSteps: number;
  onSave?: (data: any) => void;
  onCancel?: () => void;
}

export function ProcessStepButton({
  processId,
  nextScreenId,
  totalSteps,
  onSave,
  onCancel,
}: ProcessStepButtonProps) {
  const { sessions, updateStep, goBack } = useProcessStore();

  const session = sessions[processId] || {
    currentStep: 0,
    history: [],
    data: {},
  };
  const { currentStep, history, data } = session;

  const isLastStep = currentStep === totalSteps - 1;

  // 🔥 Updated: Can go back if we are past Step 0, regardless of history length
  const canGoBack = currentStep > 0;

  const handleNextAction = () => {
    if (isLastStep) {
      onSave?.(data);
    } else {
      updateStep(processId, currentStep + 1, nextScreenId);
    }
  };

  const handleBackAction = () => {
    if (canGoBack) {
      goBack(processId);
    } else {
      onCancel?.();
    }
  };

  return (
    <div className="flex items-center gap-3 w-full mt-6">
      {/* SECONDARY / BACK BUTTON */}
      <button
        type="button"
        onClick={handleBackAction}
        className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
      >
        {canGoBack ? "← Back" : "✕ Cancel"}
      </button>

      {/* PRIMARY / NEXT BUTTON */}
      <button
        type="button"
        onClick={handleNextAction}
        className={`flex-[2] py-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg ${
          isLastStep
            ? "bg-orange-500 text-white shadow-orange-500/20"
            : "bg-cyan-500 text-black shadow-cyan-500/20"
        }`}
      >
        {isLastStep ? "Complete & Save" : "Continue →"}
      </button>
    </div>
  );
}
