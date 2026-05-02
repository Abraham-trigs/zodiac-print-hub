"use client";

import { useDataStore } from "@store/core/useDataStore";
import { TrendingDown, Clock, Calendar, AlertTriangle } from "lucide-react";

export function VelocityDashboard({ data }: { data: any[] }) {
  return (
    <div className="space-y-4 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((item) => (
          <div
            key={item.materialId}
            className={`glass-card p-6 border-white/5 bg-white/[0.02] relative overflow-hidden ${item.status === "REPLENISH" ? "border-orange-500/30" : ""}`}
          >
            {/* Status Glow */}
            <div
              className={`absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full -mr-10 -mt-10 ${item.status === "REPLENISH" ? "bg-orange-500" : "bg-emerald-500"}`}
            />

            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-sm font-black uppercase tracking-tight">
                  {item.name}
                </h4>
                <p className="text-[8px] opacity-30 font-bold uppercase">
                  {item.supplier}
                </p>
              </div>
              {item.status === "REPLENISH" && (
                <AlertTriangle
                  size={14}
                  className="text-orange-500 animate-pulse"
                />
              )}
            </div>

            <div className="flex items-end justify-between">
              <div>
                <span className="text-[7px] font-black opacity-30 uppercase block mb-1">
                  Estimated Runway
                </span>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-3xl font-black font-mono ${item.runwayDays < 5 ? "text-red-400" : "text-white"}`}
                  >
                    {item.runwayDays > 100 ? "∞" : item.runwayDays}
                  </span>
                  <span className="text-[9px] font-black uppercase opacity-40">
                    Days
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[7px] font-black opacity-30 uppercase block mb-1">
                  Daily Burn
                </span>
                <p className="text-xs font-black font-mono text-cyan-400">
                  -{item.burnRate}
                </p>
              </div>
            </div>

            {/* Progress Bar (Visualizing the countdown) */}
            <div className="mt-6 h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${item.runwayDays < 3 ? "bg-red-500" : "bg-emerald-500/50"}`}
                style={{
                  width: `${Math.min((item.runwayDays / 30) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
