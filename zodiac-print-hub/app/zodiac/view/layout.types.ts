import { ComponentType } from "react";

export type ViewMode = "SPLIT" | "DETAIL";

// Included DETAIL and GLOBAL to match your 4-layer shell
export type ModalZone = "TOP" | "DOWN" | "DETAIL" | "GLOBAL";

export type ZodiacViewState = {
  // We store the Component itself, not a string ID
  activeTopComponent: ComponentType<any> | null;
  activeDownComponent: ComponentType<any> | null;
  activeDetailComponent: ComponentType<any> | null;
  activeGlobalComponent: ComponentType<any> | null;

  viewMode: ViewMode;
  focusMode: boolean;
};
