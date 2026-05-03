// "use client";

// import { useState } from "react";
// import { useDataStore } from "../../store/core/useDataStore";
// import { useModalStore } from "../../store/useModalStore";
// import { ServiceUnitEnum } from "@lib/schema/job.schema";

// export function PriceCreationModal() {
//   const { createPrice } = useDataStore();
//   const { closeModal } = useModalStore();

//   const [form, setForm] = useState({
//     name: "",
//     category: "",
//     unit: "piece", // Default unit
//     priceGHS: 0,
//     costPrice: 0,
//   });

//   const handleSubmit = async () => {
//     if (!form.name || !form.category || form.priceGHS <= 0) return;

//     await createPrice({
//       ...form,
//       isActive: true,
//     });

//     closeModal("DOWN");
//   };

//   const units = ServiceUnitEnum.options;

//   return (
//     <div className="flex flex-col h-full p-6 gap-5 bg-zinc-950 text-white rounded-t-[2.5rem] border-t border-white/10 shadow-2xl">
//       {/* HEADER */}
//       <header className="flex justify-between items-center px-2">
//         <div className="flex flex-col">
//           <h2 className="text-xl font-black uppercase italic tracking-tighter">
//             New Service
//           </h2>
//           <span className="text-[8px] text-cyan-400 font-bold uppercase tracking-widest">
//             Pricing Strategy
//           </span>
//         </div>
//         <button
//           onClick={() => closeModal("DOWN")}
//           className="text-xs opacity-20 hover:opacity-100"
//         >
//           CANCEL
//         </button>
//       </header>

//       <div className="flex flex-col gap-3 overflow-y-auto">
//         {/* DESCRIPTION & CATEGORY */}
//         <div className="grid grid-cols-2 gap-2">
//           <div className="flex flex-col gap-1.5">
//             <label className="text-[8px] uppercase opacity-40 ml-2">
//               Service Name
//             </label>
//             <input
//               placeholder="e.g. A3 Gloss"
//               className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-cyan-400"
//               onChange={(e) => setForm({ ...form, name: e.target.value })}
//             />
//           </div>
//           <div className="flex flex-col gap-1.5">
//             <label className="text-[8px] uppercase opacity-40 ml-2">
//               Category
//             </label>
//             <input
//               placeholder="e.g. Stickers"
//               className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-cyan-400"
//               onChange={(e) => setForm({ ...form, category: e.target.value })}
//             />
//           </div>
//         </div>

//         {/* UNIT SELECTOR */}
//         <div className="flex flex-col gap-1.5">
//           <label className="text-[8px] uppercase opacity-40 ml-2">
//             Standard Unit
//           </label>
//           <select
//             className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none text-cyan-400 font-bold appearance-none"
//             value={form.unit}
//             onChange={(e) => setForm({ ...form, unit: e.target.value })}
//           >
//             {units.map((u) => (
//               <option key={u} value={u} className="bg-zinc-900">
//                 {u}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* FINANCIALS (The Profit Loop) */}
//         <div className="grid grid-cols-2 gap-2 p-4 bg-cyan-400/5 border border-cyan-400/10 rounded-3xl">
//           <div className="flex flex-col gap-1.5">
//             <label className="text-[8px] uppercase text-cyan-400 font-bold ml-2">
//               Selling Price (₵)
//             </label>
//             <input
//               type="number"
//               placeholder="0.00"
//               className="bg-transparent text-2xl font-mono font-black outline-none border-b border-cyan-400/30 pb-1"
//               onChange={(e) =>
//                 setForm({ ...form, priceGHS: Number(e.target.value) })
//               }
//             />
//           </div>
//           <div className="flex flex-col gap-1.5">
//             <label className="text-[8px] uppercase opacity-40 font-bold ml-2">
//               Base Cost (₵)
//             </label>
//             <input
//               type="number"
//               placeholder="0.00"
//               className="bg-transparent text-2xl font-mono font-black outline-none opacity-40 border-b border-white/10 pb-1 focus:opacity-100"
//               onChange={(e) =>
//                 setForm({ ...form, costPrice: Number(e.target.value) })
//               }
//             />
//           </div>
//         </div>
//       </div>

//       {/* FINAL ACTION */}
//       <button
//         onClick={handleSubmit}
//         disabled={!form.name || form.priceGHS <= 0}
//         className="mt-auto w-full py-5 bg-white text-black font-black uppercase text-xs rounded-full shadow-2xl active:scale-95 transition-all disabled:opacity-10"
//       >
//         Authorize & Add Rate
//       </button>
//     </div>
//   );
// }
