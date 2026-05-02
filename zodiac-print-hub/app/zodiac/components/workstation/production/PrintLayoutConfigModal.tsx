"use client";

import { useState } from "react";
import { useModalStore } from "@store/useModalStore";
import { useDataStore } from "@store/core/useDataStore"; // 🚀 Added
import { Settings2, Ruler, Layout, Percent, Save, X } from "lucide-react";

export function PrintLayoutConfigModal() {
  const { closeModal } = useModalStore();

  // 🧠 GLOBAL STATE HANDSHAKE
  // Replace these with your actual settings slice paths
  const currentSettings = useDataStore((s: any) => s.settingsState?.settings);
  const updateSettings = useDataStore((s: any) => s.updateSettings);

  const [config, setConfig] = useState({
    defaultBleed: currentSettings?.nesting_bleed ?? 0.25,
    edgeBuffer: currentSettings?.nesting_edge_buffer ?? 0.5,
    efficiencyTarget: currentSettings?.efficiency_threshold ?? 85,
  });

  const handleSave = async () => {
    try {
      // 🚀 PERSISTENCE: Save to DB via the store
      await updateSettings({
        nesting_bleed: config.defaultBleed,
        nesting_edge_buffer: config.edgeBuffer,
        efficiency_threshold: config.efficiencyTarget,
      });

      closeModal("GLOBAL");
    } catch (err) {
      console.error("Failed to sync layout rules", err);
    }
  };

  return (
    <div className="flex flex-col w-[450px] bg-[#0A0A0A] border border-white/10 rounded-[3rem] p-10 text-white shadow-3xl animate-in fade-in zoom-in-95 duration-300">
      <header className="flex justify-between items-start mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 flex items-center justify-center border border-cyan-400/20">
            <Settings2 className="text-cyan-400" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">
              Layout Rules
            </h2>
            <p className="text-[9px] text-cyan-400 font-black uppercase tracking-[0.3em]">
              MaterialPrintLayout Specs
            </p>
          </div>
        </div>
        <button
          onClick={() => closeModal("GLOBAL")}
          className="opacity-20 hover:opacity-100 transition-opacity"
        >
          <X size={20} />
        </button>
      </header>

      <div className="space-y-6">
        {/* CUT MARGIN (BLEED) */}
        <div className="group">
          <label className="text-[10px] font-black uppercase text-white/40 mb-3 block tracking-widest flex items-center gap-2">
            <Layout size={12} /> Item Spacing (Bleed)
          </label>
          <div className="relative">
            <input
              type="number"
              value={config.defaultBleed}
              onChange={(e) =>
                setConfig({
                  ...config,
                  defaultBleed: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-mono font-black text-xl focus:border-cyan-400/50 outline-none transition-all"
              step="0.01"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/20 uppercase font-mono">
              Inches
            </span>
          </div>
        </div>

        {/* SIDE MARGINS */}
        <div className="group">
          <label className="text-[10px] font-black uppercase text-white/40 mb-3 block tracking-widest flex items-center gap-2">
            <Ruler size={12} /> Roll Edge Buffer
          </label>
          <div className="relative">
            <input
              type="number"
              value={config.edgeBuffer}
              onChange={(e) =>
                setConfig({
                  ...config,
                  edgeBuffer: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-mono font-black text-xl focus:border-cyan-400/50 outline-none transition-all"
              step="0.1"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/20 uppercase font-mono">
              Inches
            </span>
          </div>
        </div>

        {/* ALERT THRESHOLD */}
        <div className="group">
          <label className="text-[10px] font-black uppercase text-white/40 mb-3 block tracking-widest flex items-center gap-2">
            <Percent size={12} /> Waste Alert Target
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="50"
              max="98"
              value={config.efficiencyTarget}
              onChange={(e) =>
                setConfig({
                  ...config,
                  efficiencyTarget: parseInt(e.target.value) || 50,
                })
              }
              className="flex-1 accent-cyan-400 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
            />
            <span className="text-xl font-black font-mono w-12 text-right">
              {config.efficiencyTarget}%
            </span>
          </div>
        </div>
      </div>

      <div className="mt-12 flex gap-3">
        <button
          onClick={handleSave}
          className="flex-1 bg-white text-black font-black uppercase text-xs py-5 rounded-[2rem] flex items-center justify-center gap-2 hover:bg-cyan-400 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Save size={16} /> Sync Configuration
        </button>
      </div>
    </div>
  );
}
