import { StepBlueprint } from "./types";

export const SUBSCRIPTION_STEPS: StepBlueprint[] = [
  {
    id: "IDENTITY",
    actions: ["cancel", "next"], // First step: can't go back, only cancel or move forward
  },
  {
    id: "LOCATION",
    actions: ["back", "next"],
  },
  {
    id: "PLANS",
    actions: ["back", "next"], // 🔥 Fixed: Now a valid array of actions
  },
  {
    id: "STOCK",
    actions: ["back", "next"], // Final step: ProcessStepButton will handle the 'next' as 'Save'
  },
];
