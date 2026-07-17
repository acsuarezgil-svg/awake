"use client";

import { useState } from "react";
import BreathPractice from "./BreathPractice";
import RhythmPractice from "./RhythmPractice";

type PracticeMode = "menu" | "breath" | "rhythm";

type PracticeSpaceProps = {
  onFinish: () => void;
  primaryColor: string;
  secondaryColor: string;
  pageBackground: string;
  isDark: boolean;
};

export default function PracticeSpace({
  onFinish,
  primaryColor,
  secondaryColor,
  pageBackground,
  isDark,
}: PracticeSpaceProps) {
  const [mode, setMode] = useState<PracticeMode>("menu");

  if (mode === "breath") {
    return (
      <BreathPractice
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        pageBackground={pageBackground}
        onBack={() => setMode("menu")}
        onFinish={onFinish}
      />
    );
  }

  if (mode === "rhythm") {
    return (
      <RhythmPractice
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        pageBackground={pageBackground}
        onFinish={() => setMode("menu")}
      />
    );
  }

  const primaryRgb = cleanRgb(primaryColor);
  const secondaryRgb = cleanRgb(secondaryColor);

  return (
    <div
      className="fixed inset-0 z-[200] min-h-screen overflow-y-auto"
      style={{
        background: `
          radial-gradient(
            circle at 50% 26%,
            rgba(${secondaryRgb}, 0.3) 0%,
            transparent 44%
          ),
          linear-gradient(
            180deg,
            rgba(${primaryRgb}, 0.12) 0%,
            rgba(${secondaryRgb}, 0.23) 52%,
            rgba(${primaryRgb}, 0.38) 100%
          ),
          ${pageBackground}
        `,
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="awake-practice-water-line awake-practice-line-one" />
        <div className="awake-practice-water-line awake-practice-line-two" />
        <div className="awake-practice-water-line awake-practice-line-three" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-lg flex-col px-5 pb-10 pt-16">
        <div className="text-center">
          <div
            className="awake-practice-orb mx-auto h-20 w-20 rounded-full"
            style={{
              background: `
                radial-gradient(
                  circle at 38% 30%,
                  rgba(255,255,255,0.8),
                  rgba(${secondaryRgb},0.38) 38%,
                  rgba(${primaryRgb},0.16) 100%
                )
              `,
              boxShadow: `
                0 0 18px rgba(255,255,255,0.6),
                0 0 48px rgba(${secondaryRgb},0.4),
                0 0 90px rgba(${primaryRgb},0.28)
              `,
            }}
          />

          <p
            className={`mt-8 text-[11px] uppercase tracking-[0.4em] ${
              isDark ? "text-white/65" : "text-stone-600/70"
            }`}
          >
            Practice
          </p>

          <h1
            className={`mt-4 text-2xl font-light ${
              isDark ? "text-white" : "text-stone-800"
            }`}
          >
            A quiet space to return
          </h1>

          <p
            className={`mx-auto mt-3 max-w-xs text-sm font-light leading-6 ${
              isDark ? "text-white/60" : "text-stone-600/70"
            }`}
          >
            Choose what would support you in this moment.
          </p>
        </div>

        <div className="mt-10 space-y-3">
          <PracticeCard
            symbol="◯"
            title="Breath"
            description="Follow a slow, gentle breath."
            isDark={isDark}
            accent={`rgba(${secondaryRgb}, 0.7)`}
            onClick={() => setMode("breath")}
          />

          <PracticeCard
            symbol="⌁"
            title="Rhythm"
            description="Find steadiness in the ripple."
            isDark={isDark}
            accent={`rgba(${primaryRgb}, 0.7)`}
            onClick={() => setMode("rhythm")}
          />

          <PracticeCard
            symbol="≈"
            title="Stillness"
            description="Stay with the moment."
            isDark={isDark}
            accent={`rgba(${secondaryRgb}, 0.38)`}
            comingSoon
          />

          <PracticeCard
            symbol="◌"
            title="Observe"
            description="Watch without needing to react."
            isDark={isDark}
            accent={`rgba(${primaryRgb}, 0.38)`}
            comingSoon
          />
        </div>

        <button
          type="button"
          onClick={onFinish}
          className={`mx-auto mt-auto rounded-full border px-7 py-3 text-sm backdrop-blur-sm transition ${
            isDark
              ? "border-white/25 bg-white/10 text-white/80 hover:bg-white/15"
              : "border-white/65 bg-white/25 text-stone-700 hover:bg-white/40"
          }`}
        >
          Return to wheel
        </button>
      </div>

      <style jsx>{`
        @keyframes awake-practice-orb {
          0%,
          100% {
            transform: scale(0.96);
            opacity: 0.78;
          }

          50% {
            transform: scale(1.06);
            opacity: 1;
          }
        }

        @keyframes awake-practice-water-drift {
          0%,
          100% {
            transform: translateX(-5%);
          }

          50% {
            transform: translateX(5%);
          }
        }

        .awake-practice-orb {
          animation: awake-practice-orb 5.6s ease-in-out infinite;
        }

        .awake-practice-water-line {
          position: absolute;
          left: -15%;
          width: 130%;
          height: 1px;
          background: rgba(255, 255, 255, 0.28);
          animation: awake-practice-water-drift 9s ease-in-out infinite;
        }

        .awake-practice-line-one {
          top: 26%;
        }

        .awake-practice-line-two {
          top: 51%;
          animation-delay: -3s;
        }

        .awake-practice-line-three {
          top: 76%;
          animation-delay: -6s;
        }

        @media (prefers-reduced-motion: reduce) {
          .awake-practice-orb,
          .awake-practice-water-line {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

type PracticeCardProps = {
  symbol: string;
  title: string;
  description: string;
  accent: string;
  isDark: boolean;
  onClick?: () => void;
  comingSoon?: boolean;
};

function PracticeCard({
  symbol,
  title,
  description,
  accent,
  isDark,
  onClick,
  comingSoon = false,
}: PracticeCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={comingSoon}
      className={`flex w-full items-center gap-4 rounded-3xl border px-5 py-5 text-left backdrop-blur-md transition ${
        isDark
          ? "border-white/10 bg-slate-950/25 text-white hover:bg-white/10"
          : "border-white/60 bg-white/35 text-stone-800 hover:bg-white/50"
      } ${comingSoon ? "cursor-default opacity-55" : "active:scale-[0.99]"}`}
    >
      <span
        aria-hidden="true"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-xl"
        style={{
          borderColor: accent,
          background: accent,
        }}
      >
        {symbol}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-base font-medium">
          {title}
        </span>

        <span
          className={`mt-1 block text-sm font-light ${
            isDark ? "text-white/55" : "text-stone-600/70"
          }`}
        >
          {description}
        </span>
      </span>

      {comingSoon ? (
        <span
          className={`text-[9px] uppercase tracking-[0.16em] ${
            isDark ? "text-white/40" : "text-stone-500/60"
          }`}
        >
          Soon
        </span>
      ) : (
        <span
          aria-hidden="true"
          className={isDark ? "text-white/45" : "text-stone-500/60"}
        >
          →
        </span>
      )}
    </button>
  );
}

function cleanRgb(color: string) {
  return color
    .replace("rgb(", "")
    .replace("rgba(", "")
    .replace(")", "");
}