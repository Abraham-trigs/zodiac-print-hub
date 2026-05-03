import { ComponentType } from "react";
import { ScreenID } from "../view/screen.registry";
import { ViewMode } from "../store/zodiac.store";

export type ModalZone = "TOP" | "DOWN" | "DETAIL" | "GLOBAL";

export type SharedAction = {
  label: string;

  // explicit intent router
  type?: "NAVIGATE" | "BACK" | "MODAL_SWAP" | "CUSTOM";

  nextScreenId?: ScreenID;
  nextViewMode?: ViewMode;

  modalZone?: ModalZone;
  modalComponent?: ComponentType<any>;

  isBack?: boolean;

  onPress?: () => void;
};
