"use client";

interface HubActionButtonProps {
  label: string;
  caption: string;
  icon?: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

export function HubActionButton({
  label,
  caption,
  icon,
  onClick,
  variant = "primary",
}: HubActionButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <button
      onClick={onClick}
      className={`
        group relative overflow-hidden rounded-[2.5rem] p-8 transition-all active:scale-95 w-full
        ${
          isPrimary
            ? "bg-white/5 border border-white/10 hover:border-cyan-400"
            : "bg-white/[0.02] border border-white/5 hover:bg-white/5"
        }
      `}
    >
      <div className="relative z-10 flex flex-col items-center gap-2">
        {icon && <span className="text-4xl mb-1">{icon}</span>}

        <span
          className={`
          text-xl font-black uppercase tracking-tighter transition-colors
          ${isPrimary ? "group-hover:text-cyan-400 text-white" : "text-white/60"}
        `}
        >
          {label}
        </span>

        <span className="text-[7px] opacity-30 uppercase font-black tracking-widest text-center">
          {caption}
        </span>
      </div>

      {/* Hover Gradient Glow for Primary */}
      {isPrimary && (
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/0 to-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  );
}
