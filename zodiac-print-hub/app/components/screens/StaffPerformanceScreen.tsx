"use client";

import { useDataStore } from "@store/core/useDataStore";
import { Trophy, Zap, Target, TrendingUp, Timer, Award } from "lucide-react";

export function StaffPerformanceScreen() {
  const staff = useDataStore((s) => Object.values(s.staffState.staff));

  return (
    <div className="flex flex-col h-full p-8 text-white animate-in fade-in duration-700">
      <header className="mb-12">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter">
          Performance Node
        </h2>
        <p className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.4em] mt-2">
          Production Velocity & Efficiency
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {staff.map((member: any, i) => (
          <div
            key={member.id}
            className="glass-card p-8 border-white/5 bg-white/[0.02] relative group"
          >
            {/* Rank Badge */}
            <div className="absolute top-6 right-8 flex items-center gap-2">
              <span className="text-[10px] font-black opacity-20 uppercase italic">
                Rank #{i + 1}
              </span>
              <Award
                size={20}
                className={i === 0 ? "text-yellow-400" : "text-white/10"}
              />
            </div>

            <div className="flex items-center gap-6 mb-10">
              <div className="w-16 h-16 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden">
                <img
                  src={member.avatar || `https://dicebear.com{member.id}`}
                  alt="Avatar"
                />
                {member.status === "ONLINE" && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-4 border-black rounded-full" />
                )}
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight">
                  {member.name}
                </h3>
                <p className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">
                  {member.role}
                </p>
              </div>
            </div>

            {/* METRICS GRID */}
            <div className="grid grid-cols-3 gap-4">
              <Metric
                icon={<Timer size={14} />}
                label="Avg. Setup"
                value="12m"
                color="cyan"
              />
              <Metric
                icon={<Target size={14} />}
                label="Avg. Yield"
                value="96.2%"
                color="emerald"
              />
              <Metric
                icon={<Zap size={14} />}
                label="Jobs / Day"
                value="24"
                color="orange"
              />
            </div>

            {/* PERFORMANCE BAR */}
            <div className="mt-8">
              <div className="flex justify-between text-[8px] font-black uppercase mb-2 opacity-40">
                <span>Capacity Utilization</span>
                <span>88%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 w-[88%] shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Metric({ icon, label, value, color }: any) {
  const colors: any = {
    cyan: "text-cyan-400",
    emerald: "text-emerald-400",
    orange: "text-orange-400",
  };
  return (
    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
      <div className="flex items-center gap-2 mb-2 opacity-30">
        {icon}
        <span className="text-[7px] font-black uppercase tracking-widest">
          {label}
        </span>
      </div>
      <p
        className={`text-xl font-black font-mono leading-none ${colors[color]}`}
      >
        {value}
      </p>
    </div>
  );
}
