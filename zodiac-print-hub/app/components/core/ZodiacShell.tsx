"use client";

import { useEffect } from "react";
import { useZodiac } from "../../zodiac/store/zodiac.store";
import { useModalStore } from "../../zodiac/store/useModalStore";
import { resolveLayout } from "../../zodiac/view/layout.engine";
import { TopBar } from "../TopBar";
import { BottomBar } from "../BottomBar";
import { getCachedScreen } from "../../zodiac/view/screen.cache";
import { useAccessStore } from "../../zodiac/store/useAccessStore";
import { useAppBootStore } from "../../zodiac/store/useAppBootStore";
import { useDataStore } from "../../zodiac/store/core/useDataStore";
import { pathToScreen } from "@/view/screen.router";

export function ZodiacShell() {
  const { activeScreenId, viewMode, sharedAction, setSharedAction, setScreen } =
    useZodiac();

  const bootstrapAccess = useAccessStore((s) => s.bootstrapAccess);
  const initData = useDataStore((s) => s.initData);
  const isHydrated = useAppBootStore((s) => s.isHydrated);
  const setHydrated = useAppBootStore((s) => s.setHydrated);

  // ✅ Extract both Components and their stable Props from the store
  const TopModal = useModalStore((s) => s.activeTopComponent);
  const topProps = useModalStore((s) => s.activeTopProps);

  const DownModal = useModalStore((s) => s.activeDownComponent);
  const downProps = useModalStore((s) => s.activeDownProps);

  const DetailModal = useModalStore((s) => s.activeDetailComponent);
  const detailProps = useModalStore((s) => s.activeDetailProps);

  const GlobalModal = useModalStore((s) => s.activeGlobalComponent);
  const globalProps = useModalStore((s) => s.activeGlobalProps);

  const {
    isTransitioning,
    topHeightStyle,
    showDownZone,
    TopZoneComponent,
    DownZoneComponent,
  } = resolveLayout(activeScreenId, viewMode);

  const isDetail = viewMode === "DETAIL";

  // --- Boot & URL Sync Logic (No changes needed here) ---
  useEffect(() => {
    let alive = true;
    const boot = async () => {
      try {
        await bootstrapAccess();
        if (!alive) return;
        setHydrated(true);
        initData().catch((err) => console.error("Data boot failed:", err));
      } catch (err) {
        if (alive) setHydrated(true);
      }
    };
    boot();
    return () => {
      alive = false;
    };
  }, [bootstrapAccess, initData, setHydrated]);

  useEffect(() => {
    const syncFromUrl = () => {
      const targetScreen = pathToScreen(window.location.pathname);
      setScreen(targetScreen);
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, [setScreen]);

  if (!isHydrated)
    return (
      <div className="flex items-center justify-center h-full text-white">
        Loading system...
      </div>
    );

  // =====================================================
  // Screen Resolution Logic
  // =====================================================
  const cached = getCachedScreen(activeScreenId);

  // Logic: Use Modal if active, else cached screen component, else layout default
  const TopContent = TopModal || cached?.Top || TopZoneComponent;
  const DownContent = DownModal || cached?.Down || DownZoneComponent;

  return (
    <div className="zodiac-shell flex flex-col h-full overflow-hidden bg-black text-white relative">
      {/* Global Zone */}
      {GlobalModal && (
        <div className="absolute inset-0 z-[100] bg-black/80 flex items-center justify-center">
          <GlobalModal {...globalProps} />
        </div>
      )}

      {/* Detail Zone */}
      {DetailModal && (
        <div className="absolute inset-0 z-50 bg-black">
          <DetailModal {...detailProps} />
        </div>
      )}

      <header className="zodiac-topbar pt-2 shrink-0">
        <TopBar />
      </header>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* TOP ZONE */}
        <section
          className={`zodiac-top transition-all duration-500 relative z-10 ${isTransitioning ? "opacity-80 scale-[0.99]" : "opacity-100 scale-100"}`}
          style={{ height: topHeightStyle }}
        >
          <div className="modal-box p-4 h-full">
            {TopContent && (
              <TopContent
                {...(TopModal ? topProps : {})}
                key={TopModal ? undefined : `top-${activeScreenId}`}
              />
            )}
          </div>
        </section>

        {/* DOWN ZONE */}
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
                key={DownModal ? undefined : `down-${activeScreenId}`}
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
