"use client";

import { useZodiac } from "@store/zodiac.store";

export function TopBar() {
  const { setScreen } = useZodiac();

  return (
    <div className="w-full flex flex-col gap-1 px-4">
      {/* User & Profile Controls */}
      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center gap-2">
          <span className="text-white font-black text-lg tracking-tighter">
            Abraham
          </span>
          <div className="w-4 h-4 bg-blue-700 rounded-full shadow-[0_0_8px_rgba(0,0,255,0.5)] border border-white/20" />
        </div>

        <div className="flex items-center gap-2">
          {/* Action Button: Replaces 2 circles for better UX focus */}
          <button
            onClick={() => setScreen("JOB_INTAKE")}
            className="h-7 px-4 bg-cyan-500 text-black text-[9px] font-black uppercase tracking-widest rounded-full active:scale-95 transition-all shadow-lg shadow-cyan-500/20"
          >
            New Job +
          </button>

          {/* Remaining Circular Icon (Settings/Toggle) */}
          <div className="w-7 h-7 border border-white/20 rounded-full flex items-center justify-center bg-white/5">
            <div className="w-2.5 h-[2px] bg-white rotate-45" />
          </div>
        </div>
      </div>
    </div>
  );
}
