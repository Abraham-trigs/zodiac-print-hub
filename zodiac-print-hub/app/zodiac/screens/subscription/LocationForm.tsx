"use client";

interface LocationFormProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function LocationForm({ data, onUpdate }: LocationFormProps) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-cyan-400">Business Location</h2>
        <p className="text-xs opacity-60">
          Specify your workshop or office address for delivery and setup.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Ghana Digital Address Input */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold opacity-50 tracking-widest">
            Ghana Digital Address
          </label>
          <div className="relative">
            <input
              value={data.digitalAddress || ""}
              onChange={(e) =>
                onUpdate({ digitalAddress: e.target.value.toUpperCase() })
              }
              className="glass-card bg-white/5 w-full h-12 px-4 focus:border-cyan-400 outline-none uppercase tracking-widest transition-all"
              placeholder="e.g., GA-123-4567"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-cyan-400 opacity-50">
              GPS
            </span>
          </div>
        </div>

        {/* Location URL / Pinning */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-bold opacity-50 tracking-widest">
            Precise Location
          </label>
          <div
            onClick={() => onUpdate({ locationUrl: "https://google.com" })}
            className={`glass-card p-5 flex items-center justify-between transition-all cursor-pointer ${
              data.locationUrl
                ? "border-cyan-400 bg-cyan-400/10"
                : "bg-white/5 hover:bg-white/10"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-950 flex items-center justify-center text-lg">
                📍
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold">
                  {data.locationUrl
                    ? "Location Verified"
                    : "Verify My Location"}
                </span>
                <span className="text-[10px] opacity-50">
                  {data.locationUrl
                    ? "Coordinates locked"
                    : "Tap to pin current GPS position"}
                </span>
              </div>
            </div>
            {data.locationUrl && <span className="text-cyan-400">●</span>}
          </div>
        </div>

        <p className="text-[9px] opacity-40 text-center px-4 italic">
          Validating your location helps in calculating material delivery
          logistics accurately.
        </p>
      </div>
    </div>
  );
}
