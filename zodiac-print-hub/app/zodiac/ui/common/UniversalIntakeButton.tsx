"use client";

import { useZodiac } from "../store/zodiac.store";
import { Plus } from "lucide-react"; // Or any icon library you use

export function UniversalIntakeButton() {
  const { setScreen } = useZodiac();

  return (
    <button
      onClick={() => setScreen("JOB_INTAKE")}
      className="fixed bottom-24 right-6 w-14 h-14 bg-cyan-500 text-black rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-transform z-[999] group border-4 border-black/20"
      aria-label="Create New Job"
    >
      <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />

      {/* Optional Tooltip/Label for Power Users */}
      <span className="absolute right-16 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none uppercase font-black tracking-widest whitespace-nowrap border border-white/10">
        New Intake
      </span>
    </button>
  );
}
