"use client";

interface IdentityFormProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function IdentityForm({ data, onUpdate }: IdentityFormProps) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header Description */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-cyan-400">Company Identity</h2>
        <p className="text-xs opacity-60">
          Define your brand name and upload your logo.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Company Name Input */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold opacity-50 tracking-widest">
            Company Name
          </label>
          <input
            value={data.name || ""}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="glass-card bg-white/5 w-full h-12 px-4 focus:border-cyan-400 outline-none transition-all"
            placeholder="e.g., Zodiac Prints GH"
          />
        </div>

        {/* Logo Upload Placeholder */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-bold opacity-50 tracking-widest">
            Brand Logo
          </label>
          <div className="glass-card bg-white/5 border-dashed border-white/20 h-40 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/10 transition-all group">
            <div className="w-12 h-12 rounded-full bg-blue-950 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              🖼️
            </div>
            <span className="text-[10px] opacity-50 uppercase font-bold text-center px-4">
              Tap to upload PNG or SVG
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
