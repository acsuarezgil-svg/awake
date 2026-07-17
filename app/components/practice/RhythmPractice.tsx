"use client";

import { useEffect, useRef, useState } from "react";

type RhythmPracticeProps = {
  onFinish: () => void;
  primaryColor: string;
  secondaryColor: string;
  pageBackground: string;
};

const BEAT_LENGTH = 2400;

export default function RhythmPractice({
  onFinish,
  primaryColor,
  secondaryColor,
  pageBackground,
}: RhythmPracticeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);
  const [tapKey, setTapKey] = useState(0);
  const [feedback, setFeedback] = useState(
    "Notice the ripple"
  );
  const primaryRgb = primaryColor
  .replace("rgb(", "")
  .replace(")", "");

  const secondaryRgb = secondaryColor
    .replace("rgb(", "")
    .replace(")", "");

  const lastPulseTimeRef = useRef(0);
  const feedbackTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsVisible(true);
    });

    function beginPulse() {
      lastPulseTimeRef.current = performance.now();
      setPulseKey((current) => current + 1);
    }

    beginPulse();

    const pulseInterval = window.setInterval(
      beginPulse,
      BEAT_LENGTH
    );

    return () => {
      cancelAnimationFrame(frame);
      window.clearInterval(pulseInterval);

      if (feedbackTimeoutRef.current !== null) {
        window.clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  function showFeedback(message: string) {
    setFeedback(message);

    if (feedbackTimeoutRef.current !== null) {
      window.clearTimeout(feedbackTimeoutRef.current);
    }

    feedbackTimeoutRef.current = window.setTimeout(() => {
      setFeedback("Notice the ripple");
      feedbackTimeoutRef.current = null;
    }, 1400);
  }

  function handleRhythmTap() {
    const now = performance.now();
    const elapsed =
      (now - lastPulseTimeRef.current) % BEAT_LENGTH;

    const distanceFromPulse = Math.min(
      elapsed,
      BEAT_LENGTH - elapsed
    );

    setTapKey((current) => current + 1);

    if ("vibrate" in navigator) {
      navigator.vibrate(8);
    }

    if (distanceFromPulse <= 220) {
      showFeedback("Together");
      return;
    }

    if (distanceFromPulse <= 520) {
      showFeedback("Close");
      return;
    }

    showFeedback("Notice the next ripple");
  }

  function finishPractice() {
    setIsLeaving(true);
    setIsVisible(false);

    window.setTimeout(() => {
      onFinish();
    }, 700);
  }

  return (
    <div
      className={`fixed inset-0 z-[200] flex min-h-screen flex-col items-center justify-center overflow-hidden transition-opacity duration-700 ${
        isVisible && !isLeaving
          ? "opacity-100"
          : "opacity-0"
      }`}
      style={{
        background: `
          radial-gradient(
            circle at 50% 34%,
            rgba(${secondaryRgb}, 0.34) 0%,
            transparent 46%
          ),
          linear-gradient(
            180deg,
            rgba(${primaryRgb}, 0.16) 0%,
            rgba(${secondaryRgb}, 0.32) 52%,
            rgba(${primaryRgb}, 0.48) 100%
          ),
          ${pageBackground}
        `,
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="awake-water-line awake-water-line-one" />
        <div className="awake-water-line awake-water-line-two" />
        <div className="awake-water-line awake-water-line-three" />
      </div>

      <div className="relative flex flex-col items-center">
        <button
          type="button"
          onClick={handleRhythmTap}
          aria-label="Tap with the water ripple"
          className="relative flex h-[320px] w-[320px] touch-manipulation items-center justify-center rounded-full outline-none transition-transform active:scale-[0.98] sm:h-[390px] sm:w-[390px]"
        >
          <span
            key={`pulse-${pulseKey}`}
            aria-hidden="true"
            className="awake-rhythm-pulse absolute h-40 w-40 rounded-full"
          />

          <span
            key={`tap-${tapKey}`}
            aria-hidden="true"
            className="awake-tap-ripple absolute h-28 w-28 rounded-full border border-white/70"
          />

          <span className="awake-water-breathe relative flex h-32 w-32 items-center justify-center rounded-full">
            <span className="awake-water-core absolute inset-0 rounded-full" />

            <span className="awake-water-shimmer absolute left-[18%] top-[22%] h-[22%] w-[48%] rounded-full" />

            <span className="relative h-20 w-20 rounded-full bg-white/10" />
          </span>
        </button>

        <p
          aria-live="polite"
          className="mt-8 min-h-6 text-sm font-light tracking-[0.12em] text-slate-700/80"
        >
          {feedback}
        </p>

        <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-slate-600/60">
          Tap with the ripple
        </p>
      </div>

      <button
        type="button"
        onClick={finishPractice}
        className="absolute bottom-10 rounded-full border border-white/50 bg-white/25 px-6 py-3 text-sm text-slate-700 backdrop-blur-sm transition hover:bg-white/40"
      >
        Finish
      </button>

      <style jsx>{`
        @keyframes awake-water-drift {
          0% {
            transform: translateX(-8%) scaleX(1);
          }

          50% {
            transform: translateX(8%) scaleX(1.08);
          }

          100% {
            transform: translateX(-8%) scaleX(1);
          }
        }

        @keyframes awake-water-breathe {
          0%,
          100% {
            transform: scale(0.96);
            filter: brightness(0.92);
          }

          50% {
            transform: scale(1.06);
            filter: brightness(1.15);
          }
        }

        @keyframes awake-rhythm-pulse {
          0% {
            transform: scale(0.42);
            opacity: 0.96;
          }

          28% {
            opacity: 0.82;
          }

          68% {
            opacity: 0.42;
          }

          100% {
            transform: scale(2.65);
            opacity: 0;
          }
        }

        @keyframes awake-tap-ripple {
          0% {
            transform: scale(0.7);
            opacity: 0.8;
          }

          100% {
            transform: scale(1.25);
            opacity: 0;
          }
        }

        .awake-water-line {
          position: absolute;
          left: -20%;
          width: 140%;
          height: 1px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.38);
          animation: awake-water-drift 8s ease-in-out infinite;
        }

        .awake-water-line-one {
          top: 30%;
        }

        .awake-water-line-two {
          top: 48%;
          animation-delay: -2.5s;
          animation-duration: 10s;
        }

        .awake-water-line-three {
          top: 66%;
          animation-delay: -5s;
          animation-duration: 12s;
        }

        .awake-water-breathe {
          animation: awake-water-breathe 5.6s ease-in-out infinite;
        }

        .awake-water-core {
          background:
            radial-gradient(
              circle at 42% 34%,
              rgba(255, 255, 255, 0.78) 0%,
              rgba(255, 255, 255, 0.32) 18%,
              rgba(${secondaryRgb}, 0.26) 52%,
              rgba(${primaryRgb}, 0.12) 100%
            );

          border: 1px solid rgba(255, 255, 255, 0.72);

          box-shadow:
            0 0 16px rgba(255, 255, 255, 0.72),
            0 0 38px rgba(${secondaryRgb}, 0.55),
            0 0 86px rgba(${primaryRgb}, 0.4),
            inset 0 0 28px rgba(255, 255, 255, 0.26);
        }

        .awake-water-shimmer {
          background: rgba(255, 255, 255, 0.28);
          filter: blur(5px);
          transform: rotate(-14deg);
        }

        .awake-rhythm-pulse {
          border: 2px solid rgba(255, 255, 255, 0.9);

          box-shadow:
            0 0 10px rgba(255, 255, 255, 0.82),
            0 0 26px rgba(${secondaryRgb}, 0.56),
            0 0 58px rgba(${primaryRgb}, 0.38);

          animation: awake-rhythm-pulse
            ${BEAT_LENGTH}ms cubic-bezier(0.18, 0.72, 0.32, 1)
            forwards;
        }
        .awake-tap-ripple {
          border-width: 2px;

          box-shadow:
            0 0 8px rgba(255, 255, 255, 0.6),
            0 0 20px rgba(220, 248, 255, 0.35);

          animation: awake-tap-ripple 550ms ease-out forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .awake-water-line,
          .awake-water-breathe,
          .awake-rhythm-pulse,
          .awake-tap-ripple {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}