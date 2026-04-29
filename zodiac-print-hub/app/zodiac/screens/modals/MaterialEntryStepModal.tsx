// "use client";

// import { useState, useEffect, useMemo } from "react";
// import { useDataStore } from "@store/core/useDataStore";
// import { useModalStore } from "@/store/useModalStore";
// import { useZodiac } from "@store/zodiac.store";
// import { shallow } from "zustand/shallow";
// import { MeasurementCalculator } from "@lib/utils/measurement-calculator";
// import { UnitVaultScreen } from "@screens/UnitVaultScreen";

// type MaterialStep =
//   | "IDENTITY"
//   | "UNIT_VAULT_GATE"
//   | "MEASUREMENT"
//   | "BUYING_PRICE"
//   | "PRICING";

// export function MaterialEntryStepModal() {
//   const [step, setStep] = useState<MaterialStep>("IDENTITY");
//   const { closeModal, openModal } = useModalStore();
//   const { setScreen } = useZodiac();
//   const draft = useDataStore((s) => s.draftState.draft, shallow);
//   const setDraft = (updates: any) => useDataStore.getState().setDraft(updates);

//   useEffect(() => {
//     if (draft?.activeStep) {
//       setStep(draft.activeStep as MaterialStep);
//       setDraft({ activeStep: null });
//     }
//   }, [draft?.activeStep]);

//   const unitCategory = useMemo(
//     () => MeasurementCalculator.getCategory(draft?.unit as any),
//     [draft?.unit],
//   );
//   const needsDimensions =
//     unitCategory === "DIMENSION" || unitCategory === "AREA";

//   const handleOpenVault = (currentStep: MaterialStep) => {
//     setDraft({ activeStep: currentStep });
//     openModal("GLOBAL", UnitVaultScreen.TopComponent);
//   };

//   const handleSelectFromData = () => {
//     setScreen("MATERIAL_SERVICE_CATALOG");
//   };

//   const handleSave = async () => {
//     await useDataStore.getState().createPrice({
//       ...draft,
//       orgId: useDataStore.getState().orgId,
//       isPhysical: true,
//     });
//     closeModal("DOWN");
//   };

//   return (
//     <div className="flex flex-col h-full w-full p-4 text-white overflow-hidden">
//       <div className="w-full text-center animate-in slide-in-from-bottom-4 duration-500">
//         <span className="text-[7px] font-black text-cyan-400 uppercase tracking-[0.4em] mb-4 block">
//           JOINERY: {step.replace("_", " ")}
//         </span>

//         {/* STEP 1: IDENTITY */}
//         {step === "IDENTITY" && (
//           <div className="flex flex-col gap-4 animate-in fade-in">
//             <span className="label-tiny">Step 1: Material Identity</span>

//             <input
//               autoFocus
//               className="input-large !text-4xl"
//               placeholder="Enter New Name..."
//               value={draft?.name || ""}
//               onChange={(e) => setDraft({ name: e.target.value })}
//               onKeyDown={(e) =>
//                 e.key === "Enter" && draft?.name && setStep("UNIT_VAULT_GATE")
//               }
//             />

//             <div className="flex flex-col gap-2">
//               <button
//                 disabled={!draft?.name}
//                 onClick={() => setStep("UNIT_VAULT_GATE")}
//                 className="confirm-btn bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
//               >
//                 Create New Name →
//               </button>

//               <div className="flex items-center gap-2 py-1">
//                 <div className="h-px bg-white/5 flex-1" />
//                 <span className="text-[8px] font-black text-white/10 uppercase">
//                   OR
//                 </span>
//                 <div className="h-px bg-white/5 flex-1" />
//               </div>

//               <button
//                 onClick={handleSelectFromData}
//                 className="confirm-btn !py-3 border-cyan-400/20 text-cyan-400"
//               >
//                 Select from data
//               </button>
//             </div>
//           </div>
//         )}

//         {/* STEP 2: UNIT VAULT */}
//         {step === "UNIT_VAULT_GATE" && (
//           <div className="flex flex-col gap-4 animate-in slide-in-from-right">
//             <span className="label-tiny">Step 2: Measurement Basis</span>
//             <button
//               onClick={() => handleOpenVault("UNIT_VAULT_GATE")}
//               className="py-10 border-2 border-dashed border-cyan-400/20 rounded-[2rem] text-2xl font-black text-white bg-cyan-400/5 hover:border-cyan-400/50 transition-all"
//             >
//               {draft?.unit || "CHOOSE UNIT"}
//             </button>
//             <button
//               disabled={!draft?.unit}
//               onClick={() =>
//                 needsDimensions
//                   ? setStep("MEASUREMENT")
//                   : setStep("BUYING_PRICE")
//               }
//               className="confirm-btn bg-white text-black"
//             >
//               Confirm & Continue →
//             </button>
//           </div>
//         )}

//         {/* STEP 3: MEASUREMENT */}
//         {step === "MEASUREMENT" && (
//           <div className="flex flex-col gap-4 animate-in slide-in-from-right">
//             <span className="label-tiny">
//               Step 3: Physical Size ({draft?.unit})
//             </span>
//             <div className="flex gap-4 items-center justify-center py-2">
//               <input
//                 type="number"
//                 className="input-anchor"
//                 placeholder="W"
//                 value={draft?.width || ""}
//                 onChange={(e) => setDraft({ width: Number(e.target.value) })}
//               />
//               <span className="opacity-10 text-2xl">×</span>
//               <input
//                 type="number"
//                 className="input-anchor"
//                 placeholder="H"
//                 value={draft?.height || ""}
//                 onChange={(e) => setDraft({ height: Number(e.target.value) })}
//               />
//             </div>
//             <button
//               onClick={() => setStep("BUYING_PRICE")}
//               className="confirm-btn"
//             >
//               Confirm Dimensions →
//             </button>
//           </div>
//         )}

//         {/* STEP 4: BUYING PRICE */}
//         {step === "BUYING_PRICE" && (
//           <div className="flex flex-col gap-4 animate-in slide-in-from-right">
//             <span className="label-tiny">Step 4: Purchase Price</span>
//             <input
//               type="number"
//               className="input-large !text-6xl"
//               placeholder="0.00"
//               value={draft?.costPrice || ""}
//               onChange={(e) => setDraft({ costPrice: Number(e.target.value) })}
//             />
//             <button onClick={() => setStep("PRICING")} className="confirm-btn">
//               Confirm Buying Price →
//             </button>
//           </div>
//         )}

//         {/* STEP 5: PRICING */}
//         {step === "PRICING" && (
//           <div className="flex flex-col gap-4 animate-in slide-in-from-right">
//             <span className="label-tiny text-cyan-400">
//               Step 5: Final Selling Rate
//             </span>
//             <input
//               type="number"
//               className="input-large !text-7xl"
//               placeholder="0.00"
//               value={draft?.priceGHS || ""}
//               onChange={(e) => setDraft({ priceGHS: Number(e.target.value) })}
//               onKeyDown={(e) => e.key === "Enter" && handleSave()}
//             />
//             <button
//               onClick={handleSave}
//               className="confirm-btn bg-cyan-400 text-black"
//             >
//               Finalize & Create →
//             </button>
//           </div>
//         )}
//       </div>

//       <style jsx>{`
//         .label-tiny {
//           @apply text-[7px] font-black text-white/20 uppercase tracking-[0.3em] mb-1 block;
//         }
//         .input-large {
//           @apply w-full bg-transparent text-center font-black outline-none border-b border-white/10 focus:border-cyan-400 transition-all;
//         }
//         .input-anchor {
//           @apply w-24 bg-transparent text-center text-3xl font-black outline-none border-b border-white/5 focus:border-cyan-400 transition-all;
//         }
//         .confirm-btn {
//           @apply w-full py-4 bg-white/5 border border-white/10 rounded-[1.2rem] text-white font-black uppercase text-[10px] active:scale-95 transition-all disabled:opacity-10;
//         }
//       `}</style>
//     </div>
//   );
// }

// MaterialEntryStepModal.modalId = "MATERIAL_ENTRY_STEP";
