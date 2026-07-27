"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  patternsForStage,
  readablePattern,
  rhythmStages,
  type RhythmPattern,
  type RhythmSide,
  type RhythmStage,
} from "./rhythmPatterns";
import {
  RhythmAudio,
  type RhythmSoundProfile,
} from "./rhythmAudio";

type RhythmPracticeProps = {
  onFinish: () => void;
  primaryColor: string;
  secondaryColor: string;
  pageBackground: string;
};

type PracticePhase = "choose" | "listen" | "practice" | "complete";

const BPM_PRESETS = [40, 50, 60, 70, 80, 100, 120];
const SOUND_PROFILES: Array<{
  id: RhythmSoundProfile;
  label: string;
}> = [
  { id: "piano", label: "Piano" },
  { id: "wood", label: "Wood" },
  { id: "water", label: "Water" },
  { id: "bamboo", label: "Bamboo" },
  { id: "chime", label: "Chime" },
  { id: "ambient", label: "Ambient" },
];

export default function RhythmPractice({
  onFinish,
  primaryColor,
  secondaryColor,
  pageBackground,
}: RhythmPracticeProps) {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<PracticePhase>("choose");
  const [stage, setStage] = useState<RhythmStage>("pulse");
  const [pattern, setPattern] = useState<RhythmPattern>(
    () => patternsForStage("pulse")[0],
  );
  const [bpm, setBpm] = useState(60);
  const [beatIndex, setBeatIndex] = useState(0);
  const [measure, setMeasure] = useState(1);
  const [feedback, setFeedback] = useState("Listen to the pulse");
  const [metronome, setMetronome] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [profile, setProfile] =
    useState<RhythmSoundProfile>("piano");
  const [leftRipple, setLeftRipple] = useState(0);
  const [rightRipple, setRightRipple] = useState(0);
  const [timings, setTimings] = useState<number[]>([]);
  const audioRef = useRef<RhythmAudio | null>(null);
  const startedAtRef = useRef(0);
  const absoluteStepRef = useRef(-1);

  const stepMs = 60_000 / bpm / pattern.subdivision;
  const consistency = useMemo(() => {
    if (!timings.length) return null;
    const average =
      timings.reduce((sum, value) => sum + value, 0) / timings.length;
    return Math.max(0, Math.round(100 - (average / (stepMs / 2)) * 100));
  }, [stepMs, timings]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    audioRef.current = new RhythmAudio();
    return () => {
      cancelAnimationFrame(frame);
      audioRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (phase !== "listen" && phase !== "practice") return;
    const timer = window.setInterval(() => {
      const absoluteStep = Math.floor(
        (performance.now() - startedAtRef.current) / stepMs,
      );
      if (absoluteStep < 0 || absoluteStep === absoluteStepRef.current) return;
      absoluteStepRef.current = absoluteStep;
      const nextIndex = absoluteStep % pattern.steps.length;
      const nextMeasure =
        Math.floor(absoluteStep / pattern.steps.length) + 1;
      setBeatIndex(nextIndex);
      setMeasure(nextMeasure);

      if (absoluteStep % pattern.subdivision === 0) {
        if (haptics && "vibrate" in navigator) navigator.vibrate(7);
        if (metronome && soundEnabled) {
          audioRef.current?.play("wood", "left", true);
        }
      }

      if (phase === "listen" && absoluteStep >= pattern.steps.length) {
        setPhase("practice");
        setFeedback("Stay with the rhythm");
      } else if (phase === "practice" && nextMeasure > 4) {
        setPhase("complete");
        setFeedback("The rhythm has settled");
      }
    }, 24);
    return () => window.clearInterval(timer);
  }, [
    haptics,
    metronome,
    pattern.steps.length,
    pattern.subdivision,
    phase,
    soundEnabled,
    stepMs,
  ]);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (phase !== "practice") return;
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        event.preventDefault();
        handleTap("left");
      } else if (
        event.key === "ArrowRight" ||
        event.key.toLowerCase() === "l"
      ) {
        event.preventDefault();
        handleTap("right");
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // handleTap intentionally reads the current beat clock.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, pattern, stepMs, soundEnabled, profile]);

  function begin() {
    setTimings([]);
    setBeatIndex(0);
    setMeasure(1);
    setFeedback("Listen once");
    absoluteStepRef.current = -1;
    startedAtRef.current = performance.now() + 650;
    setPhase("listen");
  }

  function handleTap(side: RhythmSide) {
    if (phase !== "practice") return;
    const elapsed = performance.now() - startedAtRef.current;
    const nearestStep = Math.max(0, Math.round(elapsed / stepMs));
    const targetTime = startedAtRef.current + nearestStep * stepMs;
    const difference = performance.now() - targetTime;
    const expected = pattern.steps[nearestStep % pattern.steps.length];
    const withinPhrase = expected === side;

    if (side === "left") setLeftRipple((value) => value + 1);
    else setRightRipple((value) => value + 1);

    if (!withinPhrase) {
      setFeedback("Listen, then return");
      return;
    }

    const distance = Math.abs(difference);
    setTimings((values) => [...values, distance]);
    if (soundEnabled) audioRef.current?.play(profile, side);
    if (distance < stepMs * 0.13) setFeedback("Beautiful timing");
    else if (difference < 0) setFeedback("Let the beat arrive");
    else setFeedback("Stay with the flow");
  }

  function chooseStage(next: RhythmStage) {
    setStage(next);
    setPattern(patternsForStage(next)[0]);
  }

  function continueWithAnother() {
    const choices = patternsForStage(stage);
    const index = choices.findIndex((item) => item.id === pattern.id);
    setPattern(choices[(index + 1) % choices.length]);
    setPhase("choose");
  }

  return (
    <div
      className={`fixed inset-0 z-[200] min-h-screen overflow-y-auto transition-opacity duration-700 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        color: "var(--awake-text)",
        background: `
          radial-gradient(circle at 50% 24%, color-mix(in srgb, ${secondaryColor} 28%, transparent), transparent 48%),
          linear-gradient(180deg, color-mix(in srgb, ${primaryColor} 10%, transparent), color-mix(in srgb, ${secondaryColor} 20%, transparent)),
          ${pageBackground}
        `,
      }}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 pb-20 pt-9">
        <header className="text-center">
          <p className="awake-eyebrow">Rhythm</p>
          <h1 className="mt-3 text-3xl font-light">Find a steady rhythm</h1>
          <p className="awake-supporting mx-auto mt-2 max-w-sm">
            Listen, move, and return. There is nothing to beat.
          </p>
        </header>

        {phase === "choose" ? (
          <section className="mt-8 space-y-7">
            <fieldset>
              <legend className="text-sm font-medium">Practice</legend>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {rhythmStages.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => chooseStage(option.id)}
                    className="awake-chip min-h-12 px-3"
                    aria-pressed={stage === option.id}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="awake-supporting mt-2 text-center text-xs">
                {rhythmStages.find((option) => option.id === stage)?.description}
              </p>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-medium">Tempo</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {BPM_PRESETS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setBpm(value)}
                    className="awake-chip min-h-10 min-w-12"
                    aria-pressed={bpm === value}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <p className="awake-supporting mt-2 text-xs">♩ = {bpm} BPM</p>
            </fieldset>

            <div className="awake-card space-y-4">
              <Toggle
                label="Metronome"
                checked={metronome}
                onChange={setMetronome}
              />
              <Toggle
                label="Sound"
                checked={soundEnabled}
                onChange={setSoundEnabled}
              />
              <Toggle label="Haptics" checked={haptics} onChange={setHaptics} />
              {soundEnabled && (
                <div>
                  <p className="text-sm font-medium">Sound</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SOUND_PROFILES.map((sound) => (
                      <button
                        key={sound.id}
                        type="button"
                        onClick={() => setProfile(sound.id)}
                        className="awake-chip min-h-10"
                        aria-pressed={profile === sound.id}
                      >
                        {sound.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={begin}
              className="awake-button awake-button-primary w-full"
            >
              Listen
            </button>
          </section>
        ) : (
          <>
            <section className="mt-8 text-center">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowInfo((value) => !value)}
                  className="awake-button awake-button-quiet min-h-10 text-xs"
                  aria-expanded={showInfo}
                >
                  Rhythm details
                </button>
                <p className="text-sm font-medium">{pattern.name}</p>
                <span className="w-24" aria-hidden="true" />
              </div>
              {showInfo && (
                <div className="awake-supporting mt-3 flex justify-center gap-5 text-xs">
                  <span>♩ = {bpm} BPM</span>
                  <span>Measure {Math.min(measure, 4)} / 4</span>
                  <span>Beat {beatIndex + 1} of {pattern.steps.length}</span>
                </div>
              )}
              <p className="sr-only">Pattern: {readablePattern(pattern)}</p>

              <div className="relative mt-7 overflow-hidden rounded-full border p-2">
                <span
                  className="beat-playhead absolute bottom-0 top-0 w-10 rounded-full"
                  style={{
                    left: `calc(${((beatIndex + 0.5) / pattern.steps.length) * 100}% - 1.25rem)`,
                  }}
                  aria-hidden="true"
                />
                <div
                  className="relative grid"
                  style={{
                    gridTemplateColumns: `repeat(${pattern.steps.length}, minmax(2.5rem, 1fr))`,
                  }}
                >
                  {pattern.steps.map((step, index) => (
                    <span
                      key={`${step}-${index}`}
                      className="flex min-h-14 flex-col items-center justify-center text-xs"
                      aria-current={index === beatIndex ? "step" : undefined}
                    >
                      <span className="awake-supporting">
                        {pattern.subdivision === 2
                          ? index % 2 === 0
                            ? Math.floor(index / 2) + 1
                            : "&"
                          : index + 1}
                      </span>
                      <span className="mt-1 font-semibold">
                        {step === "left" ? "L" : step === "right" ? "R" : "—"}
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              <p className="awake-supporting mt-5 min-h-6 text-sm" aria-live="polite">
                {phase === "listen" ? "Listen once" : feedback}
              </p>
            </section>

            {phase === "complete" ? (
              <section className="mt-10 text-center">
                <div className="awake-orb is-breathing mx-auto h-28 w-28" />
                <p className="mt-5 text-xl font-medium">Beautiful rhythm</p>
                <p className="awake-supporting mt-2">
                  {consistency === null
                    ? "You stayed present with the phrase."
                    : `${consistency}% timing consistency · steady rhythm`}
                </p>
                <div className="mt-7 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={continueWithAnother}
                    className="awake-button awake-button-secondary"
                  >
                    Again
                  </button>
                  <button
                    type="button"
                    onClick={onFinish}
                    className="awake-button awake-button-primary"
                  >
                    Continue
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
                    aria-label={`Tap ${side}. ${
                      side === "left" ? "Left arrow or A" : "Right arrow or L"
                    }`}
                    className="rhythm-side relative flex h-52 touch-manipulation items-center justify-center overflow-hidden rounded-[2.5rem] border text-lg font-medium transition active:scale-[0.99] disabled:opacity-60"
                  >
                    <span className="relative z-10 capitalize">{side}</span>
                    {(side === "left" ? leftRipple : rightRipple) > 0 && (
                      <span
                        key={side === "left" ? leftRipple : rightRipple}
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
          onClick={onFinish}
          className="awake-button awake-button-quiet mx-auto mt-auto"
        >
          Return
        </button>
      </div>

      <style jsx>{`
        .beat-playhead {
          background: var(--awake-accent-soft);
          box-shadow: 0 0 20px
            color-mix(in srgb, var(--awake-orb-glow) 18%, transparent);
          transition: left ${Math.min(stepMs * 0.7, 700)}ms linear;
        }
        .rhythm-side {
          border-color: var(--awake-border);
          background: var(--awake-surface-subtle);
          color: var(--awake-text);
        }
        .tap-ripple {
          border-color: var(--awake-orb-glow);
          animation: tap-ripple 620ms ease-out;
        }
        @keyframes tap-ripple {
          from { opacity: 0.52; transform: scale(0.55); }
          to { opacity: 0; transform: scale(2.25); }
        }
        @media (prefers-reduced-motion: reduce) {
          .beat-playhead { transition: none; }
          .tap-ripple {
            animation: none;
            opacity: 0.45;
            transform: scale(0.72);
          }
        }
      `}</style>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 items-center justify-between gap-4 text-sm">
      {label}
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5"
      />
    </label>
  );
}
