"use client";

export type LivingWheelCardState =
  | {
      mode: "preview";
      name: string;
    }
  | {
      mode: "noticed";
      name: string;
    };

type LivingWheelCardProps = {
  state: LivingWheelCardState | null;
  isDark: boolean;
};

export default function LivingWheelCard({
  state,
  isDark,
}: LivingWheelCardProps) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className={`mx-auto grid w-full max-w-sm transition-[grid-template-rows,opacity,margin] duration-300 ${
        state
          ? "mb-5 grid-rows-[1fr] opacity-100"
          : "mb-0 grid-rows-[0fr] opacity-0"
      }`}
    >
      <div className="overflow-hidden">
        {state && (
          <div
            className={`awake-living-card rounded-3xl border px-5 py-4 text-center transition-colors duration-500 ${
              isDark
                ? "border-white/10 bg-slate-800/85 shadow-[0_14px_35px_rgba(0,0,0,0.18)]"
                : "border-stone-200 bg-white/90 shadow-sm"
            }`}
          >
            <p
              className={`text-lg font-light ${
                isDark ? "text-stone-100" : "text-stone-800"
              }`}
            >
              {state.name}
            </p>

            <p
              className={`mt-1 text-sm ${
                state.mode === "noticed"
                  ? isDark
                    ? "text-teal-300"
                    : "text-emerald-600"
                  : isDark
                    ? "text-slate-300"
                    : "text-stone-500"
              }`}
            >
              {state.mode === "noticed"
                ? "✓ Noticed"
                : "Tap the same slice again to notice"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}