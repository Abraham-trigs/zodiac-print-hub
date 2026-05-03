"use client";

import { useDataStore } from "@store/core/useDataStore";
import { selectSuppliersArray } from "@store/selectors/data.selectors";
import {
  Building2,
  Mail,
  Phone,
  Package,
  Plus,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { useModalStore } from "@store/useModalStore";

export function SupplierRegistry() {
  const suppliers = useDataStore(selectSuppliersArray);
  const { openModal } = useModalStore();

  return (
    <div className="flex flex-col h-full p-8 text-white animate-in fade-in duration-500">
      {/* --- HEADER --- */}
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
            Supplier Registry
          </h2>
          <p className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.4em] mt-2">
            Verified Procurement Partners
          </p>
        </div>

        <button
          onClick={() => openModal("GLOBAL", "ADD_SUPPLIER_MODAL")} // We'll build this next
          className="bg-white text-black px-6 py-3 rounded-2xl flex items-center gap-3 font-black uppercase text-[10px] hover:bg-cyan-400 transition-all active:scale-95 shadow-xl shadow-white/5"
        >
          <Plus size={16} />
          Register Provider
        </button>
      </div>

      {/* --- SUPPLIER GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2 custom-scrollbar">
        {suppliers.map((sup: any) => (
          <div
            key={sup.id}
            className="glass-card p-6 border-white/5 bg-white/[0.02] hover:border-cyan-400/30 transition-all group cursor-pointer"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 flex items-center justify-center border border-cyan-400/20 group-hover:bg-cyan-400 group-hover:text-black transition-all">
                <Building2 size={24} />
              </div>
              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">
                {sup.category || "GENERAL"}
              </span>
            </div>

            <h3 className="text-xl font-black uppercase tracking-tight mb-4 group-hover:text-cyan-400 transition-colors">
              {sup.name}
            </h3>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-white/40">
                <Mail size={14} className="text-cyan-400/50" />
                <span className="text-[10px] font-bold truncate">
                  {sup.email || "No email on file"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-white/40">
                <Phone size={14} className="text-cyan-400/50" />
                <span className="text-[10px] font-bold">
                  {sup.phone || "No phone on file"}
                </span>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Package size={12} className="text-white/20" />
                <span className="text-[9px] font-black uppercase text-white/40">
                  {sup._count?.materials || 0} Linked Materials
                </span>
              </div>
              <ChevronRight
                size={16}
                className="text-white/10 group-hover:text-cyan-400 transition-all"
              />
            </div>
          </div>
        ))}

        {suppliers.length === 0 && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center opacity-10 border-2 border-dashed border-white/10 rounded-[3rem]">
            <Building2 size={64} />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] mt-6">
              Registry Empty
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
