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

const introWords = [
  "Awake",
  "Observe",
  "Pause",
  "Notice",
  "Breathe",
  "Return",
];

export default function BreathPractice({
  onBack,
  onFinish,
  primaryColor,
  secondaryColor,
  pageBackground,
}: BreathPracticeProps) {
  const [phase, setPhase] = useState<BreathPhase>("inhale");
  const [isVisible, setIsVisible] = useState(false);
  const [displayWord, setDisplayWord] = useState("Awake");
  const [showWord, setShowWord] = useState(true);
  const [closing, setClosing] = useState(false);

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
            const secondWord = introWords[
                Math.floor(Math.random() * (introWords.length - 1)) + 1
                ];

                const firstTimeout = window.setTimeout(() => {
                setDisplayWord(secondWord);
                }, 3500);

                const hideTimeout = window.setTimeout(() => {
                setShowWord(false);
                }, 7000);
                window.clearTimeout(firstTimeout);
                window.clearTimeout(hideTimeout);
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
      <div className="absolute top-12 text-center">
        <p className="text-[10px] uppercase tracking-[0.35em] text-white/45">
            Long Breath
        </p>

        <h1
            className={`mt-6 text-3xl font-extralight tracking-wide transition-all duration-1000 ${
            showWord
                ? "opacity-100 blur-0"
                : "opacity-0 blur-sm"
            }`}
        >
            {displayWord}
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
            className={`awake-breath-core relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-full ${
                phase === "inhale"
                ? "awake-breath-core-inhale"
                : "awake-breath-core-exhale"
            }`}
            style={{
                background: `
                radial-gradient(
                    circle at 38% 32%,
                    rgba(255,255,255,0.72),
                    rgba(${secondaryRgb},0.32) 42%,
                    rgba(${primaryRgb},0.14) 100%
                )
                `,
                boxShadow: `
                inset 0 0 24px rgba(255,255,255,0.18),
                0 0 18px rgba(255,255,255,0.55),
                0 0 55px rgba(${secondaryRgb},0.36)
                `,
            }}
            >
            {[0, 1, 2].map((ring) => (
                <span
                key={ring}
                aria-hidden="true"
                className="awake-inner-ripple absolute rounded-full border border-white/45"
                style={{
                    animationDelay: `${ring * 1100}ms`,
                }}
                />
            ))}

            <span
                className={`relative z-10 text-2xl font-extralight tracking-[0.08em] text-white/90 transition-all duration-1000 ${
                showWord
                    ? phase === "inhale"
                    ? "scale-105 opacity-100 blur-0"
                    : "scale-100 opacity-75 blur-[0.7px]"
                    : "scale-95 opacity-0 blur-sm"
                }`}
            >
                {displayWord}
            </span>
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
        onClick={() => {
            setDisplayWord("Choose");
            setShowWord(true);
            setClosing(true);

            setTimeout(() => {
                onFinish();
            }, 1800);
            }}
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
          @keyframes awake-inner-ripple {
            0% {
                width: 18px;
                height: 18px;
                opacity: 0;
                transform: scale(0.4);
            }

            20% {
                opacity: 0.55;
            }

            100% {
                width: 150px;
                height: 150px;
                opacity: 0;
                transform: scale(1);
            }
            }

            .awake-inner-ripple {
            width: 18px;
            height: 18px;
            animation: awake-inner-ripple 4.8s ease-out infinite;
            }

            @media (prefers-reduced-motion: reduce) {
            .awake-inner-ripple {
                animation: none;
                width: 105px;
                height: 105px;
                opacity: 0.22;
            }
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