"use client";

import { useZodiac } from "@store/zodiac.store";
import { useDataStore } from "@store/core/useDataStore";

export function ClassificationHub() {
  const { setScreen } = useZodiac();
  const setDraft = useDataStore((s) => s.setDraft);
  const draft = useDataStore((s) => s.draftState?.draft);

  // We check if a path has been "chosen" by looking for a name or specific flags
  const hasPath = draft?.isPhysical !== undefined;

  const handleTypeSwitch = (isPhysical: boolean) => {
    setDraft({ isPhysical });
  };

  const handleReset = () => {
    setDraft({ isPhysical: undefined, name: "", priceGHS: 0 });
  };

  return (
    <div className="flex flex-col h-full text-center animate-in slide-in-from-bottom-2 duration-500 overflow-hidden px-2">
      <h2 className="text-xl font-black italic tracking-tighter text-white leading-none">
        {hasPath
          ? draft.isPhysical
            ? "MATERIAL PATH"
            : "SERVICE PATH"
          : "CLASSIFICATION"}
      </h2>
      <p className="text-[6px] text-white/20 uppercase font-black tracking-[0.3em] mt-1 mb-4">
        {hasPath ? "Complete the preview card above" : "Define Entry Path"}
      </p>

      <div className="flex flex-col gap-3">
        {!hasPath ? (
          /* --- INITIAL STATE: ALL 3 OPTIONS PRESENT --- */
          <>
            <button
              onClick={() => setScreen("MATERIAL_SERVICE_CATALOG")}
              className="w-full py-4 px-6 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center group active:scale-95 transition-all"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-cyan-400">
                Select Existing
              </span>
              <span className="opacity-20 text-[10px]">🔍</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleTypeSwitch(true)}
                className="py-5 border border-white/5 bg-transparent text-white/20 rounded-2xl text-[10px] font-black uppercase hover:text-white hover:border-white/20 transition-all"
              >
                Material
              </button>
              <button
                onClick={() => handleTypeSwitch(false)}
                className="py-5 border border-white/5 bg-transparent text-white/20 rounded-2xl text-[10px] font-black uppercase hover:text-white hover:border-white/20 transition-all"
              >
                Service
              </button>
            </div>
          </>
        ) : (
          /* --- SELECTED STATE: ONLY SHOW RELEVANT ACTION + RESET --- */
          <div className="flex flex-col gap-2 animate-in fade-in zoom-in-95">
            <div
              className={`py-4 rounded-2xl border text-[10px] font-black uppercase tracking-[0.2em] ${
                draft.isPhysical
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-blue-600 border-blue-500 text-white"
              }`}
            >
              {draft.isPhysical
                ? "✓ Physical Material Mode"
                : "✓ Labor Service Mode"}
            </div>

            <button
              onClick={handleReset}
              className="py-2 text-[7px] text-white/10 uppercase font-black hover:text-white transition-colors"
            >
              Change Classification
            </button>

            <button className="w-full py-4 mt-2 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-[0.98] transition-transform">
              Finalize Item →
            </button>
          </div>
        )}
      </div>

      <div className="h-4" />
    </div>
  );
}
