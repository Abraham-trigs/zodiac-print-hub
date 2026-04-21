"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useDataStore } from "../../store/core/useDataStore";
import { useModalStore } from "../../store/useModalStore";
import { useAccessStore } from "../../store/useAccessStore";
import { ShieldAlert, Lock, Download, FileText, Activity } from "lucide-react";

export function SettingsPermissionsModal() {
  const { clearStore, clearCompletedJobs, jobs, inventory } = useDataStore();
  const { closeModal } = useModalStore();
  const { userRole, setRole, subscription, setSubscription, getJobLimit } =
    useAccessStore();

  const [activeTab, setActiveTab] = useState<
    "SUBSCRIPTION" | "ROLES" | "ACCESS"
  >("SUBSCRIPTION");
  const [pin, setPin] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);

  const MASTER_PIN = "2026";
  const currentLimit = getJobLimit();

  const stats = {
    total: jobs.length,
    completed: jobs.filter((j) => j.status === "SUCCESSFUL").length,
    active: jobs.filter((j) => j.status === "IN_PROGRESS").length,
    stockItems: inventory.length,
  };

  // ✅ EXCEL EXPORT LOGIC (Multi-Sheet)
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const jobsWS = XLSX.utils.json_to_sheet(jobs);
    XLSX.utils.book_append_sheet(wb, jobsWS, "Production_Jobs");
    const stockWS = XLSX.utils.json_to_sheet(inventory);
    XLSX.utils.book_append_sheet(wb, stockWS, "Inventory_Stock");
    XLSX.writeFile(
      wb,
      `Zodiac_Backup_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  // ✅ ENHANCED PDF EXPORT LOGIC (Multi-Page with Inventory)
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const dateStr = new Date().toISOString().split("T")[0];

    // Page 1: Production
    doc.setFontSize(20);
    doc.setTextColor(34, 211, 238); // Cyan-400
    doc.text("ZODIAC PRODUCTION REPORT", 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
      `Generated: ${new Date().toLocaleString()} | Role: ${userRole}`,
      14,
      30,
    );

    autoTable(doc, {
      startY: 35,
      head: [["ID", "Client", "Service ID", "Status", "Estimate (₵)"]],
      body: jobs.map((j) => [
        j.id,
        j.clientName,
        j.serviceId,
        j.status,
        j.totalEstimate,
      ]),
      headStyles: { fillColor: [34, 211, 238] },
      theme: "striped",
    });

    // Page 2: Inventory
    doc.addPage();
    doc.setFontSize(18);
    doc.setTextColor(251, 146, 60); // Orange-400
    doc.text("INVENTORY & STOCK STATUS", 14, 22);

    autoTable(doc, {
      startY: 30,
      head: [["Item ID", "Material", "Remaining", "Unit", "Last Cost"]],
      body: inventory.map((i) => [
        i.id,
        i.material,
        i.totalRemaining,
        i.unit,
        i.lastUnitCost,
      ]),
      headStyles: { fillColor: [251, 146, 60] },
      theme: "grid",
    });

    doc.save(`Zodiac_Full_Report_${dateStr}.pdf`);
  };

  // ✅ AUTO-ARCHIVE SAFETY TRIGGER
  const handleSafeFactoryReset = () => {
    const confirmReset = confirm(
      "CRITICAL: This wipes all data. We will automatically download an Excel backup first. Proceed?",
    );
    if (confirmReset) {
      handleExportExcel(); // Auto-backup
      setTimeout(() => {
        clearStore();
        closeModal("GLOBAL");
        window.location.reload();
      }, 1000);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === MASTER_PIN) setIsUnlocked(true);
    else {
      alert("ACCESS DENIED");
      setPin("");
    }
  };

  return (
    <div className="glass-card w-full max-w-2xl border border-white/10 flex overflow-hidden animate-in zoom-in-95 shadow-2xl h-[520px]">
      <aside className="w-48 border-r border-white/5 bg-black/20 flex flex-col p-4 gap-2">
        <header className="mb-4">
          <h2 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">
            Zodiac Core
          </h2>
        </header>

        {[
          { id: "SUBSCRIPTION", label: "Subscription", icon: "💎" },
          { id: "ROLES", label: "Dev Roles", icon: "🔑" },
          {
            id: "ACCESS",
            label: "Store Access",
            icon: isUnlocked ? "🔓" : "🔒",
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[10px] font-black transition-all ${
              activeTab === tab.id
                ? "bg-cyan-500 text-black shadow-lg"
                : "text-white/40 hover:text-white"
            }`}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}

        <button
          onClick={() => closeModal("GLOBAL")}
          className="mt-auto text-[10px] font-bold text-white/20 hover:text-white py-2"
        >
          ✕ Close
        </button>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        {activeTab === "SUBSCRIPTION" && (
          <section className="animate-in slide-in-from-right-4">
            <h3 className="text-lg font-bold text-white mb-6">
              Tier Management
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: "FREE", label: "Free Plan", limit: "10" },
                { id: "GROW", label: "Grow Plan", limit: "100" },
                { id: "DOMINATE", label: "Dominate", limit: "∞" },
              ].map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSubscription(plan.id as any)}
                  className={`flex justify-between items-center p-4 rounded-2xl border ${subscription === plan.id ? "border-cyan-500/50 bg-cyan-500/5 text-cyan-400" : "border-white/5 bg-white/5 text-white/60"}`}
                >
                  <span className="text-xs font-black">{plan.label}</span>
                  <span className="text-[10px] opacity-40">
                    {plan.limit} Jobs
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {activeTab === "ACCESS" && (
          <div className="animate-in slide-in-from-right-4 h-full">
            {!isUnlocked ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                <Lock className="text-white/10" size={48} />
                <form
                  onSubmit={handlePinSubmit}
                  className="flex flex-col gap-2 w-full max-w-[180px]"
                >
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="PIN"
                    className="bg-black/40 border border-white/10 rounded-xl py-3 text-center tracking-widest text-white outline-none focus:border-cyan-500/50 transition-all"
                  />
                  <button
                    type="submit"
                    className="py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase"
                  >
                    Verify Access
                  </button>
                </form>
              </div>
            ) : (
              <section className="flex flex-col gap-6">
                <header className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white">
                    System Health
                  </h3>
                  <button
                    onClick={() => setIsUnlocked(false)}
                    className="text-[9px] font-black text-cyan-400 uppercase"
                  >
                    Lock Utilities
                  </button>
                </header>

                <div className="flex flex-col gap-3">
                  <h4 className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                    Backup & Archives
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleExportExcel}
                      className="flex flex-col items-center gap-2 p-4 bg-green-500/5 border border-green-500/20 text-green-500 rounded-2xl text-[9px] font-black uppercase transition-all hover:bg-green-500/10"
                    >
                      <Download size={16} /> Excel Ledger
                    </button>
                    <button
                      onClick={handleExportPDF}
                      className="flex flex-col items-center gap-2 p-4 bg-red-500/5 border border-red-500/20 text-red-500 rounded-2xl text-[9px] font-black uppercase transition-all hover:bg-red-500/10"
                    >
                      <FileText size={16} /> PDF Report
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                  <button
                    onClick={clearCompletedJobs}
                    disabled={stats.completed === 0}
                    className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase flex justify-between px-6 items-center"
                  >
                    <span>Purge Finished Records</span>
                    <span className="text-cyan-400">-{stats.completed}</span>
                  </button>
                  <button
                    onClick={handleSafeFactoryReset}
                    className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                  >
                    FACTORY RESET ENGINE
                  </button>
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
