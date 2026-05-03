"use client";

import { useState, useMemo } from "react";
import { useDataStore } from "../../zodiac/store/core/useDataStore";
import { useAccessStore } from "../../zodiac/store/useAccessStore"; // ✅ Added
import { JobTicket, DeliveryRecord } from "../../zodiac/types/zodiac.types";

export function JobCreationModal({ onClose }: { onClose: () => void }) {
  const { prices, inventory, createJob, addDelivery, getUniqueJobRef, jobs } =
    useDataStore();
  const { getJobLimit, subscription } = useAccessStore(); // ✅ Get limit logic

  const [jobId] = useState(() => getUniqueJobRef());
  const [copied, setCopied] = useState(false);

  const [clientName, setClientName] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const [deliveryType, setDeliveryType] = useState<
    "PHYSICAL_PICKUP" | "PRINTER_DELIVERY"
  >("PHYSICAL_PICKUP");
  const [handledBy, setHandledBy] = useState<"CLIENT" | "PRINTER">("CLIENT");

  // ✅ Check if subscription limit is reached
  const currentLimit = getJobLimit();
  const isLimitReached = jobs.length >= currentLimit;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jobId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedService = useMemo(
    () => prices.find((p) => p.id === serviceId),
    [serviceId, prices],
  );

  const linkedMaterial = useMemo(
    () => inventory.find((i) => i.id === selectedService?.stock_ref),
    [selectedService, inventory],
  );

  const calculation = useMemo(() => {
    if (!selectedService) return { total: 0, materialNeeded: 0 };
    const materialNeeded =
      selectedService.category === "Large Format" ||
      selectedService.unit === "sqft"
        ? width * height * quantity
        : quantity;
    return { total: materialNeeded * selectedService.priceGHS, materialNeeded };
  }, [selectedService, quantity, width, height]);

  const hasEnoughStock = linkedMaterial
    ? linkedMaterial.totalRemaining >= calculation.materialNeeded
    : true;

  const handleConfirm = () => {
    if (!clientName || !serviceId || !hasEnoughStock || isLimitReached) return;

    const newJob: JobTicket = {
      id: jobId,
      clientName,
      clientId: "GUEST_001",
      serviceId,
      dimensions: width > 0 ? { w: width, h: height } : undefined,
      quantity,
      totalEstimate: calculation.total,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      materialWastage: 0,
    };

    const initialDelivery: DeliveryRecord = {
      id: `DLV-${jobId}`,
      jobId: jobId,
      type: deliveryType,
      status: "PENDING_DATE",
      handledBy: handledBy,
    };

    createJob(newJob, calculation.materialNeeded);
    addDelivery(initialDelivery);
    onClose();
  };

  return (
    <div className="glass-card p-6 w-full max-w-md border border-cyan-500/30 flex flex-col gap-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
      <header className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white">Create New Job</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-black">
              Production Intake
            </p>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 text-[10px] bg-white/10 hover:bg-white/20 text-white px-2 py-0.5 rounded font-mono border border-white/10 transition-colors group"
            >
              <span className="opacity-50">REF:</span>
              <span className="font-bold">{jobId}</span>
              <span
                className={`ml-1 text-[8px] px-1 rounded ${copied ? "bg-green-500 text-black" : "bg-white/10 text-cyan-400 opacity-0 group-hover:opacity-100"}`}
              >
                {copied ? "SAVED!" : "COPY"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ✅ Limit Warning Alert */}
      {isLimitReached && (
        <div className="bg-orange-500/10 border border-orange-500/40 p-3 rounded-xl animate-pulse">
          <p className="text-[10px] text-orange-400 font-bold text-center leading-tight">
            ⚠️ {subscription} LIMIT REACHED ({jobs.length}/{currentLimit}){" "}
            <br />
            Upgrade to PRO or clear old jobs to continue.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <input
          placeholder="Client Name"
          className="input-field"
          onChange={(e) => setClientName(e.target.value)}
        />
        <select
          className="input-field text-sm"
          onChange={(e) => setServiceId(e.target.value)}
        >
          <option value="">Select Service...</option>
          {prices.map((p) => (
            <option key={p.id} value={p.id}>
              {p.service}
            </option>
          ))}
        </select>
      </div>

      {selectedService?.category === "Large Format" && (
        <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-2">
          <input
            type="number"
            placeholder="W (ft)"
            className="input-field"
            onChange={(e) => setWidth(Number(e.target.value))}
          />
          <input
            type="number"
            placeholder="H (ft)"
            className="input-field"
            onChange={(e) => setHeight(Number(e.target.value))}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[9px] opacity-40 uppercase font-bold">
            Quantity
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="input-field"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[9px] opacity-40 uppercase font-bold">
            Delivery Handling
          </label>
          <select
            className="input-field text-[10px]"
            value={handledBy}
            onChange={(e) => setHandledBy(e.target.value as any)}
          >
            <option value="CLIENT">Client Handles</option>
            <option value="PRINTER">Printer Handles</option>
          </select>
        </div>
      </div>

      <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-4 flex justify-between items-center">
        <div>
          <span className="text-[10px] opacity-50 block uppercase font-bold">
            Estimate
          </span>
          <span className="text-xl font-mono font-bold text-orange-400">
            ₵{calculation.total.toFixed(2)}
          </span>
        </div>
        <div className="text-right">
          <span
            className={`text-[10px] font-bold ${hasEnoughStock ? "text-green-400" : "text-red-500 animate-pulse"}`}
          >
            {hasEnoughStock ? "✓ Stock OK" : "⚠️ Shortage"}
          </span>
        </div>
      </div>

      <button
        disabled={
          !hasEnoughStock || !serviceId || !clientName || isLimitReached
        }
        onClick={handleConfirm}
        className={`btn-primary py-4 uppercase font-black tracking-widest ${isLimitReached ? "opacity-30 cursor-not-allowed bg-white/10 text-white/40" : ""}`}
      >
        {isLimitReached ? "Limit Reached" : "Push to Production"}
      </button>

      <button
        onClick={onClose}
        className="text-[10px] opacity-30 hover:opacity-100 uppercase font-bold tracking-tighter"
      >
        Cancel Entry
      </button>
    </div>
  );
}
