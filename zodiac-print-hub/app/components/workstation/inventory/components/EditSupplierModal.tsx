"use client";

import { useState } from "react";
import { useDataStore } from "@store/core/useDataStore";
import { useModalStore } from "@store/useModalStore";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Tag,
  RefreshCw,
  X,
  Loader2,
} from "lucide-react";

export function EditSupplierModal({ supplierId }: { supplierId: string }) {
  const { closeModal } = useModalStore();
  const { updateSupplier, procurementState } = useDataStore();
  const existing = procurementState.suppliers[supplierId];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: existing?.name || "",
    email: existing?.email || "",
    phone: existing?.phone || "",
    address: existing?.address || "",
    category: existing?.category || "Substrates",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateSupplier(supplierId, form);
      closeModal("GLOBAL");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-[480px] bg-[#0A0A0A] border border-white/10 rounded-[3rem] p-10 text-white shadow-3xl animate-in fade-in zoom-in-95">
      <header className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 flex items-center justify-center border border-cyan-400/20">
            <RefreshCw className="text-cyan-400" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tight">
              Modify Provider
            </h2>
            <p className="text-[9px] text-cyan-400 font-black uppercase tracking-[0.3em]">
              Update Registry ID: {supplierId.slice(-6)}
            </p>
          </div>
        </div>
        <button
          onClick={() => closeModal("GLOBAL")}
          className="opacity-20 hover:opacity-100 transition-opacity"
        >
          <X size={20} />
        </button>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2 px-1">
          <label className="text-[9px] font-black uppercase text-white/30 tracking-widest flex items-center gap-2">
            <Building2 size={10} /> Entity Name
          </label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-cyan-400/50 outline-none transition-all font-mono"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 px-1">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-white/30 tracking-widest flex items-center gap-2 font-mono">
              {" "}
              <Mail size={10} /> Email{" "}
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold font-mono outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-white/30 tracking-widest flex items-center gap-2 font-mono">
              {" "}
              <Phone size={10} /> Phone{" "}
            </label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold font-mono outline-none"
            />
          </div>
        </div>

        <div className="space-y-2 px-1">
          <label className="text-[9px] font-black uppercase text-white/30 tracking-widest flex items-center gap-2">
            <Tag size={10} /> Supply Domain
          </label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none appearance-none"
          >
            <option value="Substrates">Substrates</option>
            <option value="Ink">Ink & Consumables</option>
            <option value="Hardware">Hardware & Parts</option>
          </select>
        </div>

        <button
          disabled={isSubmitting}
          className="w-full mt-6 bg-white text-black font-black uppercase text-[10px] py-5 rounded-[2rem] flex items-center justify-center gap-3 hover:bg-cyan-400 active:scale-95 transition-all shadow-2xl"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              {" "}
              <RefreshCw size={18} /> Update Provider Identity{" "}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
