"use client";

import Link from "next/link";

export type SliceType = "pattern" | "investment";

export type LivingWheelCardState =
  | {
      mode: "preview";
      name: string;
      type: SliceType;
    }
  | {
      mode: "noticed";
      name: string;
      type: SliceType;
    }
  | {
      mode: "manage";
      name: string;
      type: SliceType;
    }
  | {
      mode: "feedback";
      name: string;
      type: SliceType;
      message: string;
    };

type LivingWheelCardProps = {
  state: LivingWheelCardState | null;
  isDark: boolean;
  isExpanded: boolean;
  onExpand: () => void;
  onClose: () => void;
  onNoticeAgain: () => void;
  onUndoLastNotice: () => void;
};

export default function LivingWheelCard({
  state,
  isDark,
  isExpanded,
  onExpand,
  onClose,
  onNoticeAgain,
  onUndoLastNotice,
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
          <section
            className={`awake-living-card overflow-hidden rounded-3xl border text-left transition-[background,border-color,max-height] duration-300 ${
              isDark
                ? "border-white/10 bg-slate-800/90 shadow-[0_14px_35px_rgba(0,0,0,0.18)]"
                : "border-stone-200 bg-white/95 shadow-sm"
            }`}
          >
            <button
              type="button"
              onClick={isExpanded ? undefined : onExpand}
              aria-expanded={isExpanded}
              className={`flex w-full items-center gap-4 px-5 py-4 text-left ${
                isExpanded ? "cursor-default" : "cursor-pointer"
              }`}
            >
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-lg font-light ${
                    isDark ? "text-stone-100" : "text-stone-800"
                  }`}
                >
                  {state.name}
                </p>

                <p
                  className={`mt-1 text-sm ${
                    state.mode === "noticed" || state.mode === "feedback"
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
                    : state.mode === "preview"
                        ? "Tap the same slice again to notice"
                        : state.mode === "feedback"
                        ? state.message
                        : "Slice actions"}
                </p>
              </div>

              {!isExpanded && (
                <span
                  aria-hidden="true"
                  className={
                    isDark ? "text-slate-400" : "text-stone-400"
                  }
                >
                  ↓
                </span>
              )}
            </button>

            <div
              className={`grid transition-[grid-template-rows,opacity] duration-300 ${
                isExpanded
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div
                  className={`border-t px-5 pb-5 pt-4 ${
                    isDark ? "border-white/10" : "border-stone-100"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <p
                      className={`text-[10px] uppercase tracking-[0.2em] ${
                        isDark ? "text-slate-400" : "text-stone-400"
                      }`}
                    >
                      This slice
                    </p>

                    <button
                      type="button"
                      onClick={onClose}
                      className={`rounded-full px-3 py-1 text-xs transition ${
                        isDark
                          ? "text-slate-400 hover:bg-white/5 hover:text-white"
                          : "text-stone-400 hover:bg-stone-50 hover:text-stone-700"
                      }`}
                    >
                      Close
                    </button>
                  </div>

                  <div className="mt-3 space-y-1">
                    <LivingCardAction
                      label="Notice Again"
                      symbol="+"
                      isDark={isDark}
                      onClick={onNoticeAgain}
                    />

                    <LivingCardAction
                      label="Undo Last Notice"
                      symbol="↶"
                      isDark={isDark}
                      onClick={onUndoLastNotice}
                    />

                    <PlaceholderAction
                      label="Rename"
                      symbol="✎"
                      isDark={isDark}
                    />

                    <PlaceholderAction
                      label="Remove From Wheel"
                      symbol="−"
                      isDark={isDark}
                      destructive
                    />
                  </div>

                  <div
                    className={`my-4 border-t ${
                      isDark ? "border-white/10" : "border-stone-100"
                    }`}
                  />

                  <p
                    className={`text-[10px] uppercase tracking-[0.2em] ${
                      isDark ? "text-slate-400" : "text-stone-400"
                    }`}
                  >
                    Continue
                  </p>

                  <div className="mt-3 space-y-1">
                    <LivingCardLink
                      href="/reflection"
                      label="Reflection"
                      isDark={isDark}
                    />

                    <LivingCardLink
                      href="/reflections"
                      label="Journey"
                      isDark={isDark}
                    />

                    <LivingCardLink
                      href="/insights"
                      label="Insights"
                      isDark={isDark}
                    />

                    <LivingCardLink
                      href="/about"
                      label="About Awake"
                      isDark={isDark}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

type LivingCardActionProps = {
  label: string;
  symbol: string;
  isDark: boolean;
  onClick: () => void;
};

function LivingCardAction({
  label,
  symbol,
  isDark,
  onClick,
}: LivingCardActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition ${
        isDark
          ? "text-slate-300 hover:bg-white/5 hover:text-stone-100"
          : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"
      }`}
    >
      <span
        aria-hidden="true"
        className="w-5 text-center"
      >
        {symbol}
      </span>

      <span className="min-w-0 flex-1">
        {label}
      </span>
    </button>
  );
}

type PlaceholderActionProps = {
  label: string;
  symbol: string;
  isDark: boolean;
  destructive?: boolean;
};

function PlaceholderAction({
  label,
  symbol,
  isDark,
  destructive = false,
}: PlaceholderActionProps) {
  return (
    <button
      type="button"
      disabled
      aria-disabled="true"
      title="Coming in the next run"
      className={`flex w-full cursor-not-allowed items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm opacity-60 ${
        destructive
          ? isDark
            ? "text-rose-300"
            : "text-rose-500"
          : isDark
            ? "text-slate-300"
            : "text-stone-500"
      }`}
    >
      <span
        aria-hidden="true"
        className="w-5 text-center"
      >
        {symbol}
      </span>

      <span className="min-w-0 flex-1">
        {label}
      </span>

      <span
        className={`text-[10px] uppercase tracking-wide ${
          isDark ? "text-slate-500" : "text-stone-300"
        }`}
      >
        soon
      </span>
    </button>
  );
}

type LivingCardLinkProps = {
  href: string;
  label: string;
  isDark: boolean;
};

function LivingCardLink({
  href,
  label,
  isDark,
}: LivingCardLinkProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition ${
        isDark
          ? "text-slate-300 hover:bg-white/5 hover:text-stone-100"
          : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"
      }`}
    >
      <span className="min-w-0 flex-1">
        {label}
      </span>

      <span
        aria-hidden="true"
        className={isDark ? "text-slate-500" : "text-stone-300"}
      >
        →
      </span>
    </Link>
  );
}