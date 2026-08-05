"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { findLearningSystem } from "../../../learningSystemStorage";
import type { UserLearningSystem } from "../../../types/learning";

export default function JourneyOverview({ id }: { id: string }) {
  const [journey, setJourney] = useState<
    UserLearningSystem | null | undefined
  >(undefined);
  const [expandedSectionId, setExpandedSectionId] = useState<
    string | null | undefined
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
  const orderedLessons = curriculum.flatMap((section) => section.lessons);
  const currentLessonNumber = currentLesson
    ? orderedLessons.findIndex((lesson) => lesson.id === currentLesson.id) + 1
    : 0;
  const openSectionId = expandedSectionId === undefined
    ? currentSection?.id
    : expandedSectionId;

  return (
    <main className="px-4 py-6 sm:px-6 sm:py-10 lg:px-10">
      <div className="mx-auto w-full max-w-4xl">
        <Link
          href="/world"
          className="text-sm text-[var(--awake-text-secondary)] transition-colors hover:text-[var(--awake-text)] motion-reduce:transition-none"
        >
          ← Return to your world
        </Link>

        {currentLesson && (
          <section className="mx-auto max-w-2xl pb-10 pt-7 sm:pb-14 sm:pt-10" aria-labelledby="focus-title">
            <p className="awake-eyebrow">
              Lesson {currentLessonNumber || 1}
            </p>
            <h1 className="mt-2 text-2xl leading-tight sm:text-3xl">
              {currentLesson.title}
            </h1>
            <p className="mt-8 text-5xl font-semibold tracking-tight sm:mt-10 sm:text-6xl">
              {currentLesson.estimatedMinutes} min
            </p>
            <h2 id="focus-title" className="mt-7 text-lg sm:mt-8">Focus</h2>
            <ul className="mt-4 space-y-2.5 text-xl leading-7 sm:text-2xl">
              {currentLesson.focusHighlights.slice(0, 3).map((highlight) => (
                <li key={highlight} className="flex gap-3">
                  <span aria-hidden="true" className="text-[var(--awake-accent)]">•</span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mx-auto max-w-2xl border-t border-[var(--awake-border)] py-5" aria-label="Journey details">
          <p className="text-sm leading-6 text-[var(--awake-text-secondary)]">
            {journey.stageTitle} · {currentSection?.title} · {journey.sessionsPerWeek} sessions weekly
          </p>
          <p className="mt-1 text-xs text-[var(--awake-text-muted)]">
            {journey.suggestedDays.join(" · ")} · {journey.estimatedDuration} · Began {createdDate}
          </p>
        </section>

        <div className="mx-auto mt-10 max-w-2xl sm:mt-14">
          <section aria-labelledby="path-title">
            <h2 id="path-title">Curriculum outline</h2>
            <ol className="mt-5 divide-y divide-[var(--awake-border)] border-y border-[var(--awake-border)]">
              {curriculum.map((section, index) => {
                const isOpen = openSectionId === section.id;
                return (
                  <li key={section.id}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`curriculum-${section.id}`}
                      onClick={() => setExpandedSectionId(isOpen ? null : section.id)}
                      className="flex min-h-14 w-full items-center gap-3 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--awake-accent)]"
                    >
                      <span className="w-6 shrink-0 text-sm font-semibold text-[var(--awake-accent)]">
                        {index + 1}
                      </span>
                      <span className="flex-1 font-medium">
                        {section.title.replace(" and ", " & ")}
                      </span>
                      <span aria-hidden="true" className="text-lg text-[var(--awake-text-muted)]">
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>
                    {isOpen && (
                      <ol
                        id={`curriculum-${section.id}`}
                        className="space-y-3 pb-5 pl-9 text-sm text-[var(--awake-text-secondary)]"
                      >
                        {section.lessons.map((lesson) => {
                          const isCurrent = lesson.id === currentLesson?.id;
                          return (
                            <li
                              key={lesson.id}
                              className={isCurrent ? "font-semibold text-[var(--awake-text)]" : undefined}
                            >
                              {lesson.title}
                              {isCurrent && (
                                <span className="ml-2 text-xs font-normal text-[var(--awake-accent)]">
                                  Current
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ol>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        </div>

        <footer className="mx-auto mt-12 flex max-w-2xl flex-col items-center gap-3 pt-4 sm:mt-16">
          <button
            type="button"
            disabled
            aria-describedby="practice-status"
            className="awake-button awake-button-primary min-h-12 w-full cursor-not-allowed opacity-60 sm:w-auto sm:min-w-48"
          >
            Begin Practice
          </button>
          <p id="practice-status" className="text-xs text-[var(--awake-text-muted)]">
            Coming next
          </p>
          <Link href="/world" className="awake-button awake-button-quiet mt-2">Return to your world</Link>
        </footer>
      </div>
    </main>
  );
}
