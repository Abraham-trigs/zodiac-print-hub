"use client";

import { useCallback } from "react";
import { useZodiac } from "../../store/zodiac.store";
import { useProcess } from "@root/lib/hooks/useProcess";
import { SUBSCRIPTION_STEPS } from "../../process/subscription/steps";
import { SubscriptionData } from "../../process/subscription/types";

// Forms
import { IdentityForm } from "./IdentityForm";
import { LocationForm } from "./LocationForm";
import { StockForm } from "../../ui/common/StockForm";
import { PlanSelectionForm } from "./PlanSelectionForm";

// New Integrated Button
import { ProcessStepButton } from "../../ui/ProcessStepButton";

const STEP_COMPONENTS = {
  IDENTITY: IdentityForm,
  LOCATION: LocationForm,
  PLANS: PlanSelectionForm,
  STOCK: StockForm,
} as const;

export const SubscriptionScreen = {
  id: "SUBSCRIPTION",
  layoutMode: "DETAIL",

  TopComponent: () => {
    const setScreen = useZodiac((s) => s.setScreen);

    const handleComplete = useCallback(
      (finalData: SubscriptionData) => {
        // Trigger Payment Shot if not FREE, else go to Job Selection
        if (finalData.planId && finalData.planId !== "FREE") {
          console.log("Redirecting to Payment...");
          // openModal("GLOBAL", PaymentModal) logic goes here
        } else {
          setScreen("JOB_SELECTION");
        }
      },
      [setScreen],
    );

    const { currentStep, data, updateData } = useProcess(
      "SUBSCRIPTION",
      SUBSCRIPTION_STEPS,
      handleComplete,
    );

    const activeStepId = SUBSCRIPTION_STEPS[currentStep].id;
    const ActiveStep =
      STEP_COMPONENTS[activeStepId as keyof typeof STEP_COMPONENTS];

    // Check if we are at the very end
    const isLastStep = currentStep === SUBSCRIPTION_STEPS.length - 1;

    return (
      <div className="flex flex-col h-full gap-6 p-4">
        {/* 1. PROGRESS BAR */}
        <div className="flex gap-2">
          {SUBSCRIPTION_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                i <= currentStep ? "bg-cyan-400" : "bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* 2. STEP CONTENT */}
        <div className="flex-1 overflow-y-auto">
          {ActiveStep ? <ActiveStep data={data} onUpdate={updateData} /> : null}
        </div>

        {/* 3. THE NEW SMART BUTTON BAR */}
        <div className="pt-4 border-t border-white/5">
          <ProcessStepButton
            processId="SUBSCRIPTION"
            totalSteps={SUBSCRIPTION_STEPS.length}
            // Only pass a real ScreenID when we are actually done
            nextScreenId={isLastStep ? "JOB_SELECTION" : undefined}
            onSave={handleComplete}
            onCancel={() => setScreen("WELCOME")}
          />
        </div>
      </div>
    );
  },
};
