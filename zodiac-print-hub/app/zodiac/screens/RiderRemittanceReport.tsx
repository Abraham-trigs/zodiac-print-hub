"use client";

import { useDataStore } from "@store/core/useDataStore";
import {
  Banknote,
  Smartphone,
  UserCheck,
  ArrowDownCircle,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import { useState, useMemo } from "react";
import { format } from "date-fns";

export function RiderRemittanceReport() {
  const { paymentState, staffState } = useDataStore();
  const [selectedRider, setSelectedRider] = useState<string>("ALL");

  // 1. Get all staff members with 'RIDER' role
  const riders = Object.values(staffState.staff).filter(
    (s: any) => s.role === "RIDER",
  );

  // 2. 🧠 ANALYTICS LOGIC: Filter ledger for POD payments
  const remittanceData = useMemo(() => {
    const allPayments = Object.values(paymentState.payments || {}).flat();

    return allPayments.filter((p: any) => {
      const isPOD = p.note?.includes("POD collected by Rider");
      const matchesRider =
        selectedRider === "ALL" || p.note?.includes(selectedRider.slice(-4));
      return isPOD && matchesRider;
    });
  }, [paymentState.payments, selectedRider]);

  const totals = useMemo(() => {
    return {
      cash: remittanceData
        .filter((p) => p.method === "CASH")
        .reduce((s, p) => s + p.amount, 0),
      momo: remittanceData
        .filter((p) => p.method === "MOMO_OFFLINE")
        .reduce((s, p) => s + p.amount, 0),
    };
  }, [remittanceData]);

  return (
    <div className="flex flex-col h-full p-8 text-white animate-in fade-in duration-700">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">
            Rider Remittance
          </h2>
          <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.4em] mt-2">
            End-of-Day Cash Reconciliation
          </p>
        </div>

        <select
          value={selectedRider}
          onChange={(e) => setSelectedRider(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none focus:border-emerald-500/50"
        >
          <option value="ALL">All Active Riders</option>
          {riders.map((r: any) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </header>

      {/* --- RECONCILIATION HUD --- */}
      <div className="grid grid-cols-3 gap-6 mb-12">
        <div className="p-8 bg-white/[0.02] border border-white/10 rounded-[2.5rem] flex flex-col justify-between h-44 group hover:bg-white/[0.04] transition-all">
          <Banknote className="text-emerald-500/40" size={24} />
          <div>
            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block mb-1">
              Physical Cash Due
            </span>
            <p className="text-4xl font-black font-mono leading-none">
              ₵{totals.cash.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="p-8 bg-white/[0.02] border border-white/10 rounded-[2.5rem] flex flex-col justify-between h-44">
          <Smartphone className="text-cyan-400/40" size={24} />
          <div>
            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block mb-1">
              Momo Collections
            </span>
            <p className="text-4xl font-black font-mono leading-none">
              ₵{totals.momo.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="p-8 bg-emerald-500 rounded-[2.5rem] text-black shadow-2xl shadow-emerald-500/20 flex flex-col justify-between h-44">
          <UserCheck size={24} />
          <div>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-60 block mb-1">
              Total Remittance
            </span>
            <p className="text-4xl font-black font-mono leading-none">
              ₵{(totals.cash + totals.momo).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* --- TRANSACTION LOG --- */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
        <h3 className="text-[10px] font-black uppercase text-white/20 tracking-widest mb-6 flex items-center gap-2">
          <ArrowDownCircle size={14} /> Audit Trail
        </h3>

        <div className="space-y-3">
          {remittanceData.map((p: any) => (
            <div
              key={p.id}
              className="glass-card p-5 border-white/5 bg-white/[0.01] flex items-center justify-between group hover:border-white/20 transition-all"
            >
              <div className="flex items-center gap-5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.method === "CASH" ? "bg-emerald-500/10 text-emerald-500" : "bg-cyan-500/10 text-cyan-400"}`}
                >
                  {p.method === "CASH" ? (
                    <Banknote size={20} />
                  ) : (
                    <Smartphone size={20} />
                  )}
                </div>
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-tight">
                    Handover Confirmation
                  </h4>
                  <p className="text-[8px] text-white/30 uppercase font-bold mt-1">
                    {format(new Date(p.createdAt), "HH:mm")} • {p.note}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black font-mono">
                  ₵{p.amount.toFixed(2)}
                </p>
                <span className="text-[7px] font-black text-white/10 uppercase tracking-widest">
                  Authenticated
                </span>
              </div>
            </div>
          ))}
          {remittanceData.length === 0 && (
            <div className="py-20 text-center opacity-10 border-2 border-dashed border-white/10 rounded-[3rem]">
              <ShieldCheck size={48} className="mx-auto mb-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.5em]">
                No Pending Remittances
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
