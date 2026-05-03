import { create } from "zustand";

type WebModalType =
  | "SOLUTIONS"
  | "PRICING"
  | "WASTE_AUDIT"
  | "ACCESS_REQUEST"
  | null;

interface WebModalState {
  activeModal: WebModalType;
  openModal: (type: WebModalType) => void;
  closeModal: () => void;
}

export const useWebModal = create<WebModalState>((set) => ({
  activeModal: null,
  openModal: (type) => set({ activeModal: type }),
  closeModal: () => set({ activeModal: null }),
}));
