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
  Save,
  X,
  Loader2,
} from "lucide-react";

export function AddSupplierModal() {
  const { closeModal } = useModalStore();
  const { createSupplier } = useDataStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    category: "Substrates", // Default seed
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;

    setIsSubmitting(true);
    try {
      await createSupplier(form);
      closeModal("GLOBAL");
    } catch (err) {
      console.error("Procurement Node sync failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-[480px] bg-[#0A0A0A] border border-white/10 rounded-[3rem] p-10 text-white shadow-3xl animate-in fade-in zoom-in-95 duration-300">
      {/* --- HEADER --- */}
      <header className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Building2 className="text-emerald-500" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tight">
              Sync Provider
            </h2>
            <p className="text-[9px] text-emerald-500 font-black uppercase tracking-[0.3em]">
              Supply Chain Registry
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

      {/* --- FORM --- */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* PROVIDER NAME */}
        <div className="space-y-2 px-1">
          <label className="text-[9px] font-black uppercase text-white/30 tracking-widest flex items-center gap-2">
            <Building2 size={10} /> Legal Entity Name
          </label>
          <input
            required
            placeholder="e.g. Graphic Supply Co."
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-emerald-500/50 outline-none transition-all placeholder:opacity-20 font-mono"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 px-1">
          {/* EMAIL */}
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-white/30 tracking-widest flex items-center gap-2">
              <Mail size={10} /> Sales Email
            </label>
            <input
              type="email"
              placeholder="orders@provider.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-emerald-500/50 outline-none transition-all placeholder:opacity-20 font-mono"
            />
          </div>
          {/* PHONE */}
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-white/30 tracking-widest flex items-center gap-2">
              <Phone size={10} /> Contact Line
            </label>
            <input
              placeholder="+233..."
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-emerald-500/50 outline-none transition-all placeholder:opacity-20 font-mono"
            />
          </div>
        </div>

        {/* SUPPLY CATEGORY */}
        <div className="space-y-2 px-1">
          <label className="text-[9px] font-black uppercase text-white/30 tracking-widest flex items-center gap-2">
            <Tag size={10} /> Core Supply Domain
          </label>
          <div className="relative">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-emerald-500/50 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="Substrates">
                Substrates (Flex, Vinyl, Paper)
              </option>
              <option value="Ink">Ink & Chemical Consumables</option>
              <option value="Hardware">Hardware Parts & Servicing</option>
              <option value="Packaging">Logistics & Packaging</option>
            </select>
            <Tag
              size={14}
              className="absolute right-5 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none"
            />
          </div>
        </div>

        {/* WAREHOUSE ADDRESS */}
        <div className="space-y-2 px-1">
          <label className="text-[9px] font-black uppercase text-white/30 tracking-widest flex items-center gap-2">
            <MapPin size={10} /> Physical Fulfillment Node
          </label>
          <textarea
            placeholder="Warehouse or Office location..."
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-emerald-500/50 outline-none transition-all placeholder:opacity-20 h-20 resize-none font-mono"
          />
        </div>

        {/* --- ACTION --- */}
        <button
          disabled={isSubmitting || !form.name}
          className="w-full mt-6 bg-white text-black font-black uppercase text-[10px] py-5 rounded-[2rem] flex items-center justify-center gap-3 hover:bg-emerald-500 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 shadow-2xl shadow-emerald-500/10"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              <Save size={18} />
              Authorize Registry Sync
            </>
          )}
        </button>
      </form>
    </div>
  );
}
