"use client";

import { create } from "zustand";
import { ComponentType } from "react";

export type ModalZone = "TOP" | "DOWN" | "DETAIL" | "GLOBAL";
export type ModalComponent = ComponentType<any> | null;

interface ModalState {
  // Components
  activeTopComponent: ModalComponent;
  activeDownComponent: ModalComponent;
  activeDetailComponent: ModalComponent;
  activeGlobalComponent: ModalComponent;

  // Props
  activeTopProps: any;
  activeDownProps: any;
  activeDetailProps: any;
  activeGlobalProps: any;

  swapModal: (zone: ModalZone, component: ModalComponent, props?: any) => void;
  openModal: (zone: ModalZone, component: ModalComponent, props?: any) => void;

  closeModal: (zone: ModalZone) => void;
  closeAll: () => void;
}

// Maps zones to their respective Component and Prop keys in the state
const keyMap: Record<
  ModalZone,
  { comp: keyof ModalState; props: keyof ModalState }
> = {
  TOP: { comp: "activeTopComponent", props: "activeTopProps" },
  DOWN: { comp: "activeDownComponent", props: "activeDownProps" },
  DETAIL: { comp: "activeDetailComponent", props: "activeDetailProps" },
  GLOBAL: { comp: "activeGlobalComponent", props: "activeGlobalProps" },
};

export const useModalStore = create<ModalState>((set) => ({
  activeTopComponent: null,
  activeDownComponent: null,
  activeDetailComponent: null,
  activeGlobalComponent: null,

  activeTopProps: {},
  activeDownProps: {},
  activeDetailProps: {},
  activeGlobalProps: {},

  // ---------------- CORE SWAP  ----------------
  swapModal: (zone, component, props = {}) => {
    const { comp, props: propKey } = keyMap[zone];

    // ✅ GLOBAL PROTECTION: Ensure common props have fallbacks
    const safeProps = {
      label: "",
      field: "",
      current: "",
      ...props, // Overwrite with actual data if provided
    };

    set({
      [comp]: component,
      [propKey]: safeProps,
    } as Partial<ModalState>);
  },

  // ---------------- ALIAS (LEGACY FRIENDLY) ----------------
  openModal: (zone, component, props = {}) => {
    const { comp, props: propKey } = keyMap[zone];
    set({
      [comp]: component,
      [propKey]: props,
    } as Partial<ModalState>);
  },

  // ---------------- CLOSE SINGLE ZONE ----------------
  closeModal: (zone) => {
    const { comp, props: propKey } = keyMap[zone];
    set({
      [comp]: null,
      [propKey]: {},
    } as Partial<ModalState>);
  },

  // ---------------- RESET ALL ZONES ----------------
  closeAll: () =>
    set({
      activeTopComponent: null,
      activeDownComponent: null,
      activeDetailComponent: null,
      activeGlobalComponent: null,
      activeTopProps: {},
      activeDownProps: {},
      activeDetailProps: {},
      activeGlobalProps: {},
    }),
}));
