"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Building2,
  MapPin,
  Zap,
  Loader2,
  CheckCircle2,
  ChevronRight,
  Database,
} from "lucide-react";
import { HandshakeButton } from "../HandshakeButton";

type FormStep = "IDENTITY" | "CAPACITY" | "SUCCESS";

export function AccessRequestContent() {
  const [step, setStep] = useState<FormStep>("IDENTITY");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    orgName: "",
    location: "Accra",
    staffCount: "1-5",
    volume: "Standard",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 🚀 SIMULATED API HANDSHAKE
    await new Promise((r) => setTimeout(r, 2000));
    setIsSubmitting(false);
    setStep("SUCCESS");
  };

  if (step === "SUCCESS") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/10">
          <CheckCircle2 className="text-emerald-500" size={48} />
        </div>
        <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4 text-white">
          Handshake Confirmed
        </h2>
        <p className="text-white/40 text-sm max-w-sm uppercase font-black tracking-widest leading-relaxed">
          Your organization has been queued for Node Authorization. Our
          technical team will reach out to verify your workshop specs.
        </p>
        <div className="mt-12 p-4 bg-white/5 border border-white/5 rounded-2xl font-mono text-[10px] text-white/20 uppercase tracking-[0.4em]">
          Session_ID: AUTH_7x2a_NODE_ACTIVE
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      <header className="text-center mb-12">
        <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="text-cyan-400" size={32} />
        </div>
        <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-2">
          Request Access
        </h2>
        <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.4em]">
          Initialize New Industrial Node
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === "IDENTITY" ? (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-white/30 tracking-[0.2em] flex items-center gap-2">
                <Building2 size={12} /> Legal Organization Name
              </label>
              <input
                required
                value={form.orgName}
                onChange={(e) => setForm({ ...form, orgName: e.target.value })}
                placeholder="e.g. Graphic Node Ghana"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold focus:border-cyan-400/50 outline-none transition-all placeholder:text-white/10"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-white/30 tracking-[0.2em] flex items-center gap-2">
                <MapPin size={12} /> Workshop Location
              </label>
              <select
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold appearance-none cursor-pointer outline-none focus:border-cyan-400/50"
              >
                <option value="Accra">Greater Accra Region</option>
                <option value="Kumasi">Ashanti Region</option>
                <option value="Takoradi">Western Region</option>
                <option value="Tamale">Northern Region</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setStep("CAPACITY")}
              disabled={!form.orgName}
              className="w-full py-6 bg-white text-black rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3 hover:bg-cyan-400 transition-all active:scale-95 disabled:opacity-20"
            >
              Continue Configuration <ChevronRight size={18} />
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-white/30 tracking-[0.2em]">
                  Staff Count
                </label>
                <select
                  value={form.staffCount}
                  onChange={(e) =>
                    setForm({ ...form, staffCount: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold appearance-none outline-none"
                >
                  <option value="1-5">1 - 5 Staff</option>
                  <option value="6-15">6 - 15 Staff</option>
                  <option value="15+">15+ Staff</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-white/30 tracking-[0.2em]">
                  Volume Node
                </label>
                <select
                  value={form.volume}
                  onChange={(e) => setForm({ ...form, volume: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold appearance-none outline-none"
                >
                  <option value="Standard">Standard Velocity</option>
                  <option value="Industrial">High Production</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-white/30 tracking-[0.2em]">
                Administrator Email
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@yourshop.com"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold focus:border-cyan-400/50 outline-none transition-all placeholder:text-white/10"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !form.email}
              className="w-full py-6 bg-cyan-400 text-black rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3 hover:bg-white transition-all active:scale-95 disabled:opacity-20 shadow-2xl shadow-cyan-400/20"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Zap size={20} /> Authorize Handshake
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep("IDENTITY")}
              className="w-full text-[9px] font-black uppercase text-white/20 hover:text-white transition-colors"
            >
              Back to Identity
            </button>
          </div>
        )}
      </form>

      <footer className="mt-12 flex items-center justify-center gap-2 opacity-20">
        <Database size={10} />
        <span className="text-[8px] font-black uppercase tracking-[0.3em]">
          Encrypted Lead Storage Active
        </span>
      </footer>
    </div>
  );
}
