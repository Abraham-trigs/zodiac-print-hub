// // app/zodiac/screens/JobSelection.tsx
// import { ZodiacScreen } from "../types/screen.types";

// export const JobSelectionScreen: ZodiacScreen = {
//   id: "JOB_SELECTION",
//   layoutMode: "SPLIT",
//   TopComponent: () => (
//     <div className="flex flex-col gap-4">
//       <h3 className="text-center text-sm font-semibold">
//         Select Job, Paper or Material
//       </h3>
//       <div className="glass-card h-10 w-full flex items-center px-4 opacity-50 text-xs italic">
//         Search jobs...
//       </div>
//       <ul className="space-y-4 text-sm font-medium">
//         <li>Card Printing</li>
//         <li>Photocopy</li>
//         <li>Lamination</li>
//         <li className="bg-white/20 py-2 px-4 rounded-xl border border-white/10 shadow-lg">
//           Plain paper
//         </li>
//         <li>SAV</li>
//       </ul>
//     </div>
//   ),
//   DownComponent: () => (
//     <div className="flex flex-col items-center justify-center h-full opacity-60">
//       <p className="text-[10px] uppercase tracking-widest">Inventory Status</p>
//       <p className="text-cyan-400 text-xs">Ready for Processing</p>
//     </div>
//   ),
//   primaryAction: {
//     label: "Proceed",
//     nextViewMode: "DETAIL", // When clicked, the Top Zone will slide to 100%
//     onPress: () => console.log("Job logic initialized"),
//   },
// };
