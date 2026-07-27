"use client";

import { useEffect, useState } from "react";

type BreathPhase = "inhale" | "exhale";

type BreathPracticeProps = {
  onBack: () => void;
  onFinish: () => void;
  primaryColor: string;
  secondaryColor: string;
  pageBackground: string;
  isDark: boolean;
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
  isDark,
}: BreathPracticeProps) {
  const [phase, setPhase] = useState<BreathPhase>("inhale");
  const [isVisible, setIsVisible] = useState(false);
  const [environmentReady, setEnvironmentReady] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);
  const [displayWord, setDisplayWord] = useState("Awake");
  const [showWord, setShowWord] = useState(true);

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
          const secondWord =
            introWords[
              Math.floor(Math.random() * (introWords.length - 1)) + 1
            ];
          window.setTimeout(() => {
            setDisplayWord(secondWord);
          }, 3500);
          window.setTimeout(() => {
            setShowWord(false);
          }, 7000);
        }, EXHALE_LENGTH);
      }, INHALE_LENGTH);
    };

    const emergeTimeout = window.setTimeout(() => {
      setEnvironmentReady(true);
    }, 120);
    const animationTimeout = window.setTimeout(() => {
      setAnimationStarted(true);
      startCycle();
    }, 1050);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(emergeTimeout);
      window.clearTimeout(animationTimeout);

      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[210] flex min-h-screen flex-col items-center justify-center overflow-hidden transition-opacity duration-1000 ${
        environmentReady
          ? "opacity-100"
          : isVisible
            ? "opacity-[0.16]"
            : "opacity-0"
      }`}
      style={{
        background: `
          radial-gradient(
            circle at 50% 38%,
            color-mix(in srgb, ${secondaryColor} 34%, transparent),
            transparent 46%
          ),
          linear-gradient(
            180deg,
            color-mix(in srgb, ${primaryColor} 12%, transparent),
            color-mix(in srgb, ${secondaryColor} 28%, transparent),
            color-mix(in srgb, ${primaryColor} 42%, transparent)
          ),
          ${pageBackground}
        `,
      }}
      data-breathe-mode={isDark ? "dark" : "light"}
    >
      <button
        type="button"
        onClick={onBack}
        className="breathe-chrome absolute left-5 top-7 rounded-full border px-4 py-2 text-xs backdrop-blur-sm"
      >
        ← Practice
      </button>
      <div
        className={`absolute top-12 text-center transition-all duration-1000 ${
          environmentReady
            ? "translate-y-0 opacity-100"
            : "translate-y-2 opacity-0"
        }`}
      >
        <p className="breathe-secondary text-[10px] uppercase tracking-[0.35em]">
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
              animationStarted
                ? phase === "inhale"
                  ? "awake-breath-ring-inhale"
                  : "awake-breath-ring-exhale"
                : "awake-breath-ring-idle"
            }`}
            style={{
              border: "2px solid var(--awake-breathe-border)",
              boxShadow: `
                0 0 14px color-mix(in srgb, var(--awake-breathe-halo) 38%, transparent),
                0 0 52px color-mix(in srgb, var(--awake-breathe-halo) 22%, transparent)
              `,
            }}
          />

          <span
            className={`awake-breath-core relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-full ${
              animationStarted
                ? phase === "inhale"
                  ? "awake-breath-core-inhale"
                  : "awake-breath-core-exhale"
                : "awake-breath-core-idle"
            }`}
            style={{
                background: `
                radial-gradient(
                    circle at 38% 32%,
                    color-mix(in srgb, var(--awake-orb-highlight) 78%, white),
                    var(--awake-breathe-background) 45%,
                    color-mix(in srgb, var(--awake-breathe-background) 72%, var(--awake-accent)) 100%
                )
                `,
                boxShadow: `
                inset 0 0 24px color-mix(in srgb, var(--awake-orb-highlight) 32%, transparent),
                0 0 0 1px var(--awake-breathe-border),
                0 8px 28px color-mix(in srgb, var(--awake-breathe-halo) 22%, transparent)
                `,
            }}
            >
            {environmentReady && [0, 1, 2].map((ring) => (
                <span
                key={ring}
                aria-hidden="true"
                className="awake-inner-ripple absolute rounded-full border"
                style={{
                    animationDelay: `${ring * 1100}ms`,
                }}
                />
            ))}

            <span
                className={`breathe-center-text relative z-10 text-2xl font-light tracking-[0.08em] transition-all duration-1000 ${
                environmentReady && showWord
                    ? phase === "inhale"
                    ? "scale-105 opacity-100 blur-0"
                    : "scale-100 opacity-75 blur-[0.7px]"
                    : "scale-95 opacity-60 blur-[0.4px]"
                }`}
            >
                {displayWord}
            </span>
            </span>
        </div>

        <p
          className={`breathe-center-text mt-8 text-lg font-light tracking-[0.18em] transition-opacity duration-1000 ${
            environmentReady ? "opacity-100" : "opacity-0"
          }`}
        >
          {phase === "inhale" ? "Breathe in" : "Breathe out"}
        </p>

        <p
          className={`breathe-secondary mt-4 text-xs font-light tracking-[0.08em] transition-opacity duration-1000 ${
            environmentReady ? "opacity-100" : "opacity-0"
          }`}
        >
          Follow the light
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
            setDisplayWord("Choose");
            setShowWord(true);
            setTimeout(() => {
                onFinish();
            }, 1800);
            }}
        className="breathe-chrome absolute bottom-10 rounded-full border px-7 py-3 text-sm backdrop-blur-sm transition"
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

        .breathe-center-text {
          color: var(--awake-breathe-text);
          text-shadow: 0 1px 10px
            color-mix(in srgb, var(--awake-surface) 45%, transparent);
        }

        .breathe-secondary {
          color: color-mix(
            in srgb,
            var(--awake-breathe-text) 72%,
            transparent
          );
        }

        .breathe-chrome {
          color: var(--awake-breathe-text);
          border-color: color-mix(
            in srgb,
            var(--awake-breathe-border) 72%,
            transparent
          );
          background: color-mix(
            in srgb,
            var(--awake-breathe-background) 38%,
            transparent
          );
        }

        .awake-inner-ripple {
          border-color: color-mix(
            in srgb,
            var(--awake-breathe-ripple) 58%,
            transparent
          );
        }

        .awake-breath-core-idle {
          opacity: 0.34;
          transform: scale(0.9);
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

        .awake-breath-ring-idle {
          opacity: 0;
          transform: scale(0.72);
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
