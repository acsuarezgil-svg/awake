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

  const curriculum = journey.curriculumSections ?? [];
  const currentSection = curriculum.find(
    (section) => section.id === journey.currentCurriculumSectionId,
  ) ?? curriculum[0];
  const currentLesson = currentSection?.lessons.find(
    (lesson) => lesson.id === journey.currentLessonId,
  ) ?? currentSection?.lessons[0];

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

        {currentLesson && (
          <section className="mt-10 border-y border-[var(--awake-border)] py-9 sm:py-12" aria-labelledby="focus-title">
            <p className="text-4xl font-semibold tracking-tight sm:text-5xl">
              {currentLesson.estimatedMinutes} min
            </p>
            <h2 id="focus-title" className="mt-8 text-lg">Focus</h2>
            <ul className="mt-4 space-y-3 text-xl leading-7 sm:text-2xl">
              {currentLesson.focusHighlights.map((highlight) => (
                <li key={highlight} className="flex gap-3">
                  <span aria-hidden="true" className="text-[var(--awake-accent)]">—</span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-10 grid gap-5 text-sm text-[var(--awake-text-secondary)] sm:grid-cols-3">
              <div>
                <dt className="awake-eyebrow">Stage</dt>
                <dd className="mt-2">{journey.stageTitle}</dd>
              </div>
              <div>
                <dt className="awake-eyebrow">Section</dt>
                <dd className="mt-2">{currentSection?.title}</dd>
              </div>
              <div>
                <dt className="awake-eyebrow">Lesson</dt>
                <dd className="mt-2">{currentLesson.title}</dd>
              </div>
            </dl>
          </section>
        )}

        <div className="mt-12 max-w-2xl">
          <section aria-labelledby="path-title">
            <h2 id="path-title">Curriculum outline</h2>
            <ol className="mt-6 space-y-8">
              {curriculum.map((section, index) => (
                <li key={section.id} className="grid grid-cols-[2rem_1fr] gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--awake-accent-soft)] text-sm font-semibold text-[var(--awake-accent)]">{index + 1}</span>
                  <div>
                    <h3>{section.title}</h3>
                    {section.description && (
                      <p className="mt-2 text-sm leading-6 text-[var(--awake-text-secondary)]">{section.description}</p>
                    )}
                    <ol className="mt-3 space-y-2 text-sm text-[var(--awake-text-secondary)]">
                      {section.lessons.map((lesson) => (
                        <li key={lesson.id}>{lesson.title}</li>
                      ))}
                    </ol>
                  </div>
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
