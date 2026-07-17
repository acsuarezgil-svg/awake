"use client";

import { useEffect, useState } from "react";

type RhythmPracticeProps = {
  onFinish: () => void;
};

export default function RhythmPractice({
  onFinish,
}: RhythmPracticeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => cancelAnimationFrame(frame);
  }, []);

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
        isVisible && !isLeaving ? "opacity-100" : "opacity-0"
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
        <div className="awake-water-breathe flex h-40 w-40 items-center justify-center rounded-full bg-white/20 shadow-[0_0_60px_rgba(255,255,255,0.32)]">
          <div className="h-24 w-24 rounded-full bg-white/15" />
        </div>

        <p className="mt-10 text-xs uppercase tracking-[0.32em] text-slate-600/75">
          Be Here
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
            transform: scale(1.08);
            opacity: 1;
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
          animation: awake-water-breathe 6s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .awake-water-line,
          .awake-water-breathe {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}