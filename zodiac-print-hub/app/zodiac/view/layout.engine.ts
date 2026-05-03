"use client";

import { SCREEN_MAP, ScreenID } from "../view/screen.registry";
import { ViewMode } from "@store/zodiac.store";
import { useModalStore } from "@/store/useModalStore";

type LayoutState = {
  topHeightStyle: string;
  showDownZone: boolean;

  TopZoneComponent?: React.FC;
  DownZoneComponent?: React.FC;

  isDetail: boolean;
  isLockedToDetail: boolean;

  hasGlobalModal: boolean;
  hasDetailModal: boolean;

  // 🆕 transition layer
  isTransitioning: boolean;
};

let lastScreenId: ScreenID | null = null;

export function resolveLayout(
  activeScreenId: ScreenID,
  viewMode: ViewMode,
): LayoutState {
  const screenConfig = SCREEN_MAP[activeScreenId];
  const isDetail = viewMode === "DETAIL";

  const modalState = useModalStore.getState();

  const hasGlobalModal = !!modalState.activeGlobalComponent;
  const hasDetailModal = !!modalState.activeDetailComponent;

  // ---------------- TRANSITION DETECTION ----------------
  const isScreenChange =
    lastScreenId !== null && lastScreenId !== activeScreenId;

  lastScreenId = activeScreenId;

  const isLockedToDetail = isDetail || hasGlobalModal || hasDetailModal;

  // ---------------- CUSTOM HEIGHT OVERRIDE ----------------
  let calculatedHeight = "40%"; // Default

  if (isLockedToDetail) {
    calculatedHeight = "100%";
  } else if (
    activeScreenId === "JOB_INTAKE" ||
    activeScreenId === "PRICE_CREATION"
  ) {
    // ✅ Custom height for both Intake and Price Creation Screens
    calculatedHeight = "60%";
  }

  return {
    // ---------------- CORE LAYOUT ----------------
    topHeightStyle: calculatedHeight,
    showDownZone: !isLockedToDetail,

    TopZoneComponent: screenConfig?.TopComponent,
    DownZoneComponent: screenConfig?.DownComponent,

    // ---------------- STATE FLAGS ----------------
    isDetail,
    isLockedToDetail,
    hasGlobalModal,
    hasDetailModal,

    // ---------------- TRANSITION SYSTEM ----------------
    isTransitioning: isScreenChange,
  };
}
