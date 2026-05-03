// "use client";

// import { useState } from "react";

// const PERFORMANCE_DATA = {
//   DAILY: { revenue: "₵4,500", profit: "₵1,200", jobs: 24, waste: "₵150" },
//   WEEKLY: { revenue: "₵28,000", profit: "₵8,400", jobs: 168, waste: "₵900" },
//   YEARLY: { revenue: "₵1.2M", profit: "₵420K", jobs: "8.4K", waste: "₵12K" },
// };

// export function CompanyAnalysisDashboard() {
//   const [range, setRange] = useState<"DAILY" | "WEEKLY" | "YEARLY">("DAILY");
//   const data = PERFORMANCE_DATA[range];

//   return (
//     <div className="glass-card p-6 w-full max-h-[85vh] overflow-hidden flex flex-col gap-6">
//       <div className="flex justify-between items-center">
//         <h2 className="text-xl font-bold tracking-tighter">
//           Business Intelligence
//         </h2>
//         <select
//           value={range}
//           onChange={(e) => setRange(e.target.value as any)}
//           className="bg-white/5 border border-white/10 text-xs font-bold p-2 rounded-lg outline-none"
//         >
//           <option value="DAILY">Daily</option>
//           <option value="WEEKLY">Weekly</option>
//           <option value="YEARLY">Yearly</option>
//         </select>
//       </div>

//       {/* CORE KPI BOXES (Feature 17.1) */}
//       <div className="grid grid-cols-2 gap-3">
//         <div className="bg-white/5 p-4 rounded-3xl border border-white/5 flex flex-col">
//           <span className="text-[9px] opacity-40 uppercase tracking-widest">
//             Total Revenue
//           </span>
//           <span className="text-xl font-mono font-bold text-cyan-400">
//             {data.revenue}
//           </span>
//         </div>
//         <div className="bg-white/5 p-4 rounded-3xl border border-white/5 flex flex-col">
//           <span className="text-[9px] opacity-40 uppercase tracking-widest">
//             Net Profit
//           </span>
//           <span className="text-xl font-mono font-bold text-orange-400">
//             {data.profit}
//           </span>
//         </div>
//       </div>

//       {/* ANALYTICS CHARTS (Feature 17.2) */}
//       <div className="flex-1 bg-white/5 rounded-3xl border border-white/5 p-4 relative flex flex-col gap-4">
//         <div className="flex justify-between items-center">
//           <span className="text-[10px] font-bold uppercase opacity-40">
//             Growth Trend
//           </span>
//           <span className="text-[9px] text-cyan-400">+12.4% vs prev.</span>
//         </div>
//         <div className="flex-1 flex items-end gap-1 px-2">
//           {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
//             <div
//               key={i}
//               className="flex-1 bg-cyan-400/20 rounded-t-lg relative group"
//             >
//               <div
//                 className="absolute bottom-0 w-full bg-cyan-400 rounded-t-lg transition-all duration-700"
//                 style={{ height: `${h}%` }}
//               />
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* OPERATIONAL INSIGHTS (Feature 4.4 & 17) */}
//       <div className="grid grid-cols-2 gap-3 text-center border-t border-white/5 pt-4">
//         <div>
//           <span className="text-[9px] opacity-40 uppercase">Jobs Done</span>
//           <p className="text-sm font-bold">{data.jobs}</p>
//         </div>
//         <div>
//           <span className="text-[9px] opacity-40 uppercase text-orange-400">
//             Total Waste
//           </span>
//           <p className="text-sm font-bold text-orange-400">{data.waste}</p>
//         </div>
//       </div>
//     </div>
//   );
// }
