"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { findLearningSystem } from "../../../learningSystemStorage";
import type { UserLearningSystem } from "../../../types/learning";

export default function JourneyOverview({ id }: { id: string }) {
  const [journey, setJourney] = useState<
    UserLearningSystem | null | undefined
  >(undefined);

  useEffect(() => {
    // This store is intentionally browser-only.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setJourney(findLearningSystem(id) ?? null);
  }, [id]);

  const createdDate = useMemo(() => {
    if (!journey) return "";
    const value = new Date(journey.createdAt);
    return Number.isNaN(value.getTime())
      ? "Recently"
      : new Intl.DateTimeFormat(undefined, {
          dateStyle: "long",
        }).format(value);
  }, [journey]);

  if (journey === undefined) {
    return (
      <main className="grid min-h-screen place-items-center px-5">
        <p className="text-sm text-[var(--awake-text-muted)]">Opening your journey…</p>
      </main>
    );
  }

  if (journey === null) {
    return (
      <main className="grid min-h-screen place-items-center px-5">
        <div className="awake-empty-state">
          <h1>Journey not found</h1>
          <p className="mt-3 text-[var(--awake-text-secondary)]">
            This learning journey may have been removed or created in another browser.
          </p>
          <Link href="/learn/piano" className="awake-button awake-button-primary mt-6">
            Explore the Piano plan
          </Link>
        </div>
      </main>
    );
  }

  const currentModule = journey.learningPath.find(
    (module) => module.id === journey.currentModuleId,
  ) ?? journey.learningPath[0];

  return (
    <main className="px-4 py-6 sm:px-6 sm:py-10 lg:px-10">
      <div className="mx-auto w-full max-w-4xl">
        <Link
          href="/world"
          className="text-sm text-[var(--awake-text-secondary)] transition-colors hover:text-[var(--awake-text)] motion-reduce:transition-none"
        >
          ← Return to your world
        </Link>

        <header className="max-w-2xl pb-8 pt-8 sm:pb-12 sm:pt-12">
          <p className="awake-eyebrow">Active learning journey</p>
          <h1 className="mt-3 text-[length:var(--awake-type-display)]">{journey.title}</h1>
          <p className="mt-4 text-lg text-[var(--awake-text-secondary)]">{journey.stageDescription}</p>
          <p className="mt-4 text-sm text-[var(--awake-text-muted)]">
            Began {createdDate} from the curated {journey.sourcePackTitle} plan
          </p>
        </header>

        <section className="grid gap-6 border-y border-[var(--awake-border)] py-6 sm:grid-cols-3" aria-label="Practice schedule">
          <div>
            <p className="awake-eyebrow">Stage</p>
            <p className="mt-2 font-semibold">{journey.stageTitle}</p>
            <p className="text-sm text-[var(--awake-text-secondary)]">{journey.estimatedDuration}</p>
          </div>
          <div>
            <p className="awake-eyebrow">Practice days</p>
            <p className="mt-2 text-sm leading-6">{journey.suggestedDays.join(" · ")}</p>
          </div>
          <div>
            <p className="awake-eyebrow">Session</p>
            <p className="mt-2 font-semibold">{journey.minutesPerSession} minutes</p>
            <p className="text-sm text-[var(--awake-text-secondary)]">{journey.sessionsPerWeek} times each week</p>
          </div>
        </section>

        {currentModule && (
          <section className="mt-10 rounded-[var(--awake-radius-card)] border border-[var(--awake-border)] bg-[var(--awake-surface-subtle)] p-5 sm:p-7" aria-labelledby="current-title">
            <p className="awake-eyebrow">Begin here</p>
            <h2 id="current-title" className="mt-2">{currentModule.title}</h2>
            <p className="mt-3 leading-7 text-[var(--awake-text-secondary)]">{currentModule.description}</p>
          </section>
        )}

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,0.62fr)] lg:gap-16">
          <section aria-labelledby="path-title">
            <h2 id="path-title">Your learning path</h2>
            <ol className="mt-6 space-y-7">
              {journey.learningPath.map((module, index) => (
                <li key={module.id} className="grid grid-cols-[2rem_1fr] gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--awake-accent-soft)] text-sm font-semibold text-[var(--awake-accent)]">{index + 1}</span>
                  <div>
                    <h3>{module.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--awake-text-secondary)]">{module.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="practice-title">
            <h2 id="practice-title">Your practice session</h2>
            <ol className="mt-5 divide-y divide-[var(--awake-border)] border-y border-[var(--awake-border)]">
              {journey.practiceTemplate.map((block) => (
                <li key={block.id} className="py-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3>{block.title}</h3>
                    <span className="shrink-0 text-xs text-[var(--awake-text-muted)]">{block.minutes} min</span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-[var(--awake-text-secondary)]">{block.guidance}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <footer className="mt-14 flex flex-col items-center gap-3 border-t border-[var(--awake-border)] pt-8 sm:mt-20">
          <button
            type="button"
            disabled
            className="awake-button awake-button-primary cursor-not-allowed opacity-50"
          >
            Coming next
          </button>
          <p className="text-xs text-[var(--awake-text-muted)]">View today’s practice</p>
          <Link href="/world" className="awake-button awake-button-quiet">Return to your world</Link>
        </footer>
      </div>
    </main>
  );
}
