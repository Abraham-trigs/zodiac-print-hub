"use client";

import { useDataStore } from "../../store/core/useDataStore";
import { useZodiac } from "../../store/zodiac.store";
import { ZodiacScreen } from "../../types/screen.types";

export const StaffProfileScreen: ZodiacScreen = {
  id: "STAFF_PROFILE",
  layoutMode: "DETAIL",
  TopComponent: () => {
    const { setScreen, goBack } = useZodiac();
    const { jobs } = useDataStore();

    // In a real app, you'd pull the selectedStaffId from a 'useStaffStore'
    const staffId = "STF-01";
    const staffName = "Kojo";

    const staffJobs = jobs.filter((j) => j.assignedStaffId === staffId);

    return (
      <div className="flex flex-col h-full gap-6 animate-in slide-in-from-bottom-4">
        <header className="flex items-center gap-4">
          <button onClick={() => goBack()} className="text-xl opacity-40">
            ←
          </button>
          <div>
            <h2 className="text-2xl font-bold">{staffName}</h2>
            <p className="text-[10px] text-cyan-400 uppercase font-black tracking-widest">
              Performance Profile
            </p>
          </div>
        </header>

        {/* 1. Feature 3.4: Performance Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-4 bg-cyan-400/5 border-cyan-400/20">
            <span className="text-[9px] uppercase opacity-50 block mb-1">
              Efficiency
            </span>
            <span className="text-xl font-bold">98.2%</span>
          </div>
          <div className="glass-card p-4 bg-orange-500/5 border-orange-500/20">
            <span className="text-[9px] uppercase opacity-50 block mb-1">
              Waste Avg
            </span>
            <span className="text-xl font-bold text-orange-400">1.2%</span>
          </div>
        </div>

        {/* 2. Feature 3.2: Detailed Job History */}
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
          <h3 className="text-[10px] uppercase opacity-30 font-bold tracking-widest">
            Assigned Workload
          </h3>
          {staffJobs.length > 0 ? (
            staffJobs.map((job) => (
              <div
                key={job.id}
                className="p-4 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-bold">
                    #{job.id} - {job.clientName}
                  </span>
                  <span className="text-[9px] opacity-40 uppercase">
                    {job.status}
                  </span>
                </div>
                <span className="text-xs font-mono text-cyan-400">
                  ₵{job.totalEstimate}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-10 opacity-20 text-xs italic">
              No job history found
            </div>
          )}
        </div>

        <button
          onClick={() => setScreen("STAFF_MGMT")}
          className="mt-auto py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest"
        >
          Return to Staff List
        </button>
      </div>
    );
  },
};
