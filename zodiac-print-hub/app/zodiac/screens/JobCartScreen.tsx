"use client";

import { useState } from "react";
import { useZodiac } from "../store/zodiac.store";
import { useDataStore } from "../store/core/useDataStore";
import { useModalStore } from "../store/useModalStore";
import { ZodiacScreen } from "../types/screen.types";
import { JobCreationModal } from "./modals/JobCreationModal";
import { JobDetailsModal } from "./modals/JobDetailsModal"; // ✅ Import the details modal
import { JobCardSkeleton } from "../components/common/skeleton/JobCardSkeleton";
import { RefreshButton } from "../components/common/RefreshButton";

export const JobCartScreen: ZodiacScreen = {
  id: "JOB_CART",
  layoutMode: "DETAIL",
  TopComponent: () => {
    const { setScreen } = useZodiac();
    const { jobs, prices, isLoading, initData } = useDataStore();
    const { openModal, closeModal } = useModalStore();
    const [searchQuery, setSearchQuery] = useState("");

    const filteredJobs = jobs.filter(
      (job) =>
        job.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.clientName.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const handleOpenCreation = () => {
      openModal("GLOBAL", () => <JobCreationModal onClose={closeModal} />);
    };

    // ✅ New handler to open job details
    const handleOpenDetails = (jobId: string) => {
      openModal("GLOBAL", () => (
        <JobDetailsModal jobId={jobId} onClose={closeModal} />
      ));
    };

    return (
      <div className="flex flex-col h-full gap-6">
        {/* 1. Header with Refresh & Add */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-2xl font-bold">Job Manager</h2>
              <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-black">
                {isLoading ? "Syncing..." : `${jobs.length} Active Records`}
              </p>
            </div>
            <RefreshButton onRefresh={initData} isLoading={isLoading} />
          </div>

          <button
            className="w-12 h-12 rounded-full bg-orange-500 text-black flex items-center justify-center text-2xl font-bold shadow-lg shadow-orange-500/40 active:scale-90 transition-transform"
            onClick={handleOpenCreation}
          >
            +
          </button>
        </div>

        {/* 2. Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search Reference or Client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-10 text-sm focus:border-cyan-400 outline-none transition-all placeholder:opacity-20"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 text-xs">
            🔍
          </span>
        </div>

        {/* 3. List Logic */}
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <JobCardSkeleton key={i} />)
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map((job) => {
              const service = prices.find((p) => p.id === job.serviceId);
              return (
                <div
                  key={job.id}
                  // ✅ Added click handler here
                  onClick={() => handleOpenDetails(job.id)}
                  className="glass-card p-4 flex items-center justify-between border border-white/5 hover:border-cyan-400/30 transition-all cursor-pointer group active:scale-[0.98]"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-cyan-400/10 text-cyan-400 text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-400/20">
                        #{job.id}
                      </span>
                      <span className="text-sm font-bold truncate max-w-[120px]">
                        {service?.service || "Unknown Service"}
                      </span>
                    </div>
                    <span className="text-xs opacity-50 font-medium">
                      {job.clientName}
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="text-orange-400 font-mono font-bold text-sm">
                      ₵{job.totalEstimate.toFixed(2)}
                    </div>
                    <div
                      className={`text-[9px] uppercase font-black tracking-tighter ${
                        job.status === "SUCCESSFUL"
                          ? "text-green-400"
                          : "text-yellow-400"
                      }`}
                    >
                      ● {job.status}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-20 opacity-20">
              <span className="text-5xl mb-4">📂</span>
              <p className="text-xs uppercase tracking-widest font-bold">
                No active jobs found
              </p>
            </div>
          )}
        </div>

        {/* 4. Footer */}
        <div className="mt-auto pb-4">
          <button
            onClick={() => setScreen("WELCOME")}
            className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 text-[10px] uppercase font-black tracking-[0.3em] hover:text-cyan-400 hover:border-cyan-400/30 transition-all"
          >
            ← Exit Workspace
          </button>
        </div>
      </div>
    );
  },
  DownComponent: undefined,
};
