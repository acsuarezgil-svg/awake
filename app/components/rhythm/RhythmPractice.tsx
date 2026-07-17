"use client";

import { useEffect, useRef, useState } from "react";

type RhythmPracticeProps = {
  onFinish: () => void;
};

const BEAT_LENGTH = 2400;

export default function RhythmPractice({
  onFinish,
}: RhythmPracticeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);
  const [tapKey, setTapKey] = useState(0);
  const [feedback, setFeedback] = useState(
    "Notice the ripple"
  );

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
        background:
          "linear-gradient(180deg, #dceff2 0%, #b9dce2 48%, #8ebfc9 100%)",
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
          className="relative flex h-48 w-48 touch-manipulation items-center justify-center rounded-full outline-none transition-transform active:scale-95"
        >
          <span
            key={`pulse-${pulseKey}`}
            aria-hidden="true"
            className="awake-rhythm-pulse absolute h-32 w-32 rounded-full border border-white/60"
          />

          <span
            key={`tap-${tapKey}`}
            aria-hidden="true"
            className="awake-tap-ripple absolute h-28 w-28 rounded-full border border-white/70"
          />

          <span className="awake-water-breathe flex h-32 w-32 items-center justify-center rounded-full bg-white/20 shadow-[0_0_60px_rgba(255,255,255,0.32)]">
            <span className="h-20 w-20 rounded-full bg-white/15" />
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
            opacity: 0.72;
          }

          50% {
            transform: scale(1.06);
            opacity: 1;
          }
        }

        @keyframes awake-rhythm-pulse {
          0% {
            transform: scale(0.55);
            opacity: 0.85;
          }

          100% {
            transform: scale(1.65);
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
          animation: awake-water-breathe 4.8s ease-in-out infinite;
        }

        .awake-rhythm-pulse {
          animation: awake-rhythm-pulse
            ${BEAT_LENGTH}ms ease-out forwards;
        }

        .awake-tap-ripple {
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