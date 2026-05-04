"use client";

import { useState } from "react";
import {
  Zap,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Globe,
  MailCheck,
} from "lucide-react";
import { apiClient } from "@lib/client/api/client";
import { useRouter } from "next/navigation";

export default function SlugLoginScreen() {
  const router = useRouter();

  // 1. STATE MACHINE
  // Added "SENT" state to handle the real-time feedback after magic link dispatch
  const [step, setStep] = useState<"SLUG" | "CREDENTIALS" | "SENT">("SLUG");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    slug: "",
    email: "",
  });

  const [orgData, setOrgData] = useState<any>(null);

  // 2. PHASE 1: Verify Node Slug (Multi-tenant Discovery)
  const handleVerifySlug = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 🚀 FIXED: Pointing to the actual discovery endpoint
      const res = await apiClient<{ data: { organisation: any } }>(
        `/api/auth/verify-node?slug=${form.slug.toLowerCase().trim()}`,
      );

      if (res.data?.organisation) {
        setOrgData(res.data.organisation);
        setStep("CREDENTIALS");
      } else {
        setError("Industrial Node not found.");
      }
    } catch (err: any) {
      setError(err.message || "Connection to Central Core failed.");
    } finally {
      setLoading(false);
    }
  };

  // 3. PHASE 2: Final Handshake (Magic Link Dispatch)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 🚀 FIXED: Call the login route we verified (writes to Outbox)
      await apiClient("/api/auth/login", {
        method: "POST",
        body: {
          email: form.email,
          orgSlug: orgData.slug,
        },
      });

      // Update state to show success screen
      setStep("SENT");
    } catch (err: any) {
      setError(err.message || "Authorization request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* --- NEBULA ATMOSPHERE --- */}
      <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[0%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="scanline absolute inset-0 opacity-[0.05] pointer-events-none" />

      {/* --- LOGIN BOX --- */}
      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in-95 duration-700">
        {/* BRANDING */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
            <Zap className="text-black" size={32} />
          </div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">
            Zodiac Terminal
          </h1>
          <p className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.4em] mt-2">
            Authorization Required
          </p>
        </div>

        <div className="glass-card p-10 rounded-[3rem] border border-white/10 bg-white/[0.02] backdrop-blur-xl relative overflow-hidden shadow-2xl">
          {step === "SLUG" && (
            /* --- STEP 1: NODE DISCOVERY --- */
            <form
              onSubmit={handleVerifySlug}
              className="space-y-8 animate-in slide-in-from-right-4 duration-500"
            >
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase text-white/30 tracking-[0.2em] flex items-center gap-2">
                  <Globe size={12} /> Workshop Node Slug
                </label>
                <div className="relative">
                  <input
                    autoFocus
                    required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="e.g. accra-main"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold focus:border-cyan-400 outline-none transition-all placeholder:text-white/5 text-white"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-black text-white/10 uppercase">
                    .node
                  </span>
                </div>
                {error && (
                  <p className="text-[9px] text-red-400 font-black uppercase tracking-widest pl-2">
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !form.slug}
                className="w-full py-6 bg-white text-black rounded-[2rem] font-black uppercase text-xs flex items-center justify-center gap-3 hover:bg-cyan-400 transition-all active:scale-95 disabled:opacity-20 shadow-2xl"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Find Node <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          {step === "CREDENTIALS" && (
            /* --- STEP 2: OPERATOR EMAIL --- */
            <form
              onSubmit={handleLogin}
              className="space-y-8 animate-in slide-in-from-right-4 duration-500"
            >
              <div className="flex items-center gap-4 mb-4 p-4 bg-cyan-400/5 border border-cyan-400/10 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-cyan-400 flex items-center justify-center font-black text-black text-xs shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                  {orgData?.name?.charAt(0) || "Z"}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-white tracking-tight">
                    {orgData?.name}
                  </p>
                  <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest">
                    Active Node Authorized
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-white/30 tracking-[0.2em]">
                    Operator Email
                  </label>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="name@zodiac.com"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold focus:border-cyan-400 outline-none text-white transition-all"
                  />
                </div>
                {error && (
                  <p className="text-[9px] text-red-400 font-black uppercase tracking-widest pl-2">
                    {error}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-6 bg-cyan-400 text-black rounded-[2rem] font-black uppercase text-xs flex items-center justify-center gap-3 hover:bg-white transition-all active:scale-95 shadow-2xl shadow-cyan-400/20"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      Send Magic Link <ShieldCheck size={18} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("SLUG");
                    setError("");
                  }}
                  className="w-full text-[9px] font-black uppercase text-white/20 hover:text-white transition-colors"
                >
                  Switch Node
                </button>
              </div>
            </form>
          )}

          {step === "SENT" && (
            /* --- STEP 3: SUCCESS FEEDBACK --- */
            <div className="text-center py-6 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                <MailCheck className="text-emerald-400" size={32} />
              </div>
              <h3 className="text-xl font-black uppercase text-white mb-2">
                Check Your Inbox
              </h3>
              <p className="text-[10px] text-white/40 font-bold uppercase leading-relaxed tracking-widest mb-10 px-4">
                An authorization link has been dispatched to{" "}
                <span className="text-emerald-400">{form.email}</span>. Click it
                to initialize your session.
              </p>
              <button
                onClick={() => setStep("CREDENTIALS")}
                className="text-[9px] font-black uppercase text-cyan-400 hover:text-white tracking-widest underline underline-offset-8"
              >
                Wait, I used the wrong email
              </button>
            </div>
          )}
        </div>

        {/* FOOTER DATA */}
        <div className="mt-12 flex items-center justify-center gap-4 font-mono text-[8px] text-white/10 uppercase tracking-[0.5em]">
          <span className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />{" "}
            SECURE_LINK
          </span>
          <span>v2.0-PROD</span>
        </div>
      </div>
    </div>
  );
}
