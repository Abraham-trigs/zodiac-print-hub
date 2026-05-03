"use client";

import { useCallback } from "react";
// import { useZodiac } from "../../../zodiac/store/zodiac.store";
// // import { useProcess } from "@root/lib/client/hooks/useProcess";
// import { SUBSCRIPTION_STEPS } from "../../modals/process/subscription/steps";
// import { SubscriptionData } from "../../modals/process/subscription/types";

// // Forms
// import { IdentityForm } from "./IdentityForm";
// import { LocationForm } from "./LocationForm";
// // import { StockForm } from "../../../ui/common/StockForm";
// import { PlanSelectionForm } from "./PlanSelectionForm";

// // New Integrated Button
// import { ProcessStepButton } from "../../ProcessStepButton";

// const STEP_COMPONENTS = {
//   IDENTITY: IdentityForm,
//   LOCATION: LocationForm,
//   PLANS: PlanSelectionForm,
//   STOCK: StockForm,
// } as const;

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

    // const { currentStep, data, updateData } = useProcess(
    //   "SUBSCRIPTION",
    //   SUBSCRIPTION_STEPS,
    //   handleComplete,
    // );

    // const activeStepId = SUBSCRIPTION_STEPS[currentStep].id;
    // const ActiveStep =
    //   STEP_COMPONENTS[activeStepId as keyof typeof STEP_COMPONENTS];

    // // Check if we are at the very end
    // const isLastStep = currentStep === SUBSCRIPTION_STEPS.length - 1;

    return (
      <div className="flex flex-col h-full gap-6 p-4">
        <h1>Ideal Screen</h1>
      </div>
    );
  },
};
