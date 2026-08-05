"use client";

import Link from "next/link";
import { useState } from "react";
import { pianoKnowledgePack } from "../../data/pianoKnowledgePack";
import type { LearningStageLevel } from "../../types/learning";

const stageLabels: Record<LearningStageLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export default function PianoLearningPage() {
  const [selectedLevel, setSelectedLevel] =
    useState<LearningStageLevel>("beginner");
  const stage = pianoKnowledgePack.stages.find(
    (item) => item.level === selectedLevel,
  ) ?? pianoKnowledgePack.stages[0];

  return (
    <main className="px-4 py-6 sm:px-6 sm:py-10 lg:px-10">
      <div className="mx-auto w-full max-w-4xl">
        <Link
          href="/world"
          className="text-sm text-[var(--awake-text-secondary)] transition-colors hover:text-[var(--awake-text)]"
        >
          ← Back to World
        </Link>

        <header className="max-w-2xl pb-8 pt-8 sm:pb-12 sm:pt-12">
          <p className="awake-eyebrow">Knowledge pack · {pianoKnowledgePack.subject}</p>
          <h1 className="mt-3 text-[length:var(--awake-type-display)]">
            {pianoKnowledgePack.title}
          </h1>
          <p className="mt-5 text-base leading-7 text-[var(--awake-text-secondary)] sm:text-lg sm:leading-8">
            {pianoKnowledgePack.description}
          </p>
        </header>

        <nav aria-label="Learning stage" className="border-b border-[var(--awake-border)]">
          <div className="flex gap-1 overflow-x-auto">
            {pianoKnowledgePack.stages.map((item) => {
              const selected = item.level === selectedLevel;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setSelectedLevel(item.level)}
                  className={`min-h-12 shrink-0 border-b-2 px-3 py-3 text-sm font-medium transition-colors sm:px-5 ${
                    selected
                      ? "border-[var(--awake-accent)] text-[var(--awake-accent)]"
                      : "border-transparent text-[var(--awake-text-muted)] hover:text-[var(--awake-text)]"
                  }`}
                >
                  {stageLabels[item.level]}
                </button>
              );
            })}
          </div>
        </nav>

        <article className="py-8 sm:py-12">
          <div className="max-w-2xl">
            <p className="awake-eyebrow">{stage.estimatedDuration}</p>
            <h2 className="mt-2 text-2xl sm:text-3xl">{stage.title}</h2>
            <p className="mt-4 leading-7 text-[var(--awake-text-secondary)]">{stage.description}</p>
          </div>

          <section className="mt-8 border-y border-[var(--awake-border)] py-6" aria-labelledby="schedule-title">
            <h3 id="schedule-title" className="awake-eyebrow">Suggested rhythm</h3>
            <p className="mt-3 text-lg text-[var(--awake-text)]">
              {stage.recommendedSessionsPerWeek} sessions each week · {stage.recommendedMinutesPerSession} minutes each
            </p>
            <p className="mt-2 text-sm text-[var(--awake-text-secondary)]">
              {stage.suggestedDays.join(" · ")}
            </p>
          </section>

          <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,0.62fr)] lg:gap-16">
            <div className="space-y-12">
              <section aria-labelledby="outcomes-title">
                <h2 id="outcomes-title">What you’ll build</h2>
                <ul className="mt-5 space-y-3">
                  {stage.outcomes.map((outcome) => (
                    <li key={outcome} className="flex gap-3 text-[var(--awake-text-secondary)]">
                      <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--awake-accent)]" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section aria-labelledby="path-title">
                <h2 id="path-title">Learning path</h2>
                <ol className="mt-6 space-y-7">
                  {stage.learningPath.map((module, index) => (
                    <li key={module.id} className="grid grid-cols-[2rem_1fr] gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--awake-accent-soft)] text-sm font-semibold text-[var(--awake-accent)]">
                        {index + 1}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                          <h3>{module.title}</h3>
                          <span className="text-xs text-[var(--awake-text-muted)]">About {module.estimatedMinutes} min</span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-[var(--awake-text-secondary)]">{module.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            </div>

            <div className="space-y-12">
              <section aria-labelledby="practice-title">
                <h2 id="practice-title">Practice session</h2>
                <ol className="mt-5 divide-y divide-[var(--awake-border)] border-y border-[var(--awake-border)]">
                  {stage.practiceTemplate.map((block) => (
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

              <section aria-labelledby="readiness-title">
                <h2 id="readiness-title">Ready to move on when…</h2>
                <ul className="mt-5 space-y-4">
                  {stage.readinessChecks.map((check) => (
                    <li key={check} className="flex gap-3 text-sm leading-6 text-[var(--awake-text-secondary)]">
                      <span aria-hidden="true" className="mt-0.5 text-[var(--awake-accent)]">○</span>
                      <span>{check}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section aria-labelledby="adjustments-title">
                <h2 id="adjustments-title">Simple adjustments</h2>
                <div className="mt-5 space-y-5">
                  {stage.modifications.map((modification) => (
                    <div key={modification.id}>
                      <h3>{modification.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-[var(--awake-text-secondary)]">{modification.description}</p>
                      <p className="mt-1 text-xs text-[var(--awake-text-muted)]">
                        {modification.sessionsPerWeek ?? stage.recommendedSessionsPerWeek} sessions · {modification.minutesPerSession ?? stage.recommendedMinutesPerSession} minutes
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <footer className="mt-14 border-t border-[var(--awake-border)] pt-8 text-center sm:mt-20">
            <Link
              href={`/learn/piano/setup?stage=${stage.level}`}
              className="awake-button awake-button-primary"
            >
              Use this plan
            </Link>
            <p className="mt-3 text-xs text-[var(--awake-text-muted)]">Shape it around your week before you begin.</p>
          </footer>
        </article>
      </div>
    </main>
  );
}
