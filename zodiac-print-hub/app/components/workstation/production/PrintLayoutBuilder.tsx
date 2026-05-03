"use client";

import { useEffect, useState } from "react"; // ✅ Fixed: Added useState
import { useDataStore } from "@store/core/useDataStore";
import {
  Scissors,
  RotateCw,
  Trash2,
  AlertCircle,
  Plus,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { apiClient } from "@root/lib/api/client";

export function PrintLayoutBuilder({ materialId }: { materialId: string }) {
  // 1. GLOBAL STATE & ACTIONS
  const {
    layoutState,
    addItemToLayout,
    removeItemFromLayout,
    initNewLayout,
    shootLayout, // 🚀 Connected Store Action
  } = useDataStore();

  const { activeLayout, isSubmitting } = layoutState;

  // 2. CONFIG & LOCAL POOL
  const settings = useDataStore((s: any) => s.settingsState?.settings);
  const targetEfficiency = settings?.efficiency_threshold ?? 85;
  const [jobPool, setJobPool] = useState<any[]>([]);

  // 3. INITIALIZATION
  useEffect(() => {
    const material =
      useDataStore.getState().inventoryState.inventory[materialId];
    if (material) {
      initNewLayout(materialId, material.material?.rollWidth || 60);
    }

    // Load jobs available for this material
    apiClient<{ data: any[] }>(
      `/api/production/layouts?materialId=${materialId}`,
    ).then((res) => setJobPool(res.data || []));
  }, [materialId, initNewLayout]);

  if (!activeLayout) return null;

  // 4. UI HELPERS
  const handleAddToLayout = (job: any) => {
    addItemToLayout(job, 0, activeLayout.cutLineHeight, false);
    // Logically reduce pool (optional UI polish)
    setJobPool((prev) => prev.filter((j) => j.id !== job.id));
  };

  const handleRemoveFromLayout = (jobId: string) => {
    const removedItem = activeLayout.items.find((i) => i.jobId === jobId);
    removeItemFromLayout(jobId);
    // Add back to pool if needed
    if (removedItem) {
      // You'd ideally re-fetch or store the original job data to push back here
    }
  };

  return (
    <div className="flex h-full bg-[#050505] text-white overflow-hidden animate-in fade-in duration-500">
      {/* --- LEFT: JOB POOL --- */}
      <div className="w-72 border-r border-white/5 flex flex-col bg-black/20">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">
            Available Pool
          </h3>
          <p className="text-[9px] opacity-30 uppercase mt-1">
            {jobPool.length} Shootable Items
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {jobPool.length === 0 ? (
            <div className="py-10 text-center opacity-20 uppercase text-[8px] font-black tracking-widest">
              Pool Empty
            </div>
          ) : (
            jobPool.map((job) => (
              <div
                key={job.id}
                onClick={() => handleAddToLayout(job)}
                className="glass-card p-4 border-white/5 hover:border-cyan-400/30 cursor-pointer group transition-all active:scale-95"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded">
                    {job.shortRef}
                  </span>
                  <Plus
                    size={12}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
                <p className="text-[10px] font-black uppercase truncate">
                  {job.serviceName}
                </p>
                <p className="text-[9px] opacity-40 mt-1 font-mono">
                  {job.width}" × {job.height}"
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- CENTER: THE VIRTUAL ROLL --- */}
      <div className="flex-1 relative overflow-auto custom-scrollbar p-20 bg-[url('/grid-dark.png')] bg-repeat">
        <div
          className="relative mx-auto bg-white/[0.02] border-x border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)]"
          style={{ width: activeLayout.rollWidth * 12, minHeight: "100%" }}
        >
          {/* CUT LINE */}
          <div
            className="absolute left-0 right-0 border-t border-red-500/50 border-dashed z-20 transition-all duration-700"
            style={{ top: activeLayout.cutLineHeight * 12 }}
          >
            <div className="absolute -top-5 right-0 flex items-center gap-2 bg-red-500 px-3 py-1 rounded-bl-lg">
              <Scissors size={10} />
              <span className="text-[8px] font-black uppercase italic">
                Cut: {activeLayout.cutLineHeight.toFixed(2)}"
              </span>
            </div>
          </div>

          {/* WASTE SHADING */}
          <div
            className="absolute top-0 left-0 right-0 bg-red-500/[0.03] transition-all"
            style={{ height: activeLayout.cutLineHeight * 12 }}
          />

          {/* NESTED ITEMS */}
          {activeLayout.items.map((item) => (
            <div
              key={item.jobId}
              className="absolute bg-cyan-500/10 border border-cyan-400/40 flex flex-col items-center justify-center group backdrop-blur-sm transition-all"
              style={{
                left: item.posX * 12,
                top: item.posY * 12,
                width: item.width * 12,
                height: item.height * 12,
              }}
            >
              <span className="text-[9px] font-black font-mono text-cyan-400">
                {item.shortRef}
              </span>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-all duration-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFromLayout(item.jobId);
                  }}
                  className="hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
                <button className="hover:text-cyan-400">
                  <RotateCw size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- RIGHT: CONTROL HUD --- */}
      <div className="w-80 border-l border-white/5 p-8 flex flex-col bg-black/40 backdrop-blur-xl">
        <header className="mb-10">
          <h2 className="text-2xl font-black italic tracking-tighter uppercase leading-none">
            Shoot Builder
          </h2>
          <p className="text-[9px] text-cyan-400 font-black uppercase tracking-[0.3em] mt-2">
            Optimization Hub
          </p>
        </header>

        <div className="space-y-4 flex-1">
          <div className="p-6 bg-white/[0.03] rounded-3xl border border-white/5">
            <span className="text-[8px] opacity-30 uppercase font-black tracking-widest block mb-2">
              Efficiency Node
            </span>
            <span
              className={`text-4xl font-black font-mono tracking-tighter ${activeLayout.efficiency < targetEfficiency ? "text-orange-500" : "text-emerald-400"}`}
            >
              {activeLayout.efficiency.toFixed(1)}%
            </span>
            {activeLayout.efficiency < targetEfficiency && (
              <p className="text-[9px] text-orange-400/60 font-bold uppercase mt-3 flex items-center gap-2">
                <AlertCircle size={10} /> Inefficient Gap Detected
              </p>
            )}
          </div>

          <div className="p-6 bg-white/[0.03] rounded-3xl border border-white/5">
            <span className="text-[8px] opacity-30 uppercase font-black tracking-widest block mb-2">
              Waste Leakage
            </span>
            <span className="text-2xl font-black font-mono text-red-400/80">
              ₵{activeLayout.wasteArea.toFixed(2)}
            </span>
          </div>
        </div>

        {/* 🚀 CONNECTED SHOOT BUTTON */}
        <button
          onClick={shootLayout}
          disabled={isSubmitting || activeLayout.items.length === 0}
          className="w-full py-5 bg-white text-black font-black uppercase text-[11px] rounded-[2rem] flex items-center justify-center gap-3 hover:bg-cyan-400 transition-all hover:scale-[1.02] active:scale-95 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              <CheckCircle2 size={18} />
              Lock & Shoot Run
            </>
          )}
        </button>
      </div>
    </div>
  );
}
