"use client";

import { usePriceStore } from "../store/price.store";

const AUDIT_DATA: WasteAudit[] = [
  {
    staffName: "Yaw Mensah",
    machineId: "Large Format Jet",
    serviceName: "Flex Banner",
    wastedQuantity: 5.2,
    unit: "Yards",
    monetaryLoss: 145.6,
    date: "2026-04-12",
  },
  {
    staffName: "Kofi Arhin",
    machineId: "Konica C6501",
    serviceName: "A3 Glossy",
    wastedQuantity: 12,
    unit: "Sheets",
    monetaryLoss: 24.0,
    date: "2026-04-13",
  },
  {
    staffName: "Yaw Mensah",
    machineId: "Large Format Jet",
    serviceName: "Vinyl Sticker",
    wastedQuantity: 3.5,
    unit: "Yards",
    monetaryLoss: 98.0,
    date: "2026-04-13",
  },
];

export function WasteAuditDashboard() {
  return (
    <div className="glass-card p-6 w-full max-h-[85vh] flex flex-col gap-6 border-orange-500/30">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Loss Prevention</h2>
          <p className="text-[10px] opacity-50 uppercase tracking-widest">
            Material Waste Audit
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs opacity-40">Total Leakage</span>
          <p className="text-lg font-bold text-orange-500">₵267.60</p>
        </div>
      </div>

      {/* TOP OFFENDERS (The "Spotted" Logic) */}
      <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-3xl">
        <span className="text-[9px] font-bold text-orange-400 uppercase tracking-widest">
          ⚠️ High Waste Alert
        </span>
        <div className="flex justify-between items-end mt-2">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white">Yaw Mensah</span>
            <span className="text-[10px] opacity-60 italic">
              Large Format Jet
            </span>
          </div>
          <span className="text-xl font-mono font-bold text-orange-500">
            ₵243.60
          </span>
        </div>
      </div>

      {/* DETAILED LOG (Feature 4.4.iv) */}
      <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3">
        {AUDIT_DATA.map((log, i) => (
          <div
            key={i}
            className="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-all"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">
                  {log.serviceName}
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 opacity-60">
                  {log.machineId}
                </span>
              </div>
              <span className="text-[10px] opacity-40">
                {log.staffName} • {log.date}
              </span>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-orange-400">
                -{log.wastedQuantity} {log.unit}
              </p>
              <p className="text-[10px] opacity-40 font-mono">
                ₵{log.monetaryLoss.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[9px] opacity-30 text-center italic">
        Feature 4.4: Auto-generation of material waste by staff, job, and date.
      </p>
    </div>
  );
}
