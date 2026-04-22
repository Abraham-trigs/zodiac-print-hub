"use client";

import { useEffect, useState } from "react";
import { useDataStore } from "../../store/core/useDataStore";
import { useModalStore } from "../../store/useModalStore";

import { WastePromptModal } from "./WastePromptModal";
import { DeliveryHandlingModal } from "./DeliveryHandlingModal";
import { PaymentVerificationModal } from "./PaymentVerificationModal";

import type { DeliveryRecord } from "../../types/zodiac.types";

/* =========================================================
   SELECTORS ONLY (no store shape leakage)
========================================================= */

import {
  selectJobById,
  selectAllStaff,
  selectPricesMap,
  selectAllDeliveries,
} from "@store/selectors/data.selectors";

export function JobDetailsModal({
  jobId,
  onClose,
}: {
  jobId: string;
  onClose: () => void;
}) {
  const { swapModal } = useModalStore();

  /* -------------------------
     SELECTED DATA (PURE)
  --------------------------*/
  const job = useDataStore((s) => selectJobById(jobId)(s));
  const staffList = useDataStore(selectAllStaff);
  const prices = useDataStore(selectPricesMap);
  const deliveries = useDataStore(selectAllDeliveries);

  const service = job ? prices[job.serviceId] : undefined;

  const existingDelivery = job
    ? deliveries.find((d) => d.jobId === job.id)
    : undefined;

  /* -------------------------
     TIMER STATE
  --------------------------*/
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (job?.status !== "IN_PROGRESS") return;

    const startTime = (job as any)?.startTime;
    if (!startTime) return;

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [job?.status, job]);

  if (!job) return null;

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hrs > 0 ? `${hrs}h ` : ""}${mins}m ${secs
      .toString()
      .padStart(2, "0")}s`;
  };

  /* -------------------------
     ACTIONS
  --------------------------*/
  const triggerWasteAudit = () => {
    swapModal("GLOBAL", () => (
      <WastePromptModal
        job={{ ...job, unit: service?.unit }}
        onConfirm={(waste) => {
          useDataStore.getState().recordWastage(job.id, waste);

          if (job.status === "IN_PROGRESS") {
            useDataStore.getState().updateJobStatus(job.id, "SUCCESSFUL");
          }
        }}
      />
    ));
  };

  const handleFulfillment = () => {
    if (existingDelivery) {
      swapModal("GLOBAL", () => (
        <DeliveryHandlingModal delivery={existingDelivery} />
      ));
      return;
    }

    const newDelivery: DeliveryRecord = {
      id: `DLV-${job.id}`,
      orgId: job.orgId,
      jobId: job.id,
      clientId: job.clientId,
      type: "PHYSICAL_PICKUP",
      status: "PENDING",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    useDataStore.getState().addDelivery(newDelivery);

    swapModal("GLOBAL", () => <DeliveryHandlingModal delivery={newDelivery} />);
  };

  /* -------------------------
     UI
  --------------------------*/
  return (
    <div className="glass-card p-6 w-full max-w-md border border-white/10 flex flex-col gap-6">
      {/* HEADER */}
      <header className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] bg-cyan-400/10 text-cyan-400 px-2 py-0.5 rounded">
            #{job.id}
          </span>

          <h2 className="text-xl font-bold">{job.clientSnapshot?.name}</h2>

          <span className="text-[10px] text-cyan-400 uppercase">
            {service?.name}
          </span>
        </div>

        <button onClick={onClose}>✕</button>
      </header>

      {/* TIMER */}
      <div className="py-10 text-center">
        <div className="text-xs uppercase opacity-40">
          {job.status === "IN_PROGRESS" ? "Active Production" : "Total Time"}
        </div>

        <div className="text-4xl font-mono">{formatTime(elapsed)}</div>
      </div>

      {/* STAFF */}
      <div className="p-4 bg-white/5 rounded-2xl">
        <label className="text-[10px] uppercase opacity-40">
          Assigned Staff
        </label>

        <select
          value={job.assignedStaffId || ""}
          onChange={(e) =>
            useDataStore.getState().assignStaff(job.id, e.target.value)
          }
          className="w-full bg-transparent text-cyan-400"
        >
          <option value="">Select</option>

          {staffList.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 bg-white/5 rounded">Qty {job.quantity}</div>

        <div className="p-3 bg-white/5 rounded">
          Size {job.width && job.height ? `${job.width}x${job.height}` : "N/A"}
        </div>

        <div className="p-3 bg-white/5 rounded">
          Waste {job.materialWastage || 0}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col gap-2">
        {!job.isPaid && (
          <button
            onClick={() =>
              swapModal("GLOBAL", () => (
                <PaymentVerificationModal jobId={job.id} />
              ))
            }
          >
            Verify Payment
          </button>
        )}

        {job.status === "PENDING" && (
          <button onClick={() => useDataStore.getState().startJob(job.id)}>
            Start Production
          </button>
        )}

        {job.status === "IN_PROGRESS" && (
          <>
            <button onClick={triggerWasteAudit}>Mark Successful</button>

            <button
              onClick={() =>
                useDataStore.getState().updateJobStatus(job.id, "PAUSED")
              }
            >
              Pause
            </button>
          </>
        )}

        {job.status === "SUCCESSFUL" && (
          <button onClick={handleFulfillment}>
            {existingDelivery ? "Manage Delivery" : "Arrange Fulfillment"}
          </button>
        )}
      </div>
    </div>
  );
}
