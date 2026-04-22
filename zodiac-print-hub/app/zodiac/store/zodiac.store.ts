import { create } from "zustand";
import { SCREEN_MAP, ScreenID } from "../view/screen.registry";
import { getCachedScreen } from "../view/screen.cache";
import { screenPredictor } from "../view/screen.predictor";
import { useModalStore } from "../store/useModalStore";
// ✅ Import the routing utility
import { screenToPath } from "@view/screen.router";

export type ViewMode = "SPLIT" | "DETAIL";

export interface ButtonAction {
  label: string;
  type?: "NAVIGATE" | "BACK" | "MODAL_SWAP" | "CUSTOM";
  nextScreenId?: ScreenID;
  nextViewMode?: ViewMode;
  modalZone?: "TOP" | "DOWN" | "DETAIL" | "GLOBAL";
  modalComponent?: React.ComponentType<any>;
  isBack?: boolean;
  onPress?: () => void;
}

type NavEntry = {
  id: ScreenID;
  mode: ViewMode;
};

interface ZodiacState {
  activeScreenId: ScreenID;
  viewMode: ViewMode;
  sharedAction: ButtonAction | null;
  history: NavEntry[];
  future: NavEntry[];
  setScreen: (id: ScreenID, mode?: ViewMode) => void;
  goBack: () => void;
  goForward: () => void;
  setSharedAction: (action: ButtonAction | null) => void;
  executeSharedAction: () => void;
  preloadScreen: (id: ScreenID) => void;
  predictNextScreen: (currentId: ScreenID) => void;
}

export const useZodiac = create<ZodiacState>((set, get) => ({
  activeScreenId: "WELCOME",
  viewMode: "SPLIT",
  sharedAction: null,
  history: [],
  future: [],

  // ---------------- NAVIGATION ----------------
  setScreen: (id, mode) => {
    const state = get();
    if (state.activeScreenId === id) return;

    const target = SCREEN_MAP[id];
    const resolvedMode = mode || target?.layoutMode || "SPLIT";

    getCachedScreen(id);
    screenPredictor.preload(id);

    // ✅ Sync URL with /zodiac prefix
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", screenToPath(id));
    }

    set({
      activeScreenId: id,
      viewMode: resolvedMode,
      history: [
        ...state.history,
        { id: state.activeScreenId, mode: state.viewMode },
      ],
      future: [],
    });
  },

  goBack: () => {
    const state = get();
    const last = state.history[state.history.length - 1];
    if (!last) return;

    // ✅ Sync URL on Back
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", screenToPath(last.id));
    }

    set({
      activeScreenId: last.id,
      viewMode: last.mode,
      history: state.history.slice(0, -1),
      future: [
        { id: state.activeScreenId, mode: state.viewMode },
        ...state.future,
      ],
    });
  },

  goForward: () => {
    const state = get();
    const next = state.future[0];
    if (!next) return;

    // ✅ Sync URL on Forward
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", screenToPath(next.id));
    }

    set({
      activeScreenId: next.id,
      viewMode: next.mode,
      history: [
        ...state.history,
        { id: state.activeScreenId, mode: state.viewMode },
      ],
      future: state.future.slice(1),
    });
  },

  // ---------------- ACTION SYSTEM ----------------
  setSharedAction: (action) => set({ sharedAction: action }),

  executeSharedAction: () => {
    const state = get();
    const action = state.sharedAction;
    if (!action) return;

    set({ sharedAction: null });
    const modalStore = useModalStore.getState();

    if (action.onPress) {
      action.onPress();
      return;
    }

    if (action.isBack || action.type === "BACK") {
      get().goBack();
      return;
    }

    if (
      action.type === "MODAL_SWAP" &&
      action.modalZone &&
      action.modalComponent
    ) {
      modalStore.swapModal(action.modalZone, action.modalComponent);
      return;
    }

    if (action.type === "NAVIGATE" && action.nextScreenId) {
      get().setScreen(action.nextScreenId, action.nextViewMode);
      return;
    }
  },

  // ---------------- PRELOAD ----------------
  preloadScreen: (id) => {
    getCachedScreen(id);
  },

  predictNextScreen: (currentId) => {
    const state = get();
    const last = state.history[state.history.length - 1];
    if (last?.id) {
      screenPredictor.preload(last.id);
    }
  },
}));
