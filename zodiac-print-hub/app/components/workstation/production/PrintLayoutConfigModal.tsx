"use client";

import { useState } from "react";
import { useModalStore } from "@store/useModalStore";
import { useDataStore } from "@store/core/useDataStore";
import {
  Settings2,
  Ruler,
  Layout,
  Percent,
  Save,
  X,
  ShieldAlert,
  Zap,
  ChevronRight,
} from "lucide-react";

/**
 * PRINT_LAYOUT_CONFIG_MODAL
 * Calibrates the physical layer of the Production Node.
 * Manages Bleeds, Edge Buffers, and Efficiency Thresholds.
 */
export function PrintLayoutConfigModal() {
  const { closeModal } = useModalStore();

  // 🧠 GLOBAL STATE HANDSHAKE
  const currentSettings = useDataStore((s: any) => s.settingsState?.settings);
  const updateSettings = useDataStore((s: any) => s.updateSettings);

  const [config, setConfig] = useState({
    defaultBleed: currentSettings?.nesting_bleed ?? 0.25,
    edgeBuffer: currentSettings?.nesting_edge_buffer ?? 0.5,
    efficiencyTarget: currentSettings?.efficiency_threshold ?? 85,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 🚀 PERSISTENCE: Syncing Machine Parameters
      await updateSettings({
        nesting_bleed: config.defaultBleed,
        nesting_edge_buffer: config.edgeBuffer,
        efficiency_threshold: config.efficiencyTarget,
      });

      // Subtle hardware-sync simulation delay for industrial feel
      await new Promise((r) => setTimeout(r, 600));
      closeModal("GLOBAL");
    } catch (err) {
      console.error("Failed to sync layout rules", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col w-[480px] bg-[#0A0A0A] border border-white/10 rounded-[3rem] p-10 text-white shadow-3xl animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden">
      {/* --- AESTHETIC NODES --- */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[60px] rounded-full pointer-events-none" />

      <header className="flex justify-between items-start mb-12">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-cyan-400/10 flex items-center justify-center border border-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
            <Settings2 className="text-cyan-400" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-white leading-none">
              Machine Config
            </h2>
            <p className="text-[9px] text-cyan-400 font-black uppercase tracking-[0.4em] mt-2">
              Physical Layer specs
            </p>
          </div>
        </div>
        <button
          onClick={() => closeModal("GLOBAL")}
          className="p-2 bg-white/5 rounded-full opacity-40 hover:opacity-100 hover:bg-white/10 transition-all"
        >
          <X size={18} />
        </button>
      </header>

      <div className="space-y-8">
        {/* CUT MARGIN (BLEED) */}
        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl group hover:border-cyan-400/20 transition-all">
          <label className="text-[9px] font-black uppercase text-white/30 mb-4 block tracking-[0.2em] flex items-center gap-2 group-hover:text-white transition-colors">
            <Layout size={12} className="text-cyan-400" /> Safety Bleed
            (Spacing)
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
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 font-mono font-black text-2xl focus:border-cyan-400 outline-none transition-all placeholder:text-white/5"
              step="0.01"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/20 uppercase tracking-widest font-mono">
              Inches
            </span>
          </div>
        </div>

        {/* SIDE MARGINS */}
        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl group hover:border-cyan-400/20 transition-all">
          <label className="text-[9px] font-black uppercase text-white/30 mb-4 block tracking-[0.2em] flex items-center gap-2 group-hover:text-white transition-colors">
            <Ruler size={12} className="text-cyan-400" /> Roll Deadzone (Edge)
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
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 font-mono font-black text-2xl focus:border-cyan-400 outline-none transition-all"
              step="0.1"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/20 uppercase tracking-widest font-mono">
              Inches
            </span>
          </div>
        </div>

        {/* ALERT THRESHOLD */}
        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
          <div className="flex justify-between items-center mb-6">
            <label className="text-[9px] font-black uppercase text-white/30 tracking-[0.2em] flex items-center gap-2">
              <Percent size={12} className="text-cyan-400" /> Yield Security
              Target
            </label>
            <span className="text-2xl font-black font-mono text-cyan-400">
              {config.efficiencyTarget}%
            </span>
          </div>
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
            className="w-full accent-cyan-400 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
          />
        </div>

        {/* THRESHOLD SECURITY WARNING */}
        <div className="p-5 bg-orange-500/5 border border-orange-500/10 rounded-2xl flex items-start gap-4">
          <ShieldAlert className="text-orange-500 shrink-0" size={18} />
          <p className="text-[9px] font-bold text-white/40 uppercase leading-relaxed">
            Layouts below {config.efficiencyTarget}% will trigger a material
            leakage warning in the shooter node.
          </p>
        </div>
      </div>

      <div className="mt-10">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-white text-black font-black uppercase text-[10px] tracking-widest py-6 rounded-[2rem] flex items-center justify-center gap-3 hover:bg-cyan-400 active:scale-95 transition-all shadow-2xl shadow-white/5 disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Zap size={16} /> Sync Parameters
              <ChevronRight size={14} className="opacity-40" />
            </>
          )}
        </button>
      </div>

      <footer className="mt-8 text-center opacity-10">
        <p className="text-[7px] font-black uppercase tracking-[0.5em]">
          Zodiac Industrial v2.0 • Hardware Interface
        </p>
      </footer>
    </div>
  );
}
