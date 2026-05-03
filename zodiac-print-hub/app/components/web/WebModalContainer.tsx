"use client";

import { useWebModal } from "../../store/webModalStore";
import { X, Globe, ShieldCheck, Zap, Layers, BarChart3 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { WasteAuditContent } from "./modals/WasteAuditContent";

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
              {activeModal === "PRICING" && <PricingContent />}
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

/**
 * PRICING_CONTENT_NODE
 * Implementation coming in the next turn...
 */
function PricingContent() {
  return (
    <div className="flex flex-col items-center py-10">
      <div className="w-16 h-16 rounded-3xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mb-6">
        <Zap className="text-cyan-400" size={32} />
      </div>
      <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4">
        Tier Configuration
      </h2>
      <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.4em] mb-12">
        Scalable Industrial Licensing
      </p>
      <div className="h-40 w-full border border-dashed border-white/5 rounded-[2rem] flex items-center justify-center opacity-20 uppercase font-black tracking-widest text-xs">
        Deploying Pricing Node...
      </div>
    </div>
  );
}

/**
 * SOLUTIONS_CONTENT_NODE
 */
function SolutionsContent() {
  return (
    <div className="flex flex-col items-center py-10">
      <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
        <Layers className="text-emerald-500" size={32} />
      </div>
      <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4">
        System Blueprint
      </h2>
      <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.4em] mb-12">
        Universal Production Workflow
      </p>
      <div className="h-40 w-full border border-dashed border-white/5 rounded-[2rem] flex items-center justify-center opacity-20 uppercase font-black tracking-widest text-xs">
        Mapping Node Architecture...
      </div>
    </div>
  );
}

/**
 * ACCESS_REQUEST_NODE
 */
function AccessRequestContent() {
  return (
    <div className="flex flex-col items-center py-10">
      <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
        <ShieldCheck className="text-white/40" size={32} />
      </div>
      <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4">
        Request Node
      </h2>
      <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.4em] mb-12">
        Industrial Authorization
      </p>
      <div className="h-40 w-full border border-dashed border-white/5 rounded-[2rem] flex items-center justify-center opacity-20 uppercase font-black tracking-widest text-xs">
        Initializing Secure Form...
      </div>
    </div>
  );
}
