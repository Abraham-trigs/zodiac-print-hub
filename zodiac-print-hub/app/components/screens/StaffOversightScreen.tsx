"use client";

import { useDataStore } from "@store/core/useDataStore";
import {
  Trophy,
  Timer,
  Target,
  Zap,
  TrendingUp,
  ChevronRight,
  Award,
} from "lucide-react";
import { useZodiac } from "@store/zodiac.store";

/**
 * STAFF_OVERSIGHT_SCREEN
 * The Industrial KPI Hub for Shop Owners.
 */
export function StaffOversightScreen() {
  const { setScreen } = useZodiac();
  const staff = useDataStore((s) => Object.values(s.staffState.staff));

  // 🧠 LOGIC: In a real mount, we'd call StaffPerformanceService.getLeaderboard()
  // For now, we utilize the live staff map from the store.

  return (
    <div className="flex flex-col h-full p-8 text-white animate-in fade-in duration-700">
      {/* --- HEADER --- */}
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
            Staff Oversight
          </h2>
          <p className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.4em] mt-2">
            Production Velocity & Yield Intelligence
          </p>
        </div>

        <div className="flex gap-4">
          <div className="px-5 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
            <Zap size={14} className="text-yellow-400" />
            <span className="text-[9px] font-black uppercase tracking-widest">
              Shop Health: Optimal
            </span>
          </div>
        </div>
      </header>

      {/* --- PERFORMANCE GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto pr-2 custom-scrollbar">
        {staff.map((member: any, index) => (
          <div
            key={member.id}
            onClick={() => setScreen("STAFF_PROFILE", "DETAIL")}
            className="glass-card p-8 border-white/5 bg-white/[0.02] hover:border-cyan-400/30 transition-all group cursor-pointer relative"
          >
            {/* Rank Indicator */}
            <div className="absolute top-6 right-8 opacity-10 group-hover:opacity-100 transition-opacity">
              {index === 0 ? (
                <Trophy className="text-yellow-400" size={24} />
              ) : (
                <Award size={20} />
              )}
            </div>

            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-16 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                <img
                  src={member.avatar || `https://dicebear.com{member.id}`}
                  alt="Staff"
                />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight group-hover:text-cyan-400 transition-colors">
                  {member.name}
                </h3>
                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">
                  {member.role || "Operator"} • {member.status}
                </span>
              </div>
            </div>

            {/* --- INDUSTRIAL KPI HUD --- */}
            <div className="grid grid-cols-3 gap-4">
              {/* SPEED */}
              <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 mb-2 opacity-30">
                  <Timer size={12} />
                  <span className="text-[7px] font-black uppercase">
                    Avg. Velocity
                  </span>
                </div>
                <p className="text-xl font-black font-mono">
                  24<span className="text-[10px] opacity-40 ml-1">m</span>
                </p>
              </div>

              {/* ACCURACY */}
              <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 mb-2 opacity-30">
                  <Target size={12} />
                  <span className="text-[7px] font-black uppercase">
                    Avg. Yield
                  </span>
                </div>
                <p className="text-xl font-black font-mono text-emerald-400">
                  94<span className="text-[10px] ml-1">%</span>
                </p>
              </div>

              {/* VOLUME */}
              <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 mb-2 opacity-30">
                  <TrendingUp size={12} />
                  <span className="text-[7px] font-black uppercase">
                    Output
                  </span>
                </div>
                <p className="text-xl font-black font-mono text-cyan-400">
                  142
                </p>
              </div>
            </div>

            {/* CAPACITY BAR */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[8px] font-black uppercase text-white/20">
                  Monthly Production Load
                </span>
                <span className="text-[8px] font-black text-cyan-400">82%</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 w-[82%] shadow-[0_0_10px_rgba(34,211,238,0.4)]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
