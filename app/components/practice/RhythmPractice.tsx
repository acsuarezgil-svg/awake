"use client";

import { useEffect, useRef, useState } from "react";

import {
  patternsForLevel,
  readablePattern,
  rhythmLevels,
  rhythmTempos,
  type RhythmLevel,
  type RhythmPattern,
  type RhythmSide,
  type RhythmTempo,
} from "./rhythmPatterns";

type RhythmPracticeProps = {
  onFinish: () => void;
  primaryColor: string;
  secondaryColor: string;
  pageBackground: string;
};

type PracticePhase = "choose" | "preview" | "practice" | "complete";

const REPEATS_TO_SETTLE = 3;

export default function RhythmPractice({
  onFinish,
  primaryColor,
  secondaryColor,
  pageBackground,
}: RhythmPracticeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [level, setLevel] = useState<RhythmLevel>("pulse");
  const [tempo, setTempo] = useState<RhythmTempo>("steady");
  const [pattern, setPattern] = useState<RhythmPattern>(
    () => patternsForLevel("pulse")[0],
  );
  const [phase, setPhase] = useState<PracticePhase>("choose");
  const [stepIndex, setStepIndex] = useState(0);
  const [repetitions, setRepetitions] = useState(0);
  const [feedback, setFeedback] = useState(
    "Choose a rhythm to begin",
  );
  const [leftRipple, setLeftRipple] = useState(0);
  const [rightRipple, setRightRipple] = useState(0);
  const lastTapRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const lastPatternIdRef = useRef<string | null>(null);

  const tempoConfig =
    rhythmTempos.find((option) => option.id === tempo) ??
    rhythmTempos[1];
  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsVisible(true));
    return () => {
      cancelAnimationFrame(frame);
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (phase !== "preview") return;
    timerRef.current = window.setTimeout(() => {
      if (stepIndex >= pattern.steps.length - 1) {
        setStepIndex(0);
        setPhase("practice");
        setFeedback("Tap the pattern");
        lastTapRef.current = null;
        return;
      }
      setStepIndex((current) => current + 1);
    }, tempoConfig.stepMs);
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [
    pattern.steps.length,
    phase,
    stepIndex,
    tempoConfig.stepMs,
  ]);

  useEffect(() => {
    if (
      phase !== "practice" ||
      pattern.steps[stepIndex] !== "rest"
    ) {
      return;
    }
    timerRef.current = window.setTimeout(() => {
      advanceStep();
    }, tempoConfig.stepMs);
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
    // advanceStep uses the current render's step and repetition state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, stepIndex, pattern.id, tempoConfig.stepMs]);

  function choosePattern(nextLevel = level) {
    const choices = patternsForLevel(nextLevel);
    const alternatives = choices.filter(
      (item) => item.id !== lastPatternIdRef.current,
    );
    const pool = alternatives.length > 0 ? alternatives : choices;
    const next = pool[Math.floor(Math.random() * pool.length)];
    lastPatternIdRef.current = next.id;
    setPattern(next);
    setStepIndex(0);
    setRepetitions(0);
    setFeedback("Watch once");
    setPhase("preview");
  }

  function advanceStep() {
    if (stepIndex < pattern.steps.length - 1) {
      setStepIndex((current) => current + 1);
      return;
    }

    const nextRepetitions = repetitions + 1;
    if (nextRepetitions >= REPEATS_TO_SETTLE) {
      setRepetitions(nextRepetitions);
      setPhase("complete");
      setFeedback("The rhythm has settled");
      if ("vibrate" in navigator) navigator.vibrate([10, 40, 10]);
      return;
    }

    setRepetitions(nextRepetitions);
    setStepIndex(0);
    setFeedback("Again, gently");
    lastTapRef.current = null;
  }

  function returnToRhythm() {
    setStepIndex(0);
    setRepetitions(0);
    setFeedback("Return to the rhythm");
    lastTapRef.current = null;
  }

  function handleTap(side: RhythmSide) {
    if (phase !== "practice") return;
    const expected = pattern.steps[stepIndex];
    if (expected === "rest") {
      returnToRhythm();
      return;
    }

    const now = performance.now();
    if (
      lastTapRef.current !== null &&
      now - lastTapRef.current >
        tempoConfig.stepMs + tempoConfig.toleranceMs
    ) {
      returnToRhythm();
      return;
    }
    if (side !== expected) {
      returnToRhythm();
      return;
    }

    if (side === "left") {
      setLeftRipple((current) => current + 1);
    } else {
      setRightRipple((current) => current + 1);
    }
    lastTapRef.current = now;
    setFeedback("Stay with it");
    if ("vibrate" in navigator) navigator.vibrate(8);
    advanceStep();
  }

  function finishPractice() {
    setIsLeaving(true);
    setIsVisible(false);
    window.setTimeout(onFinish, 700);
  }

  const currentStep =
    phase === "preview" || phase === "practice"
      ? pattern.steps[stepIndex]
      : null;

  return (
    <div
      className={`fixed inset-0 z-[200] min-h-screen overflow-y-auto transition-opacity duration-700 ${
        isVisible && !isLeaving ? "opacity-100" : "opacity-0"
      }`}
      style={{
        color: "var(--awake-text)",
        background: `
          radial-gradient(circle at 50% 24%, color-mix(in srgb, ${secondaryColor} 30%, transparent), transparent 48%),
          linear-gradient(180deg, color-mix(in srgb, ${primaryColor} 12%, transparent), color-mix(in srgb, ${secondaryColor} 22%, transparent)),
          ${pageBackground}
        `,
      }}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 pb-24 pt-10">
        <header className="text-center">
          <p className="awake-eyebrow">Rhythm</p>
          <h1 className="mt-3 text-3xl font-light">Return to a pattern</h1>
          <p className="awake-supporting mt-2">
            Coordination, attention, and flow.
          </p>
        </header>

        {phase === "choose" ? (
          <section className="mt-9">
            <fieldset>
              <legend className="text-sm font-medium">
                Choose a feeling
              </legend>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {rhythmLevels.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setLevel(option.id);
                      setPattern(patternsForLevel(option.id)[0]);
                    }}
                    className="awake-chip min-h-14 px-2"
                    aria-pressed={level === option.id}
                    title={option.description}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p
                className="mt-2 text-center text-xs"
                style={{ color: "var(--awake-text-secondary)" }}
              >
                {
                  rhythmLevels.find((option) => option.id === level)
                    ?.description
                }
              </p>
            </fieldset>

            <fieldset className="mt-7">
              <legend className="text-sm font-medium">Tempo</legend>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {rhythmTempos.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setTempo(option.id)}
                    className="awake-chip"
                    aria-pressed={tempo === option.id}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <button
              type="button"
              onClick={() => choosePattern()}
              className="awake-button awake-button-primary mt-9 w-full"
            >
              Begin
            </button>
          </section>
        ) : (
          <>
            <section className="mt-8 text-center">
              <p className="text-sm font-medium">{pattern.name}</p>
              <p className="sr-only">
                Pattern: {readablePattern(pattern)}
              </p>
              <div
                className="mt-4 flex flex-wrap justify-center gap-2"
                aria-hidden="true"
              >
                {pattern.steps.map((step, index) => (
                  <span
                    key={`${step}-${index}`}
                    className="flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-xs font-medium transition"
                    style={{
                      borderColor:
                        index === stepIndex &&
                        (phase === "preview" || phase === "practice")
                          ? "var(--awake-accent)"
                          : "var(--awake-border)",
                      background:
                        index === stepIndex &&
                        (phase === "preview" || phase === "practice")
                          ? "var(--awake-accent)"
                          : "var(--awake-surface-subtle)",
                      color:
                        index === stepIndex &&
                        (phase === "preview" || phase === "practice")
                          ? "var(--awake-accent-contrast)"
                          : "var(--awake-text-secondary)",
                    }}
                  >
                    {step === "left"
                      ? "Left"
                      : step === "right"
                        ? "Right"
                        : "Pause"}
                  </span>
                ))}
              </div>
              <p
                aria-live="polite"
                className="mt-4 min-h-6 text-sm"
                style={{ color: "var(--awake-text-secondary)" }}
              >
                {phase === "preview"
                  ? "Watch once"
                  : currentStep === "rest"
                    ? "Pause"
                    : feedback}
              </p>
            </section>

            {phase === "complete" ? (
              <section className="mt-10 text-center">
                <div className="awake-orb is-breathing mx-auto h-28 w-28" />
                <p className="mt-5 text-lg font-medium">
                  The rhythm has settled
                </p>
                <div className="mt-7 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => choosePattern(level)}
                    className="awake-button awake-button-secondary"
                  >
                    Another pattern
                  </button>
                  <button
                    type="button"
                    onClick={finishPractice}
                    className="awake-button awake-button-primary"
                  >
                    Finish
                  </button>
                </div>
              </section>
            ) : (
              <section className="mt-8 grid grid-cols-2 gap-4">
                {(["left", "right"] as const).map((side) => (
                  <button
                    key={side}
                    type="button"
                    disabled={phase !== "practice"}
                    onClick={() => handleTap(side)}
                    aria-label={`Tap ${side}`}
                    className={`rhythm-side relative flex h-56 touch-manipulation items-center justify-center overflow-hidden rounded-[2.5rem] border text-lg font-medium transition active:scale-[0.99] ${
                      currentStep === side && phase === "preview"
                        ? "is-previewing"
                        : ""
                    }`}
                    style={{
                      borderColor: "var(--awake-border)",
                      background: "var(--awake-surface-subtle)",
                      color: "var(--awake-text)",
                    }}
                  >
                    <span className="relative z-10 capitalize">{side}</span>
                    {(side === "left"
                      ? leftRipple > 0
                      : rightRipple > 0) && (
                      <span
                        key={
                          side === "left"
                            ? `left-${leftRipple}`
                            : `right-${rightRipple}`
                        }
                        className="tap-ripple absolute h-24 w-24 rounded-full border"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                ))}
              </section>
            )}
          </>
        )}

        <button
          type="button"
          onClick={finishPractice}
          className="awake-button awake-button-quiet mx-auto mt-auto"
        >
          Finish
        </button>
      </div>

      <style jsx>{`
        .rhythm-side.is-previewing {
          background: var(--awake-accent-soft) !important;
          border-color: var(--awake-accent) !important;
        }

        .tap-ripple {
          border-color: var(--awake-orb-glow);
          opacity: 0;
          animation: tap-ripple 520ms ease-out;
        }

        @keyframes tap-ripple {
          from {
            opacity: 0.62;
            transform: scale(0.55);
          }
          to {
            opacity: 0;
            transform: scale(2.25);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .tap-ripple {
            animation: none;
            background: var(--awake-accent-soft);
            opacity: 0.55;
            transform: scale(0.7);
          }
        }
      `}</style>
    </div>
  );
}
