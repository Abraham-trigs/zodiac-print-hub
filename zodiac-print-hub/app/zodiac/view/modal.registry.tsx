// // view/modal.registry.ts
// import { WelcomeTopModal } from "../modals/WelcomeTopModal";
// import { WelcomeAdModal } from "../modals/WelcomeAdModal";
// import { LoginOptionsModal } from "../modals/LoginOptionsModal";

// /**
//  * MODAL_REGISTRY maps unique string IDs to their components.
//  * The Shell uses these keys to decide what to render in the TOP/DOWN slots.
//  */
// export const MODAL_REGISTRY = {
//   [WelcomeTopModal.modalId]: WelcomeTopModal, // "WELCOME_TOP"
//   [WelcomeAdModal.modalId]: WelcomeAdModal, // "WELCOME_AD"
//   [LoginOptionsModal.modalId]: LoginOptionsModal, // "LOGIN_OPTIONS"
// } as const;

// // This type now includes: "WELCOME_TOP" | "WELCOME_AD" | "LOGIN_OPTIONS"
// export type ModalID = keyof typeof MODAL_REGISTRY;
