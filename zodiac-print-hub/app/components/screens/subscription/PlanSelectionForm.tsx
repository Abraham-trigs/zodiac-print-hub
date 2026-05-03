"use client";

const PLANS = [
  {
    id: "FREE",
    name: "Free",
    price: "₵0",
    desc: "Basic features for starters",
  },
  {
    id: "DOMINATE",
    name: "Dominate",
    price: "₵150",
    desc: "For high-volume printing",
    highlight: true,
  },
  {
    id: "GROW",
    name: "Grow with us",
    price: "₵80",
    desc: "Scalable tools for teams",
  },
];

export function PlanSelectionForm({
  data,
  onUpdate,
}: {
  data: any;
  onUpdate: (d: any) => void;
}) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-cyan-400">Choose Your Plan</h2>
        <p className="text-xs opacity-60">
          Select a tier to activate your business profile.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            onClick={() => onUpdate({ planId: plan.id })}
            className={`glass-card p-4 flex justify-between items-center cursor-pointer transition-all border ${
              data.planId === plan.id
                ? "border-cyan-400 bg-cyan-400/10"
                : "border-white/5 bg-white/5 hover:bg-white/10"
            }`}
          >
            <div>
              <span
                className={`text-sm font-bold ${plan.highlight ? "text-orange-400" : ""}`}
              >
                {plan.name}
              </span>
              <p className="text-[10px] opacity-50">{plan.desc}</p>
            </div>
            <span className="text-lg font-bold">{plan.price}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
