// app/zodiac/modals/WelcomeAdModal.tsx
"use client";

export function WelcomeAdModal() {
  return (
    <div className="h-full w-full p-4 bg-gradient-to-br from-blue-900 to-black flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <span className="text-[10px] text-cyan-300 uppercase tracking-widest font-bold font-mono">
          Fast Printing
        </span>
        <div className="bg-orange-500 text-[10px] px-2 py-0.5 rounded font-bold">
          SAVE TIME
        </div>
      </div>

      <div>
        <h4 className="text-sm font-bold">Avoid Long Queues</h4>
        <p className="text-[9px] opacity-70">
          Get started for free on all platforms
        </p>
      </div>

      <div className="flex gap-1.5 justify-center pb-2">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              i === 0 ? "bg-orange-500" : "bg-white/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// Attach the ID for the Registry
WelcomeAdModal.modalId = "WELCOME_AD";
