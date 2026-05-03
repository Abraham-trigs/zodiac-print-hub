"use client";

import { useDataStore } from "../../store/core/useDataStore";
import { useZodiac } from "../../store/zodiac.store";
import { ZodiacScreen } from "../../types/screen.types";

export const StaffManagementScreen: ZodiacScreen = {
  id: "STAFF_MGMT",
  layoutMode: "DETAIL",
  TopComponent: () => {
    const { jobs } = useDataStore();
    const { setScreen } = useZodiac();

    // Mock Staff List (Usually fetched from store)
    const staffMembers = [
      { id: "STF-01", name: "Kojo", avatar: "👨‍🔧", role: "Production" },
      { id: "STF-02", name: "Ama", avatar: "👩‍🎨", role: "Design" },
    ];

    return (
      <div className="flex flex-col h-full gap-6 animate-in slide-in-from-right-4 duration-500">
        <header>
          <h2 className="text-2xl font-bold">Staff Oversight</h2>
          <p className="text-[10px] text-cyan-400 uppercase font-black tracking-widest">
            Feature 3: Live Performance
          </p>
        </header>

        <div className="flex flex-col gap-4 overflow-y-auto pr-1">
          {staffMembers.map((member) => {
            const assignedJobs = jobs.filter(
              (j) =>
                j.assignedStaffId === member.id && j.status !== "SUCCESSFUL",
            );
            const completedJobs = jobs.filter(
              (j) =>
                j.assignedStaffId === member.id && j.status === "SUCCESSFUL",
            );

            return (
              <div
                key={member.id}
                // ✅ TRIGGER: Navigate to Staff Profile on click
                onClick={() => setScreen("STAFF_PROFILE")}
                className="glass-card p-5 border-white/5 bg-white/5 flex flex-col gap-4 cursor-pointer hover:bg-white/10 active:scale-[0.98] transition-all group"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center text-xl border border-white/10 group-hover:border-cyan-400/50 transition-colors">
                      {member.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm group-hover:text-cyan-400 transition-colors">
                        {member.name}
                      </h3>
                      <span className="text-[9px] opacity-40 uppercase">
                        {member.role}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      {completedJobs.length}
                    </span>
                    <span className="text-[8px] opacity-30 uppercase block font-bold">
                      Done
                    </span>
                  </div>
                </div>

                {/* Feature 3.2: Current Assigned Job */}
                <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                  <span className="text-[8px] opacity-30 uppercase font-bold block mb-2">
                    Current Load
                  </span>
                  {assignedJobs.length > 0 ? (
                    assignedJobs.map((job) => (
                      <div
                        key={job.id}
                        className="flex justify-between items-center text-[10px]"
                      >
                        <span className="font-mono text-cyan-400">
                          #{job.id}
                        </span>
                        <span className="opacity-60">{job.clientName}</span>
                        <span className="text-orange-400 font-bold uppercase tracking-tighter">
                          ● {job.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-[10px] opacity-20 italic">
                      No pending jobs assigned
                    </span>
                  )}
                </div>

                {/* Feature 3.4: Performance Bar */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[8px] uppercase opacity-40">
                    <span>Efficiency</span>
                    <span>94%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)]"
                      style={{ width: "94%" }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setScreen("WELCOME")}
          className="mt-auto py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
        >
          Close Oversight
        </button>
      </div>
    );
  },
};
