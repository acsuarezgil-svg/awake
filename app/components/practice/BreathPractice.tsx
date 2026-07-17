"use client";

import { useEffect, useState } from "react";

type BreathPhase = "inhale" | "exhale";

type BreathPracticeProps = {
  onBack: () => void;
  onFinish: () => void;
  primaryColor: string;
  secondaryColor: string;
  pageBackground: string;
};

const INHALE_LENGTH = 4000;
const EXHALE_LENGTH = 6000;

export default function BreathPractice({
  onBack,
  onFinish,
  primaryColor,
  secondaryColor,
  pageBackground,
}: BreathPracticeProps) {
  const [phase, setPhase] = useState<BreathPhase>("inhale");
  const [isVisible, setIsVisible] = useState(false);

  const primaryRgb = cleanRgb(primaryColor);
  const secondaryRgb = cleanRgb(secondaryColor);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
        setIsVisible(true);
    });

    let timeoutId: number | undefined;

    const startCycle = () => {
        setPhase("inhale");

        timeoutId = window.setTimeout(() => {
        setPhase("exhale");

        timeoutId = window.setTimeout(() => {
            startCycle();
        }, EXHALE_LENGTH);
        }, INHALE_LENGTH);
    };

    startCycle();

    return () => {
        window.cancelAnimationFrame(frame);

        if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
        }
    };
    }, []);

  return (
    <div
      className={`fixed inset-0 z-[210] flex min-h-screen flex-col items-center justify-center overflow-hidden transition-opacity duration-700 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        background: `
          radial-gradient(
            circle at 50% 38%,
            rgba(${secondaryRgb}, 0.34),
            transparent 46%
          ),
          linear-gradient(
            180deg,
            rgba(${primaryRgb}, 0.12),
            rgba(${secondaryRgb}, 0.28),
            rgba(${primaryRgb}, 0.42)
          ),
          ${pageBackground}
        `,
      }}
    >
      <button
        type="button"
        onClick={onBack}
        className="absolute left-5 top-7 rounded-full border border-white/35 bg-white/10 px-4 py-2 text-xs text-white/75 backdrop-blur-sm"
      >
        ← Practice
      </button>
      <div className="absolute top-8 text-center">
        <p className="text-[10px] uppercase tracking-[0.35em] text-white/50">
            Practice
        </p>

        <h1 className="mt-2 text-lg font-light text-white/85">
            Long Breath
        </h1>
        </div>

      <div className="relative flex flex-col items-center">
        <div className="relative flex h-[310px] w-[310px] items-center justify-center">
          <span
            className={`awake-breath-ring absolute h-40 w-40 rounded-full ${
              phase === "inhale"
                ? "awake-breath-ring-inhale"
                : "awake-breath-ring-exhale"
            }`}
            style={{
              border: "2px solid rgba(255,255,255,0.8)",
              boxShadow: `
                0 0 14px rgba(255,255,255,0.7),
                0 0 42px rgba(${secondaryRgb},0.5),
                0 0 90px rgba(${primaryRgb},0.32)
              `,
            }}
          />

          <span
            className={`awake-breath-core flex h-32 w-32 items-center justify-center rounded-full ${
              phase === "inhale"
                ? "awake-breath-core-inhale"
                : "awake-breath-core-exhale"
            }`}
            style={{
              background: `
                radial-gradient(
                  circle at 38% 32%,
                  rgba(255,255,255,0.8),
                  rgba(${secondaryRgb},0.35) 38%,
                  rgba(${primaryRgb},0.16) 100%
                )
              `,
              boxShadow: `
                0 0 18px rgba(255,255,255,0.7),
                0 0 55px rgba(${secondaryRgb},0.45)
              `,
            }}
          >
            <span className="h-20 w-20 rounded-full bg-white/10" />
          </span>
        </div>

        <p className="mt-8 text-lg font-light tracking-[0.18em] text-white/85">
          {phase === "inhale" ? "Breathe in" : "Breathe out"}
        </p>

        <p className="mt-4 text-xs font-light tracking-[0.08em] text-white/55">
          Follow the light
        </p>
      </div>

      <button
        type="button"
        onClick={onFinish}
        className="absolute bottom-10 rounded-full border border-white/40 bg-white/15 px-7 py-3 text-sm text-white/80 backdrop-blur-sm transition hover:bg-white/25"
      >
        Finish
      </button>

      <style jsx>{`
        .awake-breath-core,
        .awake-breath-ring {
          transition:
            transform ${phase === "inhale" ? INHALE_LENGTH : EXHALE_LENGTH}ms ease-in-out,
            opacity ${phase === "inhale" ? INHALE_LENGTH : EXHALE_LENGTH}ms ease-in-out,
            filter ${phase === "inhale" ? INHALE_LENGTH : EXHALE_LENGTH}ms ease-in-out;
        }

        .awake-breath-core-inhale {
          transform: scale(1.35);
          filter: brightness(1.18);
        }

        .awake-breath-core-exhale {
          transform: scale(0.88);
          filter: brightness(0.9);
        }

        .awake-breath-ring-inhale {
          transform: scale(1.75);
          opacity: 0.82;
        }

        .awake-breath-ring-exhale {
          transform: scale(0.8);
          opacity: 0.36;
        }

        @media (prefers-reduced-motion: reduce) {
          .awake-breath-core,
          .awake-breath-ring {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}

function cleanRgb(color: string) {
  return color
    .replace("rgb(", "")
    .replace("rgba(", "")
    .replace(")", "");
}