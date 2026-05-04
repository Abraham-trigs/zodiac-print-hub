"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Zap, ShieldCheck } from "lucide-react";
import { useDataStore } from "@store/core/useDataStore";
import { useAuthStore } from "@store/useAuthStore"; // 🚀 Added Auth Store
import { apiClient } from "@/lib/client/api/client";

/**
 * AUTH_VERIFICATION_NODE
 * Invisible bridge that finalizes the magic link handshake.
 */
export default function VerifyMagicLinkPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const slug = searchParams.get("slug");

  const hasAttempted = useRef(false);
  const { initData } = useDataStore();
  const setSession = useAuthStore((s) => s.setSession); // 🧠 Connect to Auth logic

  useEffect(() => {
    // 🛡️ Prevent double-execution in StrictMode
    if (hasAttempted.current) return;

    async function validateSession() {
      if (!token || !slug) {
        router.push("/login?error=invalid_link");
        return;
      }

      hasAttempted.current = true;

      try {
        // 🚀 THE HANDSHAKE: Exchange magic token for a secure JWT session
        const res = await apiClient<{
          data: { token: string; orgId: string; user: any };
        }>(`/api/auth/verify?token=${token}&slug=${slug}`);

        if (res.data?.token) {
          // 1. ⚡ Update Auth Store (handles localStorage, role, and isAuthenticated)
          setSession(res.data.token, res.data.orgId, res.data.user);

          // 2. 🛰️ Boot the Industrial Node data for this Org
          await initData(res.data.orgId);

          // 3. 🏁 Transition to Industrial Dashboard
          router.push("/zodiac/welcome");
        } else {
          router.push("/login?error=handshake_failed");
        }
      } catch (err) {
        console.error("Node Authorization Failed", err);
        router.push("/login?error=expired_or_invalid");
      }
    }

    validateSession();
  }, [token, slug, router, initData, setSession]);

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-purple-600/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[0%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-500/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="flex flex-col items-center gap-8 z-10">
        <div className="w-16 h-16 rounded-[2rem] bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center relative">
          <Zap className="text-cyan-400" size={28} />
          <div className="absolute inset-0 border-2 border-cyan-400/40 rounded-[2rem] animate-ping opacity-20" />
        </div>

        <div className="text-center space-y-4">
          <h2 className="text-sm font-black uppercase italic tracking-[0.5em] text-white">
            Authorizing Node
          </h2>
          <div className="flex items-center justify-center gap-3">
            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
              Establishing Secure Handshake
            </span>
            <Loader2 size={12} className="text-cyan-400 animate-spin" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 flex items-center gap-3 font-mono text-[7px] text-white/10 uppercase tracking-[0.6em]">
        <ShieldCheck size={10} />
        SESSION_VERIFICATION_IN_PROGRESS
      </div>
    </div>
  );
}
