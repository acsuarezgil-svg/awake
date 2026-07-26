"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
} from "react";

import {
  createAwakeFocusArea,
  type AwakeFocusArea,
  type AwakeSystem,
} from "../systems";
import {
  loadAwakeSystems,
  saveAwakeSystems,
} from "../systemStorage";
import { getSystemTemplates } from "../systemTemplates";
import PracticeSpace from "./practice/PracticeSpace";

type Filter = "today" | "week" | "month" | "year";

type ActionEvent = {
  systemId: string;
  focusAreaId: string;
  createdAt: string;
};

const filters: Array<{ id: Filter; label: string; days: number }> = [
  { id: "today", label: "Today", days: 1 },
  { id: "week", label: "7 Days", days: 7 },
  { id: "month", label: "Month", days: 31 },
  { id: "year", label: "Year", days: 365 },
];

function parseEvents(): ActionEvent[] {
  try {
    const value = localStorage.getItem("awake-focus-area-action-events");
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function relativeDate(value?: string) {
  if (!value) return "Not reviewed yet";
  const date = new Date(value);
  const days = Math.round((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) return "Updated today";
  if (days === 1) return "Updated yesterday";
  return `Updated ${days} days ago`;
}

function usefulStatus(
  focusArea: AwakeFocusArea,
  now: number,
  showRecent: boolean,
) {
  if (focusArea.status === "paused") return "Paused";

  const currentCommitment = (focusArea.commitments ?? []).find(
    (item) => item.id === focusArea.currentCommitmentId,
  );

  if (currentCommitment?.status === "active") {
    const days = Math.ceil(
      (new Date(currentCommitment.reviewDate).getTime() - now) /
        86_400_000,
    );
    if (days >= 0 && days <= 7) {
      return days === 0 ? "Review today" : `Review in ${days} days`;
    }
  }

  if (focusArea.lastReviewedAt) {
    const days = Math.round(
      (now - new Date(focusArea.lastReviewedAt).getTime()) /
        86_400_000,
    );
    if (days <= 1) return days <= 0 ? "Reviewed today" : "Reviewed yesterday";
  }

  if (
    (focusArea.commitments?.length ?? 0) === 0 &&
    focusArea.careActions === undefined
  ) {
    return "New";
  }

  if (showRecent && relativeDate(focusArea.lastUpdatedAt) === "Updated today") {
    return "Updated today";
  }

  return null;
}

function activityDates(
  focusArea: AwakeFocusArea,
  events: ActionEvent[],
) {
  return [
    focusArea.createdAt,
    focusArea.lastUpdatedAt,
    focusArea.lastReviewedAt,
    ...(focusArea.commitments ?? []).flatMap((item) => [
      item.createdAt,
      item.updatedAt,
    ]),
    ...(focusArea.reviews ?? []).map((item) => item.reviewedAt),
    ...events
      .filter((event) => event.focusAreaId === focusArea.id)
      .map((event) => event.createdAt),
  ].filter((value): value is string => Boolean(value));
}

function maturity(focusArea: AwakeFocusArea, events: ActionEvent[]) {
  let level = 1;
  if (focusArea.careActions !== undefined) level += 1;
  if ((focusArea.commitments?.length ?? 0) > 0) level += 1;
  if ((focusArea.reviews?.length ?? 0) > 0) level += 1;
  if (events.some((event) => event.focusAreaId === focusArea.id)) level += 1;
  if (focusArea.isMySystem) level += 1;
  return Math.min(level, 6);
}

export default function SystemsOverview() {
  const [systems, setSystems] = useState<AwakeSystem[]>([]);
  const [events, setEvents] = useState<ActionEvent[]>([]);
  const [filter, setFilter] = useState<Filter>("week");
  const [loaded, setLoaded] = useState(false);
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [holding, setHolding] = useState(false);
  const [lens, setLens] = useState(42);
  const [loadedAt] = useState(() => Date.now());
  const holdTimer = useRef<number | null>(null);
  const holdStart = useRef<{ x: number; y: number } | null>(
    null,
  );

  useEffect(() => {
    const stored = loadAwakeSystems();
    let changed = false;
    const initialized = stored.map((system) => {
      if (system.focusAreasInitialized) return system;
      const templates = getSystemTemplates(system.title);
      if (templates.length === 0) return system;
      changed = true;
      return {
        ...system,
        focusAreas:
          system.focusAreas.length > 0
            ? system.focusAreas
            : templates.map(createAwakeFocusArea),
        focusAreasInitialized: true,
      };
    });
    if (changed) saveAwakeSystems(initialized);
    // Hydrate the client-only local system store after mounting.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSystems(initialized);
    setEvents(parseEvents());
    setLoaded(true);
  }, []);

  const visibleSystems = useMemo(
    () =>
      systems.flatMap((parent) =>
        parent.focusAreas.map((focusArea) => ({
          parent,
          focusArea,
        })),
      ),
    [systems],
  );

  const selectedDays =
    filters.find((item) => item.id === filter)?.days ?? 7;
  const cutoff = loadedAt - selectedDays * 86_400_000;

  function beginHold(event: ReactPointerEvent<HTMLButtonElement>) {
    holdStart.current = {
      x: event.clientX,
      y: event.clientY,
    };
    setHolding(true);
    holdTimer.current = window.setTimeout(() => {
      setHolding(false);
      setPracticeOpen(true);
      if ("vibrate" in navigator) navigator.vibrate(35);
    }, 750);
  }

  function cancelHold() {
    setHolding(false);
    holdStart.current = null;
    if (holdTimer.current !== null) {
      window.clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }

  function trackHold(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!holding || !holdStart.current) return;

    const distance = Math.hypot(
      event.clientX - holdStart.current.x,
      event.clientY - holdStart.current.y,
    );

    if (distance > 10) cancelHold();
  }

  if (!loaded) return null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_50%_18%,#fffdf6_0%,#f4f3ee_44%,#eef2ed_100%)] px-4 pb-28 pt-8 text-stone-800 sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        <header className="flex items-end justify-between gap-5">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-stone-400">
              Awake
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Your systems
            </h1>
          </div>
          <Link
            href="/systems"
            className="rounded-full bg-stone-900 px-4 py-2.5 text-sm font-medium text-white"
          >
            Add system
          </Link>
        </header>

        <p className="mt-3 max-w-md text-sm leading-6 text-stone-500">
          Build systems that support your life. Make them yours. Let them
          change when life changes.
        </p>

        <div className="mt-7 flex gap-2 overflow-x-auto pb-1">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`min-h-10 shrink-0 rounded-full px-4 text-sm transition ${
                filter === item.id
                  ? "bg-stone-800 text-white"
                  : "bg-white text-stone-500"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <section
          aria-labelledby="systems-lens-label"
          className="mt-7 rounded-3xl bg-white/35 px-4 py-4 backdrop-blur-sm"
        >
          <div
            id="systems-lens-label"
            className="flex items-center justify-between gap-4 text-xs font-medium text-stone-500"
          >
            <span>Life cycle</span>
            <span>Recent activity</span>
          </div>
          <input
            aria-labelledby="systems-lens-label"
            type="range"
            min="0"
            max="100"
            value={lens}
            onChange={(event) => setLens(Number(event.target.value))}
            className="awake-lens-slider mt-3 w-full accent-stone-600"
          />
        </section>

        <section className="relative mt-7">
          <div className="flex justify-center py-6">
            <button
              type="button"
              onPointerDown={beginHold}
              onPointerMove={trackHold}
              onPointerUp={cancelHold}
              onPointerLeave={cancelHold}
              onPointerCancel={cancelHold}
              className={`awake-center-orb relative flex h-28 w-28 select-none items-center justify-center rounded-full outline-none transition-transform duration-200 [touch-action:pan-y] focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-4 ${
                holding ? "scale-95" : "scale-100"
              }`}
              aria-label="Hold for breathing and rhythm"
            >
              <span className="relative z-10 text-center text-xs font-medium leading-5 text-stone-600/80">
                Hold to breathe
              </span>
              <span
                className={`awake-hold-progress pointer-events-none absolute inset-[-9px] rounded-full ${
                  holding ? "is-holding" : ""
                }`}
              />
            </button>
          </div>

          {visibleSystems.length === 0 ? (
            <div className="mt-5 rounded-3xl bg-white p-6 text-center shadow-sm">
              <h2 className="text-lg font-medium">Build your first system</h2>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                Choose a starting point, then shape the Care actions around
                your life.
              </p>
              <Link
                href="/systems"
                className="mt-5 inline-flex min-h-11 items-center rounded-full bg-stone-900 px-5 text-sm font-medium text-white"
              >
                Choose a system
              </Link>
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-5 min-[360px]:gap-x-4 sm:grid-cols-3 sm:gap-x-8 sm:gap-y-4">
              {visibleSystems.map(({ parent, focusArea }, index) => {
                const level = maturity(focusArea, events);
                const dates = activityDates(focusArea, events);
                const active = dates.some(
                  (value) => new Date(value).getTime() >= cutoff,
                );
                const paused = focusArea.status === "paused";
                const hasLifecycleData =
                  level > 1 ||
                  (focusArea.commitments?.length ?? 0) > 0 ||
                  (focusArea.reviews?.length ?? 0) > 0;
                const color = hasLifecycleData
                  ? focusArea.color ?? "#7c9a82"
                  : "#d8bd75";
                const activityLens = lens / 100;
                const lifecycleLens = 1 - activityLens;
                const depth =
                  (level / 6) * (0.78 + lifecycleLens * 0.5);
                const activityStrength =
                  paused || !active
                    ? 0
                    : 0.12 + activityLens * 0.72;
                const orbOpacity = paused
                  ? 0.54
                  : active
                    ? 0.88 + activityLens * 0.12
                    : 0.76 - activityLens * 0.3;
                const status = usefulStatus(
                  focusArea,
                  loadedAt,
                  activityLens > 0.55,
                );
                return (
                  <Link
                    key={focusArea.id}
                    href={`/systems/${parent.id}/${focusArea.id}`}
                    aria-label={`Open ${focusArea.title} system${
                      focusArea.isMySystem
                        ? ", marked as this is my system"
                        : ""
                    }${paused ? ", paused" : ""}`}
                    className="group flex min-h-44 flex-col items-center justify-start rounded-[2.5rem] px-2 py-4 text-center outline-none transition-transform duration-300 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-4"
                    style={{
                      paddingTop:
                        16 +
                        [0, 18, 7, 25, 11, 20][index % 6],
                    }}
                  >
                    <span
                      className={`system-orb relative flex items-center justify-center rounded-full ${
                        active && !paused ? "is-active" : ""
                      } ${paused ? "is-paused" : ""} ${
                        !hasLifecycleData ? "is-new" : ""
                      }`}
                      style={
                        {
                          "--orb-color": color,
                          "--orb-size": `${72 + level * 5}px`,
                          "--orb-depth": depth,
                          "--orb-glow": activityStrength,
                          "--orb-glow-soft":
                            activityStrength * 0.55,
                          "--orb-glow-mix": `${
                            activityStrength * 58
                          }%`,
                          "--orb-light-mix": `${
                            44 + depth * 25
                          }%`,
                          "--orb-core-mix": `${
                            64 + depth * 22
                          }%`,
                          "--orb-lower-mix": `${
                            32 + depth * 24
                          }%`,
                          "--orb-opacity": orbOpacity,
                          "--orb-delay": `${-(index % 7) * 0.83}s`,
                        } as CSSProperties
                      }
                    >
                      {focusArea.isMySystem && (
                        <span
                          aria-label="This is my system"
                          className="sr-only"
                        >
                          ★
                        </span>
                      )}
                    </span>
                    <span className="mt-4 flex items-center justify-center gap-1.5 text-sm font-medium text-stone-700">
                      {focusArea.title}
                      {focusArea.isMySystem && (
                        <span
                          role="img"
                          aria-label="This is my system"
                          className="text-xs text-amber-600"
                        >
                          ★
                        </span>
                      )}
                    </span>
                    {status && (
                      <span className="mt-1 text-xs text-stone-400">
                        {status}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <nav className="fixed inset-x-0 bottom-0 border-t border-stone-200 bg-[#f7f6f2]/95 px-5 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-around text-sm">
          <span className="font-medium text-stone-900">Systems</span>
          <Link href="/privacy" className="min-h-11 px-3 py-3 text-stone-500">
            Privacy
          </Link>
          <Link href="/about" className="min-h-11 px-3 py-3 text-stone-500">
            About
          </Link>
        </div>
      </nav>

      {practiceOpen && (
        <PracticeSpace
          primaryColor="rgb(124, 154, 130)"
          secondaryColor="rgb(139, 134, 168)"
          pageBackground="#f7f6f2"
          isDark={false}
          onFinish={() => setPracticeOpen(false)}
        />
      )}

      <style jsx>{`
        .system-orb {
          width: var(--orb-size);
          height: var(--orb-size);
          opacity: var(--orb-opacity);
          background:
            radial-gradient(
              circle at 31% 24%,
              rgba(255, 255, 255, 0.92) 0%,
              rgba(255, 255, 255, 0.38) 12%,
              transparent 31%
            ),
            radial-gradient(
              circle at 68% 72%,
              color-mix(
                  in srgb,
                  var(--orb-color)
                    var(--orb-lower-mix),
                  transparent
                )
                0%,
              transparent 58%
            ),
            linear-gradient(
              145deg,
              color-mix(
                  in srgb,
                  var(--orb-color)
                    var(--orb-light-mix),
                  white
                )
                0%,
              color-mix(
                  in srgb,
                  var(--orb-color)
                    var(--orb-core-mix),
                  transparent
                )
                54%,
              color-mix(
                  in srgb,
                  var(--orb-color) 76%,
                  #3f4a43
                )
                100%
            );
          box-shadow:
            inset -9px -12px 18px
              color-mix(in srgb, var(--orb-color) 38%, transparent),
            inset 7px 8px 15px rgba(255, 255, 255, 0.45),
            0 12px 25px rgba(75, 72, 61, 0.12);
          transform: translateZ(0);
          transition:
            width 500ms ease,
            height 500ms ease,
            opacity 500ms ease,
            filter 500ms ease,
            box-shadow 500ms ease;
        }

        .system-orb::before {
          position: absolute;
          inset: 11%;
          content: "";
          border-radius: inherit;
          border: 1px solid rgba(255, 255, 255, 0.34);
          background:
            radial-gradient(
              circle at 55% 46%,
              transparent 15%,
              rgba(255, 255, 255, 0.12) 58%,
              transparent 76%
            );
          transform: rotate(-12deg);
          animation: orb-drift 11s ease-in-out infinite;
          animation-delay: var(--orb-delay);
        }

        .system-orb::after {
          position: absolute;
          inset: -22%;
          z-index: -1;
          content: "";
          border-radius: inherit;
          background: radial-gradient(
            circle,
            color-mix(
                in srgb,
                var(--orb-color)
                  var(--orb-glow-mix),
                transparent
              )
              0%,
            transparent 68%
          );
          opacity: var(--orb-glow);
          animation: orb-aura 7.5s ease-in-out infinite;
          animation-delay: var(--orb-delay);
        }

        .system-orb.is-new {
          filter: saturate(0.72);
          box-shadow:
            inset -7px -9px 15px rgba(168, 137, 67, 0.14),
            inset 6px 7px 13px rgba(255, 255, 255, 0.55),
            0 10px 20px rgba(137, 113, 56, 0.08);
        }

        .system-orb.is-active {
          filter: saturate(1.06) brightness(1.03);
        }

        .system-orb.is-paused {
          filter: saturate(0.58);
        }

        .awake-center-orb {
          background:
            radial-gradient(
              circle at 32% 25%,
              rgba(255, 255, 255, 0.95),
              transparent 28%
            ),
            radial-gradient(
              circle at 66% 72%,
              rgba(116, 141, 126, 0.24),
              transparent 56%
            ),
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.82),
              rgba(208, 221, 211, 0.74) 52%,
              rgba(163, 183, 169, 0.72)
            );
          box-shadow:
            inset -12px -14px 22px rgba(96, 121, 105, 0.16),
            inset 8px 9px 17px rgba(255, 255, 255, 0.75),
            0 14px 30px rgba(80, 98, 86, 0.14),
            0 0 0 10px rgba(164, 184, 170, 0.08);
        }

        .awake-hold-progress {
          border: 2px solid rgba(105, 128, 113, 0.08);
          opacity: 0;
          transform: scale(0.82);
        }

        .awake-hold-progress.is-holding {
          animation: center-hold 750ms ease-out forwards;
        }

        @keyframes center-hold {
          from {
            border-color: rgba(105, 128, 113, 0.15);
            box-shadow: 0 0 0 0 rgba(119, 151, 130, 0.08);
            opacity: 0.35;
            transform: scale(0.82);
          }
          to {
            border-color: rgba(105, 128, 113, 0.58);
            box-shadow: 0 0 0 15px rgba(119, 151, 130, 0.14);
            opacity: 1;
            transform: scale(1.08);
          }
        }

        @keyframes orb-drift {
          0%,
          100% {
            transform: rotate(-12deg) translate3d(0, 0, 0);
          }
          50% {
            transform: rotate(-7deg) translate3d(2px, -2px, 0);
          }
        }

        @keyframes orb-aura {
          0%,
          100% {
            opacity: var(--orb-glow-soft);
            transform: scale(0.96);
          }
          50% {
            opacity: var(--orb-glow);
            transform: scale(1.06);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .system-orb,
          .system-orb::before,
          .system-orb::after,
          .awake-center-orb,
          .awake-hold-progress {
            animation: none !important;
            transition-duration: 0.01ms !important;
          }

          .awake-hold-progress.is-holding {
            border-color: rgba(105, 128, 113, 0.58);
            box-shadow: 0 0 0 10px rgba(119, 151, 130, 0.12);
            opacity: 1;
            transform: scale(1.04);
          }
        }
      `}</style>
    </main>
  );
}
