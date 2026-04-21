"use client";

import { useModalStore } from "../../store/useModalStore";

export function LoginOptionsModal() {
  const { closeModal } = useModalStore();

  return (
    <div className="h-full w-full bg-zinc-900 p-6 flex flex-col gap-4 border-t border-white/10">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Sign In</h3>
        <button
          onClick={() => closeModal("DOWN")}
          className="text-xs bg-white/10 px-2 py-1 rounded"
        >
          CLOSE
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <button className="w-full bg-white text-black py-3 rounded-xl font-bold">
          Continue with Google
        </button>
        <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">
          Continue with Apple
        </button>
      </div>

      <p className="text-[10px] text-center opacity-50 mt-auto">
        By continuing, you agree to our Terms of Service.
      </p>
    </div>
  );
}

// ATTACH ID DIRECTLY
LoginOptionsModal.modalId = "LOGIN_OPTIONS";
