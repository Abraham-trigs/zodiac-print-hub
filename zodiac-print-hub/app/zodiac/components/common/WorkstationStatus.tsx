"use client";

import { useModalStore } from "@store/useModalStore";

interface Props {
  title: string;
  message: string;
  type?: "warning" | "error" | "success";
}

export function WorkstationStatus({ title, message, type = "warning" }: Props) {
  const { closeModal } = useModalStore();

  const colors = {
    warning: "text-orange-400 border-orange-400/20 bg-orange-400/5",
    error: "text-red-400 border-red-400/20 bg-red-400/5",
    success: "text-emerald-400 border-emerald-400/20 bg-emerald-400/5",
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in zoom-in-95 duration-300">
      <div
        className={`p-8 rounded-[3rem] border backdrop-blur-xl max-w-sm w-full ${colors[type]}`}
      >
        <span className="text-4xl mb-4 block">
          {type === "warning" ? "⚠️" : type === "error" ? "🚫" : "✅"}
        </span>
        <h2 className="text-xl font-black uppercase tracking-tighter mb-2 italic">
          {title}
        </h2>
        <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed opacity-60">
          {message}
        </p>

        <button
          onClick={() => closeModal("DETAIL")}
          className="mt-8 w-full py-4 bg-white/10 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-white hover:bg-white/20 transition-all"
        >
          Understood →
        </button>
      </div>
    </div>
  );
}
