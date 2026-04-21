"use client";

import { useState, useEffect } from "react";
// Import your modal store to handle the swap
import { useModalStore } from "@store/useModalStore";

export function JobTicketModal({ job }: { job: JobTicket }) {
  const [elapsed, setElapsed] = useState(0);
  const [status, setStatus] = useState<JobStatus>(job.status);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === "IN_PROGRESS" && job.startTime) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - job.startTime!) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status, job.startTime]);

  // FEATURE 4.4/8.2: The Material Audit Logic
  const handleMarkSuccessful = () => {
    useModalStore.getState().swapModal(
      "GLOBAL",
      <WastePromptModal
        job={job}
        onConfirm={(waste) => {
          // 1. Log the audit
          console.log(`Job Success: ${job.id}. Waste: ${waste}`);

          // 2. Automated Deduction & Record Finalization
          // finalizeJobRecord(job.id, waste);

          // 3. Update local state or close
          setStatus("SUCCESSFUL");
        }}
      />,
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="glass-card p-6 flex flex-col gap-6 w-full max-w-md border-orange-500/20">
      {/* ... Header & Production Details remain the same ... */}

      <div className="flex flex-col items-center py-4 border-y border-white/5">
        <span className="text-[10px] uppercase opacity-40 tracking-widest mb-1">
          Production Time
        </span>
        <span className="text-4xl font-mono font-bold text-white">
          {status === "IN_PROGRESS" ? formatTime(elapsed) : "00m 00s"}
        </span>
      </div>

      <div className="flex gap-3">
        {status === "PENDING" && (
          <button
            className="flex-1 py-4 bg-cyan-500 text-black font-bold rounded-2xl"
            onClick={() => setStatus("IN_PROGRESS")}
          >
            Start Production
          </button>
        )}

        {status === "IN_PROGRESS" && (
          <button
            className="flex-1 py-4 bg-orange-500 text-white font-bold rounded-2xl"
            onClick={handleMarkSuccessful} // Trigger the Audit Logic
          >
            Mark Successful
          </button>
        )}
      </div>
    </div>
  );
}
