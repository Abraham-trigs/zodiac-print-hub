"use client";

import { create } from "zustand";
import { ComponentType } from "react";

export type ModalZone = "TOP" | "DOWN" | "DETAIL" | "GLOBAL";
export type ModalComponent = ComponentType<any> | null;

interface ModalState {
  activeTopComponent: ModalComponent;
  activeDownComponent: ModalComponent;
  activeDetailComponent: ModalComponent;
  activeGlobalComponent: ModalComponent;

  swapModal: (zone: ModalZone, component: ModalComponent) => void;
  openModal: (zone: ModalZone, component: ModalComponent) => void;

  closeModal: (zone: ModalZone) => void;
  closeAll: () => void;
}

// stable mapping (no re-creation per render)
const keyMap: Record<ModalZone, keyof ModalState> = {
  TOP: "activeTopComponent",
  DOWN: "activeDownComponent",
  DETAIL: "activeDetailComponent",
  GLOBAL: "activeGlobalComponent",
};

export const useModalStore = create<ModalState>((set) => ({
  activeTopComponent: null,
  activeDownComponent: null,
  activeDetailComponent: null,
  activeGlobalComponent: null,

  // ---------------- CORE SWAP ----------------
  swapModal: (zone, component) => {
    set({ [keyMap[zone]]: component } as Partial<ModalState>);
  },

  // ---------------- ALIAS (LEGACY FRIENDLY) ----------------
  openModal: (zone, component) => {
    set({ [keyMap[zone]]: component } as Partial<ModalState>);
  },

  // ---------------- CLOSE SINGLE ZONE ----------------
  closeModal: (zone) => {
    set({ [keyMap[zone]]: null } as Partial<ModalState>);
  },

  // ---------------- RESET ALL ZONES ----------------
  closeAll: () =>
    set({
      activeTopComponent: null,
      activeDownComponent: null,
      activeDetailComponent: null,
      activeGlobalComponent: null,
    }),
}));
