"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useZodiac } from "@store/zodiac.store";
import { useModalStore } from "@store/useModalStore";
import { resolveLayout } from "@shared/utils/resolveLayout";
import { TopBar } from "@components/TopBar";
import { BottomBar } from "@components/BottomBar";
import { getCachedScreen } from "@view/screen.cache";
import { useAuthStore } from "@store/useAuthStore"; // 🚀 LOGIC UPDATE: New Auth System
import { useDataStore } from "@store/core/useDataStore";
import { pathToScreen } from "@view/screen.router";

export function ZodiacShell() {
  const router = useRouter();
  const { activeScreenId, viewMode, setScreen } = useZodiac();

  // 🧠 V2 HANDSHAKE: Data & Auth orchestration
  const { initData, currentOrgId } = useDataStore();
  const { isAuthenticated, activeOrgId, checkSession } = useAuthStore();

  // Modals (From useModalStore)
  const TopModal = useModalStore((s) => s.activeTopComponent);
  const topProps = useModalStore((s) => s.activeTopProps);
  const DownModal = useModalStore((s) => s.activeDownComponent);
  const downProps = useModalStore((s) => s.activeDownProps);
  const DetailModal = useModalStore((s) => s.activeDetailComponent);
  const detailProps = useModalStore((s) => s.activeDetailProps);
  const GlobalModal = useModalStore((s) => s.activeGlobalComponent);
  const globalProps = useModalStore((s) => s.activeGlobalProps);

  // 📐 VERTICAL LAYOUT LOGIC (Your preferred view)
  const {
    isTransitioning,
    topHeightStyle,
    showDownZone,
    TopZoneComponent,
    DownZoneComponent,
  } = resolveLayout(activeScreenId, viewMode);

  const isDetail = viewMode === "DETAIL";

  // --- 🛰️ INDUSTRIAL BOOT LOGIC ---
  useEffect(() => {
    let alive = true;
    const boot = async () => {
      // 1. Verify session (The Keep-Alive check)
      const isValid = await checkSession();
      if (!alive) return;

      if (!isValid) {
        // 🚀 UPDATED: Direct route to your auth node
        router.push("/login");
        return;
      }

      // 2. Multi-tenant Sync (Only load if org context changed)
      if (activeOrgId && currentOrgId !== activeOrgId) {
        await initData(activeOrgId);
      }
    };
    boot();
    return () => {
      alive = false;
    };
  }, [activeOrgId, currentOrgId, initData, checkSession, router]);

  // --- 🛣️ URL / NAVIGATION SYNC ---
  useEffect(() => {
    const syncFromUrl = () => {
      const targetScreen = pathToScreen(window.location.pathname);
      setScreen(targetScreen);
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, [setScreen]);

  // CONTENT RESOLUTION
  const cached = getCachedScreen(activeScreenId);
  const TopContent = TopModal || cached?.Top || TopZoneComponent;
  const DownContent = DownModal || cached?.Down || DownZoneComponent;

  // Gate the entire UI behind authentication
  if (!isAuthenticated)
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <div className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.5em] animate-pulse">
          Authorizing Node...
        </div>
      </div>
    );

  return (
    <div className="zodiac-shell flex flex-col h-full overflow-hidden bg-black text-white relative font-sans">
      {/* 🌌 GLOBAL MODAL LAYER */}
      {GlobalModal && (
        <div className="absolute inset-0 z-[100] bg-black/80 flex items-center justify-center backdrop-blur-sm">
          <GlobalModal {...globalProps} />
        </div>
      )}

      {/* 🧪 DETAIL ZONE (Full Screen Overlay) */}
      {DetailModal && (
        <div className="absolute inset-0 z-50 bg-black animate-in slide-in-from-bottom-5 duration-500">
          <DetailModal {...detailProps} />
        </div>
      )}

      <header className="zodiac-topbar pt-2 shrink-0">
        <TopBar />
      </header>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* 🔼 TOP ZONE (Vertical) */}
        <section
          className={`zodiac-top transition-all duration-500 relative z-10 ${isTransitioning ? "opacity-80 scale-[0.99]" : "opacity-100 scale-100"}`}
          style={{ height: topHeightStyle }}
        >
          <div className="modal-box p-4 h-full">
            {TopContent && (
              <TopContent
                {...(TopModal ? topProps : {})}
                key={TopModal ? "modal" : `top-${activeScreenId}`}
              />
            )}
          </div>
        </section>

        {/* 🔽 DOWN ZONE (Vertical) */}
        <section
          className="zodiac-down flex-1 overflow-hidden relative transition-all duration-500"
          style={{
            opacity: !showDownZone || isDetail ? 0 : 1,
            transform:
              !showDownZone || isDetail
                ? "translateY(40px)"
                : "translateY(0px)",
            pointerEvents: !showDownZone || isDetail ? "none" : "auto",
          }}
        >
          <div className="modal-box p-4 h-full">
            {DownContent && (
              <DownContent
                {...(DownModal ? downProps : {})}
                key={DownModal ? "modal" : `down-${activeScreenId}`}
              />
            )}
          </div>
        </section>
      </main>

      <footer className="mt-auto shrink-0">
        <BottomBar />
      </footer>
    </div>
  );
}

// "use client";

// import { useEffect } from "react";
// import { useZodiac } from "@store/zodiac.store";
// import { useModalStore } from "@store/useModalStore";
// import { resolveLayout } from "@shared/utils/resolveLayout";
// import { TopBar } from "@components/TopBar";
// import { BottomBar } from "@components/BottomBar";
// import { getCachedScreen } from "@view/screen.cache";
// import { useAccessStore } from "@store/useAccessStore";
// import { useAppBootStore } from "@store/useAppBootStore";
// import { useDataStore } from "@store-core/useDataStore";
// import { pathToScreen } from "@view/screen.router";

// export function ZodiacShell() {
//   const { activeScreenId, viewMode, sharedAction, setSharedAction, setScreen } =
//     useZodiac();

//   const bootstrapAccess = useAccessStore((s) => s.bootstrapAccess);
//   const initData = useDataStore((s) => s.initData);
//   const isHydrated = useAppBootStore((s) => s.isHydrated);
//   const setHydrated = useAppBootStore((s) => s.setHydrated);

//   // ✅ Extract both Components and their stable Props from the store
//   const TopModal = useModalStore((s) => s.activeTopComponent);
//   const topProps = useModalStore((s) => s.activeTopProps);

//   const DownModal = useModalStore((s) => s.activeDownComponent);
//   const downProps = useModalStore((s) => s.activeDownProps);

//   const DetailModal = useModalStore((s) => s.activeDetailComponent);
//   const detailProps = useModalStore((s) => s.activeDetailProps);

//   const GlobalModal = useModalStore((s) => s.activeGlobalComponent);
//   const globalProps = useModalStore((s) => s.activeGlobalProps);

//   const {
//     isTransitioning,
//     topHeightStyle,
//     showDownZone,
//     TopZoneComponent,
//     DownZoneComponent,
//   } = resolveLayout(activeScreenId, viewMode);

//   const isDetail = viewMode === "DETAIL";

//   // --- Boot & URL Sync Logic (No changes needed here) ---
//   useEffect(() => {
//     let alive = true;
//     const boot = async () => {
//       try {
//         await bootstrapAccess();
//         if (!alive) return;
//         setHydrated(true);
//         initData().catch((err) => console.error("Data boot failed:", err));
//       } catch (err) {
//         if (alive) setHydrated(true);
//       }
//     };
//     boot();
//     return () => {
//       alive = false;
//     };
//   }, [bootstrapAccess, initData, setHydrated]);

//   useEffect(() => {
//     const syncFromUrl = () => {
//       const targetScreen = pathToScreen(window.location.pathname);
//       setScreen(targetScreen);
//     };
//     syncFromUrl();
//     window.addEventListener("popstate", syncFromUrl);
//     return () => window.removeEventListener("popstate", syncFromUrl);
//   }, [setScreen]);

//   if (!isHydrated)
//     return (
//       <div className="flex items-center justify-center h-full text-white">
//         Loading system...
//       </div>
//     );

//   // =====================================================
//   // Screen Resolution Logic
//   // =====================================================
//   const cached = getCachedScreen(activeScreenId);

//   // Logic: Use Modal if active, else cached screen component, else layout default
//   const TopContent = TopModal || cached?.Top || TopZoneComponent;
//   const DownContent = DownModal || cached?.Down || DownZoneComponent;

//   return (
//     <div className="zodiac-shell flex flex-col h-full overflow-hidden bg-black text-white relative">
//       {/* Global Zone */}
//       {GlobalModal && (
//         <div className="absolute inset-0 z-[100] bg-black/80 flex items-center justify-center">
//           <GlobalModal {...globalProps} />
//         </div>
//       )}

//       {/* Detail Zone */}
//       {DetailModal && (
//         <div className="absolute inset-0 z-50 bg-black">
//           <DetailModal {...detailProps} />
//         </div>
//       )}

//       <header className="zodiac-topbar pt-2 shrink-0">
//         <TopBar />
//       </header>

//       <main className="flex-1 flex flex-col overflow-hidden relative">
//         {/* TOP ZONE */}
//         <section
//           className={`zodiac-top transition-all duration-500 relative z-10 ${isTransitioning ? "opacity-80 scale-[0.99]" : "opacity-100 scale-100"}`}
//           style={{ height: topHeightStyle }}
//         >
//           <div className="modal-box p-4 h-full">
//             {TopContent && (
//               <TopContent
//                 {...(TopModal ? topProps : {})}
//                 key={TopModal ? undefined : `top-${activeScreenId}`}
//               />
//             )}
//           </div>
//         </section>

//         {/* DOWN ZONE */}
//         <section
//           className="zodiac-down flex-1 overflow-hidden relative transition-all duration-500"
//           style={{
//             opacity: !showDownZone || isDetail ? 0 : 1,
//             transform:
//               !showDownZone || isDetail
//                 ? "translateY(40px)"
//                 : "translateY(0px)",
//             pointerEvents: !showDownZone || isDetail ? "none" : "auto",
//           }}
//         >
//           <div className="modal-box p-4 h-full">
//             {DownContent && (
//               <DownContent
//                 {...(DownModal ? downProps : {})}
//                 key={DownModal ? undefined : `down-${activeScreenId}`}
//               />
//             )}
//           </div>
//         </section>
//       </main>

//       <footer className="mt-auto shrink-0">
//         <BottomBar />
//       </footer>
//     </div>
//   );
// }
