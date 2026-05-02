"use client";

import { useDataStore } from "@store/core/useDataStore";
import { useModalStore } from "@store/useModalStore";
import { selectSuppliersArray } from "@store/selectors/data.selectors";
import {
  Building2,
  Mail,
  Phone,
  Plus,
  Search,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { AddSupplierModal } from "../modals/AddSupplierModal";
import { EditSupplierModal } from "../modals/EditSupplierModal";

export function SupplierRegistryScreen() {
  const { openModal } = useModalStore();
  const suppliers = useDataStore(selectSuppliersArray);
  const [search, setSearch] = useState("");

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full p-8 text-white animate-in fade-in duration-500">
      {/* --- HEADER --- */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
            Supplier Vault
          </h2>
          <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.4em] mt-2">
            Verified Procurement Partners
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-cyan-400 transition-colors"
              size={16}
            />
            <input
              placeholder="Search Registry..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-6 text-[10px] font-black uppercase tracking-widest focus:border-cyan-400/40 outline-none transition-all w-64"
            />
          </div>
          <button
            onClick={() => openModal("GLOBAL", AddSupplierModal)}
            className="bg-white text-black px-6 py-3 rounded-2xl flex items-center gap-3 font-black uppercase text-[10px] hover:bg-emerald-400 transition-all active:scale-95 shadow-xl shadow-white/5"
          >
            <Plus size={16} />
            New Provider
          </button>
        </div>
      </div>

      {/* --- REGISTRY GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2 custom-scrollbar">
        {filtered.map((sup: any) => (
          <div
            key={sup.id}
            onClick={() =>
              openModal("GLOBAL", <EditSupplierModal supplierId={sup.id} />)
            }
            className="glass-card p-6 border-white/5 bg-white/[0.02] hover:border-emerald-500/30 transition-all group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Building2 size={80} />
            </div>

            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                <ShieldCheck size={24} />
              </div>
              <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-400/5 px-2 py-1 rounded-md border border-emerald-400/10">
                {sup.category || "Standard"}
              </span>
            </div>

            <h3 className="text-xl font-black uppercase tracking-tight mb-4 group-hover:text-emerald-400 transition-colors">
              {sup.name}
            </h3>

            <div className="space-y-3 mb-6 relative z-10">
              <div className="flex items-center gap-3 text-white/40 group-hover:text-white/60 transition-colors">
                <Mail size={14} className="text-emerald-400/50" />
                <span className="text-[10px] font-bold truncate">
                  {sup.email || "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-white/40 group-hover:text-white/60 transition-colors">
                <Phone size={14} className="text-emerald-400/50" />
                <span className="text-[10px] font-bold">
                  {sup.phone || "N/A"}
                </span>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex justify-between items-center relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase text-white/20">
                  ID: {sup.id.slice(-6).toUpperCase()}
                </span>
              </div>
              <button
                className="text-[9px] font-black uppercase text-cyan-400 flex items-center gap-1 hover:underline"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent opening the edit modal when clicking this button
                  /* Navigation logic for materials here */
                }}
              >
                View Materials <ExternalLink size={10} />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
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
