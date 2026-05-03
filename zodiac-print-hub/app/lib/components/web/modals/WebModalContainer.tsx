"use client";

import { useWebModal } from "@/store/webModalStore";
import { X, Globe, ShieldCheck, Zap, Layers, BarChart3 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { WasteAuditContent } from "./WasteAuditContent";
import { PricingContent } from "./PricingContent";
import { SolutionsContent } from "./SolutionsContent";
import { AccessRequestContent } from "./AccessRequestContent";

export function WebModalContainer() {
  const { activeModal, closeModal } = useWebModal();

  return (
    <AnimatePresence mode="wait">
      {activeModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 backdrop-blur-2xl bg-black/80"
        >
          {/* Backdrop Tap-to-Close Area */}
          <div className="absolute inset-0" onClick={closeModal} />

          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-6xl h-[90vh] md:h-[85vh] bg-[#0A0A0A] border border-white/10 rounded-[2rem] md:rounded-[3rem] relative overflow-hidden shadow-[0_0_100px_rgba(34,211,238,0.1)] flex flex-col z-10"
          >
            {/* CLOSE BUTTON - Industrial Floating Style */}
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 md:top-8 md:right-8 p-4 bg-white/5 rounded-full hover:bg-red-500/20 hover:text-red-500 transition-all z-[60] group"
            >
              <X
                size={20}
                className="group-hover:rotate-90 transition-transform duration-300"
              />
            </button>

            {/* MODAL CONTENT SWITCHER */}
            <div className="flex-1 overflow-y-auto p-6 md:p-16 custom-scrollbar">
              {activeModal === "WASTE_AUDIT" && <WasteAuditContent />}
              {activeModal === "PRICING" && <PricingContent />}{" "}
              {activeModal === "SOLUTIONS" && <SolutionsContent />}
              {activeModal === "ACCESS_REQUEST" && <AccessRequestContent />}
            </div>

            {/* MODAL FOOTER DECOR - Technical Data */}
            <div className="h-12 border-t border-white/5 bg-black/40 flex items-center justify-between px-10 font-mono text-[7px] text-white/10 uppercase tracking-[0.4em]">
              <span>Node: Global_Terminal_v2</span>
              <span className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
                Encrypted Session Active
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
