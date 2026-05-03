"use client";

import { useState, useMemo } from "react";
import { useDataStore } from "@store/core/useDataStore";
import { useZodiac } from "@store/zodiac.store";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Package,
  History,
  ShieldCheck,
  ChevronLeft,
  ExternalLink,
  Edit3,
  Plus,
} from "lucide-react";
import { SupplierAccessToggle } from "@workstation/inventory/components/SupplierAccessToggle";
import { useModalStore } from "@store/useModalStore";
import { EditSupplierModal } from "@workstation/inventory/components/EditSupplierModal";

export function SupplierDetailScreen({ supplierId }: { supplierId: string }) {
  const { goBack } = useZodiac();
  const { openModal } = useModalStore();
  const [activeTab, setActiveTab] = useState<"MATERIALS" | "HISTORY">(
    "MATERIALS",
  );

  // 1. DATA SELECTION
  const supplier = useDataStore(
    (s: any) => s.procurementState.suppliers[supplierId],
  );
  const inventory = useDataStore((s: any) =>
    Object.values(s.inventoryState.inventory),
  );
  const activeOrders = useDataStore((s: any) =>
    Object.values(s.procurementState.activeOrders),
  );

  // 🧠 LOGIC: Find materials provided by THIS supplier
  const linkedMaterials = useMemo(
    () =>
      inventory.filter((item: any) => item.material?.supplierId === supplierId),
    [inventory, supplierId],
  );

  // 🧠 LOGIC: Find orders tied to THIS supplier
  const supplierOrders = useMemo(
    () => activeOrders.filter((po: any) => po.supplierId === supplierId),
    [activeOrders, supplierId],
  );

  if (!supplier) return null;

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white p-8 animate-in slide-in-from-right duration-500">
      {/* --- HEADER: Breadcrumb & Actions --- */}
      <div className="flex justify-between items-start mb-12">
        <button
          onClick={goBack}
          className="group flex items-center gap-2 active:scale-95 transition-all text-white/40 hover:text-emerald-400"
        >
          <ChevronLeft size={16} />
          <span className="text-[8px] font-black uppercase tracking-[0.2em]">
            Supplier Vault
          </span>
        </button>

        <button
          onClick={() =>
            openModal("GLOBAL", <EditSupplierModal supplierId={supplierId} />)
          }
          className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase hover:bg-white/10 transition-all"
        >
          <Edit3 size={14} />
          Edit Identity
        </button>
      </div>

      <div className="grid grid-cols-12 gap-10 flex-1 overflow-hidden">
        {/* --- LEFT: INFO PANEL --- */}
        <div className="col-span-4 space-y-6">
          <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem]">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mb-6">
              <Building2 size={40} className="text-emerald-500" />
            </div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2">
              {supplier.name}
            </h2>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-400/5 px-3 py-1 rounded-full border border-emerald-400/10">
              {supplier.category || "General Provider"}
            </span>

            <div className="mt-10 space-y-4">
              <div className="flex items-center gap-4 text-white/40">
                <Mail size={16} className="text-emerald-500/50" />
                <span className="text-xs font-bold">
                  {supplier.email || "No email registered"}
                </span>
              </div>
              <div className="flex items-center gap-4 text-white/40">
                <Phone size={16} className="text-emerald-500/50" />
                <span className="text-xs font-bold">
                  {supplier.phone || "No contact line"}
                </span>
              </div>
              <div className="flex items-start gap-4 text-white/40">
                <MapPin size={16} className="text-emerald-500/50 mt-1" />
                <span className="text-xs font-bold leading-relaxed">
                  {supplier.address || "No physical address"}
                </span>
              </div>
            </div>
          </div>

          {/* 🚀 ROLE HANDSHAKE: The Partner Portal Invite */}
          <SupplierAccessToggle supplier={supplier} />
        </div>

        {/* --- RIGHT: CONTENT TABS --- */}
        <div className="col-span-8 flex flex-col overflow-hidden">
          <div className="flex gap-8 border-b border-white/5 mb-8">
            {["MATERIALS", "HISTORY"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === tab ? "text-emerald-400" : "text-white/20 hover:text-white/40"}`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400" />
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
            {activeTab === "MATERIALS" ? (
              <div className="grid grid-cols-2 gap-4">
                {linkedMaterials.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl flex justify-between items-center group hover:border-emerald-500/20 transition-all"
                  >
                    <div>
                      <h4 className="text-[11px] font-black uppercase mb-1">
                        {item.material?.name}
                      </h4>
                      <p className="text-[9px] font-mono text-white/20 uppercase tracking-tighter">
                        Bal:{" "}
                        <span className="text-emerald-400">
                          {item.totalRemaining}
                        </span>{" "}
                        {item.material?.unit}
                      </p>
                    </div>
                    <Package
                      size={18}
                      className="opacity-10 group-hover:opacity-100 group-hover:text-emerald-500 transition-all"
                    />
                  </div>
                ))}
                {linkedMaterials.length === 0 && (
                  <div className="col-span-2 py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem] opacity-20">
                    <Package size={40} className="mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">
                      No Linked Materials
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {supplierOrders.map((po: any) => (
                  <div
                    key={po.id}
                    className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-5">
                      <History size={20} className="text-white/20" />
                      <div>
                        <h4 className="text-[11px] font-black uppercase">
                          PO #{po.id.slice(-4).toUpperCase()}
                        </h4>
                        <p className="text-[9px] font-bold text-white/40 uppercase mt-1">
                          Status: {po.status}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black font-mono">
                        ₵{po.totalCost.toFixed(2)}
                      </span>
                      <p className="text-[8px] opacity-20 font-black uppercase mt-1">
                        Items: {po.items?.length || 0}
                      </p>
                    </div>
                  </div>
                ))}
                {supplierOrders.length === 0 && (
                  <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem] opacity-20">
                    <History size={40} className="mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">
                      No Purchase History
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
