"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
} from "react";

import {
  colorToHue,
  defaultColorPreferences,
  generateAwakePalette,
  generateSystemOrbPalette,
  loadColorPreferences,
  saveColorPreferences,
  type AwakeColorPreferences,
} from "../colorPalette";
import {
  getFoundationLabel,
  getFoundationSummary,
  getSystemStatus,
} from "../systemStatus";
import {
  createAwakeFocusArea,
  type AwakeSystem,
} from "../systems";
import {
  loadAwakeSystems,
  saveAwakeSystems,
} from "../systemStorage";
import { getSystemTemplates } from "../systemTemplates";
import AwakeColorPicker from "./AwakeColorPicker";
import PracticeSpace from "./practice/PracticeSpace";

type View = "foundations" | "mine" | "active" | "review";

const views: Array<{ id: View; label: string }> = [
  { id: "foundations", label: "Foundations" },
  { id: "mine", label: "★ Mine" },
  { id: "active", label: "Active" },
  { id: "review", label: "Review" },
];

const emptyMessages: Record<Exclude<View, "foundations">, string> = {
  mine: "No systems are marked as yours yet.",
  active: "No systems are being tried right now.",
  review: "Nothing needs review right now.",
};

export default function SystemsOverview() {
  const [foundations, setFoundations] = useState<AwakeSystem[]>([]);
  const [view, setView] = useState<View>("foundations");
  const [loaded, setLoaded] = useState(false);
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [colorPreferences, setColorPreferences] =
    useState<AwakeColorPreferences>(defaultColorPreferences);
  const [holding, setHolding] = useState(false);
  const holdTimer = useRef<number | null>(null);
  const holdStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const stored = loadAwakeSystems();
    let changed = false;
    const initialized = stored.map((foundation) => {
      if (foundation.focusAreasInitialized) return foundation;
      const templates = getSystemTemplates(foundation.title);
      if (templates.length === 0) return foundation;
      changed = true;
      return {
        ...foundation,
        focusAreas:
          foundation.focusAreas.length > 0
            ? foundation.focusAreas
            : templates.map(createAwakeFocusArea),
        focusAreasInitialized: true,
      };
    });
    if (changed) saveAwakeSystems(initialized);
    // Hydrate the client-only local system store after mounting.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFoundations(initialized);
    setColorPreferences(loadColorPreferences());
    setLoaded(true);
  }, []);

  const palette = generateAwakePalette(
    colorPreferences.anchorHue,
    colorPreferences.harmony,
    colorPreferences.appearance,
  );

  const individualSystems = useMemo(
    () =>
      foundations.flatMap((foundation) =>
        foundation.focusAreas.map((focusArea) => ({
          foundation,
          focusArea,
          status: getSystemStatus(focusArea),
        })),
      ),
    [foundations],
  );

  const visibleSystems = individualSystems.filter(({ status }) => {
    if (view === "mine") return status.isMine;
    if (view === "active") return status.activeCommitment;
    if (view === "review") return status.reviewDue;
    return false;
  });

  function updateColorPreferences(next: AwakeColorPreferences) {
    setColorPreferences(next);
    saveColorPreferences(next);
  }

  function beginHold(event: ReactPointerEvent<HTMLButtonElement>) {
    holdStart.current = { x: event.clientX, y: event.clientY };
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
    if (
      Math.hypot(
        event.clientX - holdStart.current.x,
        event.clientY - holdStart.current.y,
      ) > 10
    ) {
      cancelHold();
    }
  }

  if (!loaded) return null;

  if (practiceOpen) {
    return (
      <PracticeSpace
        primaryColor={palette.primaryAccent}
        secondaryColor={palette.companion}
        pageBackground={palette.pageBackground}
        isDark={colorPreferences.appearance === "dark"}
        onFinish={() => setPracticeOpen(false)}
      />
    );
  }

  return (
    <main
      className="awake-page min-h-screen px-4 pb-28 pt-8 transition-colors sm:px-6"
      style={{
        color: palette.text,
        background: `radial-gradient(circle at 50% 18%, ${palette.pageTint} 0%, ${palette.pageBackground} 48%, ${palette.mutedSurface} 100%)`,
      }}
    >
      <div className="mx-auto w-full max-w-3xl">
        <header className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p
              className="text-xs uppercase tracking-[0.22em]"
              style={{ color: palette.secondaryText }}
            >
              Awake
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Your Foundations
            </h1>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <button
              type="button"
              onClick={() => setAppearanceOpen((open) => !open)}
              className="min-h-11 flex-1 rounded-full border px-3 text-sm sm:flex-none"
              style={{
                borderColor: palette.border,
                background: palette.mutedSurface,
                color: palette.secondaryText,
              }}
              aria-expanded={appearanceOpen}
            >
              Appearance
            </button>
            <Link
              href="/systems"
              className="flex min-h-11 flex-1 items-center justify-center rounded-full px-4 text-sm font-medium sm:flex-none"
              style={{
                background: palette.primaryAccent,
                color: palette.buttonText,
              }}
            >
              Add system
            </Link>
          </div>
        </header>

        <p
          className="mt-3 max-w-md text-sm leading-6"
          style={{ color: palette.secondaryText }}
        >
          Build systems that support your life. Make them yours. Let them
          change when life changes.
        </p>

        {appearanceOpen && (
          <section
            className="mt-6 rounded-3xl border p-5 shadow-sm"
            style={{
              background: palette.mutedSurface,
              borderColor: palette.border,
            }}
            aria-label="Awake appearance"
          >
            <h2 className="text-lg font-semibold">Awake appearance</h2>
            <p
              className="mb-5 mt-1 text-sm"
              style={{ color: palette.secondaryText }}
            >
              Choose one anchor color. Awake coordinates the rest.
            </p>
            <AwakeColorPicker
              hue={colorPreferences.anchorHue}
              harmony={colorPreferences.harmony}
              appearance={colorPreferences.appearance}
              onHueChange={(anchorHue) =>
                updateColorPreferences({
                  ...colorPreferences,
                  anchorHue,
                })
              }
              onHarmonyChange={(harmony) =>
                updateColorPreferences({ ...colorPreferences, harmony })
              }
              onAppearanceChange={(appearance) =>
                updateColorPreferences({ ...colorPreferences, appearance })
              }
              orbMaterial={colorPreferences.orbMaterial}
              onOrbMaterialChange={(orbMaterial) =>
                updateColorPreferences({
                  ...colorPreferences,
                  orbMaterial,
                })
              }
            />
          </section>
        )}

        <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
          {views.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setView(option.id)}
              className="awake-chip min-h-10 shrink-0 rounded-full px-4 text-sm transition"
              style={{
                background:
                  view === option.id
                    ? palette.primaryAccent
                    : palette.mutedSurface,
                color:
                  view === option.id
                    ? palette.buttonText
                    : palette.secondaryText,
              }}
              aria-pressed={view === option.id}
            >
              {option.label}
            </button>
          ))}
        </div>

        <section className="relative mt-7">
          <div className="flex flex-col items-center justify-center py-5">
            <button
              type="button"
              onPointerDown={beginHold}
              onPointerMove={trackHold}
              onPointerUp={cancelHold}
              onPointerLeave={cancelHold}
              onPointerCancel={cancelHold}
              className={`awake-center-orb relative flex h-28 w-28 select-none items-center justify-center rounded-full outline-none transition-transform duration-200 [touch-action:pan-y] focus-visible:ring-2 focus-visible:ring-offset-4 ${
                holding ? "scale-95" : "scale-100"
              }`}
              style={{ color: palette.secondaryText }}
              aria-label="Hold for breathing and rhythm"
            >
              <span
                className={`awake-hold-progress pointer-events-none absolute inset-[-9px] rounded-full ${
                  holding ? "is-holding" : ""
                }`}
              />
            </button>
            <span
              className="mt-3 rounded-full px-3 py-1 text-xs font-medium"
              style={{
                color: palette.secondaryText,
                background: `color-mix(in srgb, ${palette.mutedSurface} 72%, transparent)`,
              }}
            >
              Hold to breathe
            </span>
          </div>

          {view === "foundations" ? (
            foundations.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3">
                {foundations.map((foundation, index) => {
                  const summary = getFoundationSummary(foundation);
                  const hue =
                    foundation.focusAreas[0]?.colorHue ??
                    colorToHue(foundation.focusAreas[0]?.color) ??
                    colorPreferences.anchorHue;
                  const orb = generateSystemOrbPalette(
                    hue,
                    colorPreferences.harmony,
                    colorPreferences.appearance,
                  );
                  const review = summary.hasReviewDue;
                  const active = summary.activeCount > 0;
                  const quiet =
                    summary.totalSystems === 0 ||
                    summary.pausedCount === summary.totalSystems;
                  const size = Math.min(
                    108,
                    78 + summary.totalSystems * 4,
                  );
                  return (
                    <Link
                      key={foundation.id}
                      href={`/systems/${foundation.id}`}
                      className="group flex min-h-44 flex-col items-center justify-start rounded-[2.5rem] px-2 py-4 text-center outline-none transition-transform hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-offset-4"
                      style={{
                        paddingTop: 16 + [0, 12, 5, 16][index % 4],
                        color: palette.text,
                      }}
                    >
                      <span
                        className={`system-orb relative rounded-full ${
                          review || active ? "is-active" : ""
                        } ${quiet ? "is-quiet" : ""}`}
                        style={
                          {
                            "--orb-color": review
                              ? palette.inactiveAmber
                              : orb.main,
                            "--orb-highlight": orb.highlight,
                            "--orb-glow-color": review
                              ? palette.inactiveAmber
                              : orb.glow,
                            "--orb-quiet": orb.quiet,
                            "--orb-paused": orb.paused,
                            "--orb-size": `${size}px`,
                            "--orb-opacity": quiet ? 0.6 : 0.9,
                            "--orb-glow": review ? 0.75 : active ? 0.58 : 0.18,
                            "--orb-delay": `${-(index % 7) * 0.83}s`,
                          } as CSSProperties
                        }
                      />
                      <span className="mt-4 text-sm font-medium">
                        {foundation.title}
                      </span>
                      <span
                        className="mt-1 text-xs"
                        style={{ color: palette.secondaryText }}
                      >
                        {getFoundationLabel(summary)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <EmptyFoundation palette={palette} />
            )
          ) : visibleSystems.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
              {visibleSystems.map(
                ({ foundation, focusArea, status }, index) => {
                  const orb = generateSystemOrbPalette(
                    focusArea.colorHue ?? colorToHue(focusArea.color),
                    colorPreferences.harmony,
                    colorPreferences.appearance,
                  );
                  return (
                    <Link
                      key={focusArea.id}
                      href={`/systems/${foundation.id}/${focusArea.id}`}
                      className="flex min-h-40 flex-col items-center rounded-[2.25rem] px-2 py-4 text-center outline-none transition-transform hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-offset-4"
                      style={{ color: palette.text }}
                    >
                      <span
                        className={`system-orb relative rounded-full ${
                          status.primary === "active" ||
                          status.primary === "review"
                            ? "is-active"
                            : ""
                        }`}
                        style={
                          {
                            "--orb-color": orb.main,
                            "--orb-highlight": orb.highlight,
                            "--orb-glow-color": orb.glow,
                            "--orb-quiet": orb.quiet,
                            "--orb-paused": orb.paused,
                            "--orb-size": "76px",
                            "--orb-opacity": 0.9,
                            "--orb-glow":
                              status.primary === "review" ? 0.72 : 0.48,
                            "--orb-delay": `${-(index % 7) * 0.83}s`,
                          } as CSSProperties
                        }
                      />
                      <span className="mt-3 text-sm font-medium">
                        {focusArea.title}
                        {status.isMine ? " ★" : ""}
                      </span>
                      <span
                        className="mt-1 text-xs"
                        style={{ color: palette.secondaryText }}
                      >
                        {foundation.title} · {status.label}
                      </span>
                    </Link>
                  );
                },
              )}
            </div>
          ) : (
            <p
              className="mt-8 text-center text-sm"
              style={{ color: palette.secondaryText }}
            >
              {emptyMessages[view]}
            </p>
          )}
        </section>
      </div>

      <nav
        className="awake-navigation fixed inset-x-0 bottom-0 border-t px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur"
        style={{
          borderColor: palette.border,
          background: `color-mix(in srgb, ${palette.mutedSurface} 94%, transparent)`,
        }}
      >
        <div className="mx-auto grid max-w-md grid-cols-3 items-center gap-2 text-center text-sm">
          <span
            aria-current="page"
            className="flex min-h-11 items-center justify-center rounded-full px-3 font-semibold"
            style={{
              background: palette.primaryAccent,
              color: palette.buttonText,
            }}
          >
            Systems
          </span>
          <Link
            href="/privacy"
            className="flex min-h-11 items-center justify-center rounded-full px-3"
            style={{ color: palette.secondaryText }}
          >
            Privacy
          </Link>
          <Link
            href="/about"
            className="flex min-h-11 items-center justify-center rounded-full px-3"
            style={{ color: palette.secondaryText }}
          >
            About
          </Link>
        </div>
      </nav>

      <style jsx>{`
        .system-orb {
          width: var(--orb-size);
          height: var(--orb-size);
          opacity: var(--orb-opacity);
          background:
            radial-gradient(
              circle at 31% 24%,
              rgba(255, 255, 255, 0.92),
              transparent 30%
            ),
            radial-gradient(
              circle at 68% 72%,
              color-mix(in srgb, var(--orb-glow-color) 35%, transparent),
              transparent 58%
            ),
            linear-gradient(
              145deg,
              color-mix(in srgb, var(--orb-highlight) 62%, white),
              var(--orb-color) 55%,
              color-mix(in srgb, var(--orb-quiet) 78%, var(--orb-paused))
            );
          box-shadow:
            inset -9px -12px 18px
              color-mix(in srgb, var(--orb-glow-color) 32%, transparent),
            inset 7px 8px 15px rgba(255, 255, 255, 0.42),
            0 12px 25px rgba(75, 72, 61, 0.1);
          transition:
            opacity 400ms ease,
            filter 400ms ease,
            transform 400ms ease;
        }

        .system-orb::after {
          position: absolute;
          inset: -22%;
          z-index: -1;
          content: "";
          border-radius: inherit;
          background: radial-gradient(
            circle,
            color-mix(in srgb, var(--orb-glow-color) 58%, transparent),
            transparent 68%
          );
          opacity: var(--orb-glow);
          animation: orb-aura 7.5s ease-in-out infinite;
          animation-delay: var(--orb-delay);
        }

        .system-orb.is-active {
          filter: saturate(1.04) brightness(1.03);
        }

        .system-orb.is-quiet {
          filter: saturate(0.7);
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
              color-mix(in srgb, ${palette.companion} 24%, transparent),
              transparent 56%
            ),
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.82),
              color-mix(in srgb, ${palette.orbHighlight} 74%, transparent) 52%,
              color-mix(in srgb, ${palette.primaryAccent} 72%, transparent)
            );
          box-shadow:
            inset -12px -14px 22px rgba(96, 121, 105, 0.16),
            inset 8px 9px 17px rgba(255, 255, 255, 0.75),
            0 14px 30px rgba(80, 98, 86, 0.14),
            0 0 0 10px color-mix(in srgb, ${palette.orbGlow} 8%, transparent);
        }

        .awake-center-orb::after {
          position: absolute;
          inset: -38%;
          z-index: -1;
          content: "";
          border-radius: inherit;
          background: radial-gradient(
            circle,
            color-mix(in srgb, ${palette.orbGlow} 24%, transparent),
            transparent 68%
          );
          opacity: 0.16;
          transition:
            opacity 650ms ease,
            transform 650ms ease;
        }

        .awake-center-orb:active::after {
          opacity: 0.42;
          transform: scale(1.08);
        }

        .awake-hold-progress {
          border: 2px solid color-mix(in srgb, ${palette.focus} 15%, transparent);
          opacity: 0;
          transform: scale(0.82);
        }

        .awake-hold-progress.is-holding {
          animation: center-hold 750ms ease-out forwards;
        }

        @keyframes center-hold {
          from {
            opacity: 0.35;
            transform: scale(0.82);
          }
          to {
            border-color: ${palette.focus};
            box-shadow: 0 0 0 15px
              color-mix(in srgb, ${palette.focus} 14%, transparent);
            opacity: 1;
            transform: scale(1.08);
          }
        }

        @keyframes orb-aura {
          0%,
          100% {
            opacity: calc(var(--orb-glow) * 0.55);
            transform: scale(0.96);
          }
          50% {
            opacity: var(--orb-glow);
            transform: scale(1.06);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .system-orb,
          .system-orb::after,
          .awake-center-orb,
          .awake-hold-progress {
            animation: none !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}

function EmptyFoundation({
  palette,
}: {
  palette: ReturnType<typeof generateAwakePalette>;
}) {
  return (
    <div
      className="awake-empty-state mt-6 rounded-3xl border p-6 text-center"
      style={{
        borderColor: palette.border,
        background: palette.mutedSurface,
      }}
    >
      <h2 className="text-lg font-medium">Build your first foundation</h2>
      <p
        className="mt-2 text-sm leading-6"
        style={{ color: palette.secondaryText }}
      >
        Choose a part of life, then shape a system around what supports you.
      </p>
      <Link
        href="/systems"
        className="mt-5 inline-flex min-h-11 items-center rounded-full px-5 text-sm font-medium"
        style={{
          background: palette.primaryAccent,
          color: palette.buttonText,
        }}
      >
        Choose a foundation
      </Link>
    </div>
  );
}
