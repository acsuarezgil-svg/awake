"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { pianoKnowledgePack } from "../../../data/pianoKnowledgePack";
import {
  appendLearningSystem,
  createLearningSystem,
} from "../../../learningSystemStorage";
import type { LearningStageLevel } from "../../../types/learning";

const weekdays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

const stageLabels: Record<LearningStageLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const stepNames = ["Level", "Schedule", "Session", "Review"];

export default function PianoSetupFlow({
  initialLevel,
}: {
  initialLevel: LearningStageLevel;
}) {
  const router = useRouter();
  const savingRef = useRef(false);
  const initialStage = pianoKnowledgePack.stages.find(
    (stage) => stage.level === initialLevel,
  ) ?? pianoKnowledgePack.stages[0];
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState<LearningStageLevel>(initialStage.level);
  const [selectedDays, setSelectedDays] = useState<string[]>([
    ...initialStage.suggestedDays,
  ]);
  const [minutes, setMinutes] = useState<number>(
    initialStage.recommendedMinutesPerSession,
  );
  const [isSaving, setIsSaving] = useState(false);

  const stage = pianoKnowledgePack.stages.find(
    (item) => item.level === level,
  ) ?? pianoKnowledgePack.stages[0];
  const durationOptions = useMemo(
    () => [
      stage.recommendedMinutesPerSession,
      ...[15, 30, 45, 60].filter(
        (value) => value !== stage.recommendedMinutesPerSession,
      ),
    ],
    [stage.recommendedMinutesPerSession],
  );

  function chooseLevel(nextLevel: LearningStageLevel) {
    const nextStage = pianoKnowledgePack.stages.find(
      (item) => item.level === nextLevel,
    ) ?? pianoKnowledgePack.stages[0];
    setLevel(nextLevel);
    setSelectedDays([...nextStage.suggestedDays]);
    setMinutes(nextStage.recommendedMinutesPerSession);
  }

  function toggleDay(day: string) {
    setSelectedDays((current) =>
      current.includes(day)
        ? current.filter((item) => item !== day)
        : weekdays.filter((item) => current.includes(item) || item === day),
    );
  }

  function createJourney() {
    if (savingRef.current || selectedDays.length === 0) return;

    savingRef.current = true;
    setIsSaving(true);

    try {
      const journey = createLearningSystem(
        pianoKnowledgePack,
        stage,
        selectedDays,
        minutes,
      );
      appendLearningSystem(journey);
      router.replace(`/learn/journeys/${journey.id}`);
    } catch {
      savingRef.current = false;
      setIsSaving(false);
    }
  }

  return (
    <main className="px-4 py-6 sm:px-6 sm:py-10 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-2xl flex-col">
        <header>
          <Link
            href={`/learn/piano`}
            className="text-sm text-[var(--awake-text-secondary)] transition-colors hover:text-[var(--awake-text)] motion-reduce:transition-none"
          >
            ← Back to Piano
          </Link>
          <div className="mt-8 flex items-center justify-between gap-4">
            <p className="awake-eyebrow">Create your learning journey</p>
            <p className="text-xs text-[var(--awake-text-muted)]">
              {step + 1} of {stepNames.length}
            </p>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2" aria-hidden="true">
            {stepNames.map((name, index) => (
              <div key={name}>
                <div
                  className={`h-1 rounded-full ${
                    index <= step
                      ? "bg-[var(--awake-accent)]"
                      : "bg-[var(--awake-border)]"
                  }`}
                />
                <span className="sr-only">{name}</span>
              </div>
            ))}
          </div>
        </header>

        <div className="flex flex-1 flex-col py-10 sm:py-14">
          {step === 0 && (
            <section aria-labelledby="level-title">
              <p className="awake-eyebrow">Begin where you are</p>
              <h1 id="level-title" className="mt-3">Which level feels right?</h1>
              <p className="mt-4 text-[var(--awake-text-secondary)]">
                You can review each starting point before continuing.
              </p>
              <div className="mt-8 space-y-3">
                {pianoKnowledgePack.stages.map((item) => {
                  const selected = item.level === level;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => chooseLevel(item.level)}
                      className={`min-h-20 w-full rounded-[var(--awake-radius-card)] border p-5 text-left transition-colors motion-reduce:transition-none ${
                        selected
                          ? "border-[var(--awake-accent)] bg-[var(--awake-accent-soft)]"
                          : "border-[var(--awake-border)] bg-[var(--awake-surface-subtle)] hover:border-[var(--awake-border-strong)]"
                      }`}
                    >
                      <span className="font-semibold text-[var(--awake-text)]">{stageLabels[item.level]}</span>
                      <span className="mt-1 block text-sm text-[var(--awake-text-secondary)]">{item.title} · {item.estimatedDuration}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {step === 1 && (
            <section aria-labelledby="schedule-title">
              <p className="awake-eyebrow">Practice schedule</p>
              <h1 id="schedule-title" className="mt-3">Which days can hold your practice?</h1>
              <p className="mt-4 text-[var(--awake-text-secondary)]">
                We started with the suggested rhythm. Choose at least one day.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {weekdays.map((day) => {
                  const selected = selectedDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleDay(day)}
                      className={`flex min-h-14 items-center justify-between rounded-[var(--awake-radius-control)] border px-5 py-3 text-left transition-colors motion-reduce:transition-none ${
                        selected
                          ? "border-[var(--awake-accent)] bg-[var(--awake-accent-soft)] text-[var(--awake-text)]"
                          : "border-[var(--awake-border)] bg-[var(--awake-surface-subtle)] text-[var(--awake-text-secondary)]"
                      }`}
                    >
                      <span>{day}</span>
                      <span aria-hidden="true">{selected ? "✓" : "○"}</span>
                    </button>
                  );
                })}
              </div>
              {selectedDays.length === 0 && (
                <p role="alert" className="mt-4 text-sm text-[var(--awake-danger)]">Choose at least one practice day.</p>
              )}
            </section>
          )}

          {step === 2 && (
            <section aria-labelledby="duration-title">
              <p className="awake-eyebrow">Session length</p>
              <h1 id="duration-title" className="mt-3">How long feels sustainable?</h1>
              <p className="mt-4 text-[var(--awake-text-secondary)]">
                {stage.recommendedMinutesPerSession} minutes is recommended for {stageLabels[level].toLowerCase()} practice.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {durationOptions.map((value, index) => {
                  const selected = value === minutes;
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setMinutes(value)}
                      className={`min-h-20 rounded-[var(--awake-radius-control)] border px-3 py-4 text-center transition-colors motion-reduce:transition-none ${
                        selected
                          ? "border-[var(--awake-accent)] bg-[var(--awake-accent-soft)] text-[var(--awake-text)]"
                          : "border-[var(--awake-border)] bg-[var(--awake-surface-subtle)] text-[var(--awake-text-secondary)]"
                      }`}
                    >
                      <span className="block text-lg font-semibold">{value}</span>
                      <span className="block text-xs">minutes</span>
                      {index === 0 && <span className="mt-1 block text-[0.65rem] uppercase tracking-wide text-[var(--awake-accent)]">Recommended</span>}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {step === 3 && (
            <section aria-labelledby="review-title">
              <p className="awake-eyebrow">Your plan</p>
              <h1 id="review-title" className="mt-3">Ready to begin?</h1>
              <p className="mt-4 text-[var(--awake-text-secondary)]">A steady plan you can reshape as you learn.</p>

              <dl className="mt-8 divide-y divide-[var(--awake-border)] border-y border-[var(--awake-border)]">
                <div className="py-5">
                  <dt className="text-xs uppercase tracking-wider text-[var(--awake-text-muted)]">Piano stage</dt>
                  <dd className="mt-1 font-semibold">{stage.title}</dd>
                  <dd className="text-sm text-[var(--awake-text-secondary)]">{stage.estimatedDuration}</dd>
                </div>
                <div className="py-5">
                  <dt className="text-xs uppercase tracking-wider text-[var(--awake-text-muted)]">Practice schedule</dt>
                  <dd className="mt-1">{selectedDays.join(" · ")}</dd>
                  <dd className="text-sm text-[var(--awake-text-secondary)]">{minutes} minutes per session</dd>
                </div>
                <div className="py-5">
                  <dt className="text-xs uppercase tracking-wider text-[var(--awake-text-muted)]">Learning path</dt>
                  <dd className="mt-1">
                    {stage.curriculumSections.reduce((total, section) => total + section.lessons.length, 0)} lessons, beginning with “{stage.curriculumSections[0]?.lessons[0]?.title}”
                  </dd>
                </div>
                <div className="py-5">
                  <dt className="text-xs uppercase tracking-wider text-[var(--awake-text-muted)]">Each practice</dt>
                  <dd className="mt-1 text-sm leading-6 text-[var(--awake-text-secondary)]">{stage.practiceTemplate.map((block) => block.title).join(" · ")}</dd>
                </div>
              </dl>
            </section>
          )}
        </div>

        <footer className="sticky bottom-0 -mx-4 border-t border-[var(--awake-border)] bg-[var(--awake-page-tint)]/95 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:bg-transparent sm:px-0 sm:backdrop-blur-none">
          <div className="flex flex-col-reverse gap-3 min-[360px]:flex-row min-[360px]:justify-between">
            {step === 0 ? (
              <Link href="/learn/piano" className="awake-button awake-button-quiet min-h-12">Go back</Link>
            ) : (
              <button type="button" onClick={() => setStep((current) => current - 1)} className="awake-button awake-button-quiet min-h-12">Go back</button>
            )}
            {step < 3 ? (
              <button
                type="button"
                disabled={step === 1 && selectedDays.length === 0}
                onClick={() => setStep((current) => current + 1)}
                className="awake-button awake-button-primary min-h-12 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                disabled={isSaving}
                onClick={createJourney}
                className="awake-button awake-button-primary min-h-12 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Creating…" : "Create journey"}
              </button>
            )}
          </div>
        </footer>
      </div>
    </main>
  );
}
