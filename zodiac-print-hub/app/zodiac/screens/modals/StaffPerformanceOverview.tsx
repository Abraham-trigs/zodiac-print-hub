"use client";

import { useZodiac } from "../store/zodiac.store";

// Mock Data representing staff stats fetched from your job history
const STAFF_PERFORMANCE = [
  {
    id: "S1",
    name: "Kofi Arhin",
    completed: 42,
    avgTime: "12m",
    efficiency: 98,
    status: "ON_BREAK",
  },
  {
    id: "S2",
    name: "Ama Serwaa",
    completed: 38,
    avgTime: "14m",
    efficiency: 92,
    status: "PRINTING",
  },
  {
    id: "S3",
    name: "Yaw Mensah",
    completed: 15,
    avgTime: "22m",
    efficiency: 74,
    status: "IDLE",
  },
];

export function StaffPerformanceOverview() {
  return (
    <div className="glass-card p-6 flex flex-col gap-6 w-full max-h-[85vh] overflow-hidden">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white tracking-tighter">
          Staff Performance
        </h2>
        <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest bg-cyan-400/10 px-3 py-1 rounded-full">
          Live Analysis
        </span>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto pr-2">
        {STAFF_PERFORMANCE.map((staff) => (
          <div
            key={staff.id}
            className="bg-white/5 border border-white/5 rounded-3xl p-4 flex flex-col gap-4 group hover:border-cyan-400/30 transition-all"
          >
            {/* Header: Name and Live Status */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center font-bold text-cyan-400 border border-white/10">
                  {staff.name.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold">{staff.name}</span>
                  <span
                    className={`text-[9px] font-bold uppercase ${
                      staff.status === "PRINTING"
                        ? "text-cyan-400 animate-pulse"
                        : "opacity-40"
                    }`}
                  >
                    ● {staff.status}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-mono font-bold text-orange-400">
                  {staff.efficiency}%
                </span>
                <p className="text-[9px] opacity-40 uppercase">Efficiency</p>
              </div>
            </div>

            {/* Stats Bar (Feature 3.1) */}
            <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-4">
              <div className="flex flex-col">
                <span className="text-[10px] opacity-40 uppercase">
                  Jobs Done
                </span>
                <span className="text-sm font-bold">{staff.completed}</span>
              </div>
              <div className="text-right flex flex-col">
                <span className="text-[10px] opacity-40 uppercase">
                  Avg. Time
                </span>
                <span className="text-sm font-bold">{staff.avgTime}</span>
              </div>
            </div>

            {/* Progress Bar Visual */}
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-1000"
                style={{ width: `${staff.efficiency}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="text-[9px] opacity-30 text-center italic mt-auto">
        Feature 3.4: Data calculated based on precise production timers (Feature
        2.1).
      </p>
    </div>
  );
}
