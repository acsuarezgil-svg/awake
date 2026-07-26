"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
} from "react";

import {
  defaultColorPreferences,
  generateAwakePalette,
  generateSystemOrbPalette,
  getFoundationHue,
  loadColorPreferences,
  type AwakeColorPreferences,
} from "../../colorPalette";
import PracticeSpace from "../../components/practice/PracticeSpace";
import { getSystemStatus } from "../../systemStatus";
import {
  loadAwakeSystems,
  saveAwakeSystems,
} from "../../systemStorage";
import { getSystemTemplates } from "../../systemTemplates";
import {
  createAwakeFocusArea,
  type AwakeSystem,
} from "../../systems";

type FoundationView = "orbs" | "list";

const FOUNDATION_VIEW_KEY = "awake-foundation-view";

export default function FoundationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [foundation, setFoundation] =
    useState<AwakeSystem | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState<FoundationView>("orbs");
  const [showAdd, setShowAdd] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [holding, setHolding] = useState(false);
  const [preferences, setPreferences] =
    useState<AwakeColorPreferences>(defaultColorPreferences);
  const holdTimer = useRef<number | null>(null);
  const holdStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const stored = loadAwakeSystems();
    const selected =
      stored.find((item) => item.id === params.id) ?? null;
    let initialized = selected;

    if (selected && !selected.focusAreasInitialized) {
      initialized = {
        ...selected,
        focusAreas: getSystemTemplates(selected.title).map(
          createAwakeFocusArea,
        ),
        focusAreasInitialized: true,
        updatedAt: new Date().toISOString(),
      };
      saveAwakeSystems(
        stored.map((item) =>
          item.id === initialized?.id ? initialized : item,
        ),
      );
    }

    const savedView = localStorage.getItem(FOUNDATION_VIEW_KEY);
    // Hydrate client-owned preferences and systems after mounting.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFoundation(initialized);
    setPreferences(loadColorPreferences());
    setView(savedView === "list" ? "list" : "orbs");
    setLoaded(true);
  }, [params.id]);

  function selectView(nextView: FoundationView) {
    setView(nextView);
    localStorage.setItem(FOUNDATION_VIEW_KEY, nextView);
  }

  function addSystem(title: string) {
    const cleanTitle = title.trim();
    if (!foundation || !cleanTitle) return;
    if (
      foundation.focusAreas.some(
        (focusArea) =>
          focusArea.title.toLowerCase() === cleanTitle.toLowerCase(),
      )
    ) {
      return;
    }

    const focusArea = createAwakeFocusArea(cleanTitle);
    const nextFoundation = {
      ...foundation,
      focusAreas: [...foundation.focusAreas, focusArea],
      focusAreasInitialized: true,
      updatedAt: new Date().toISOString(),
    };
    saveAwakeSystems(
      loadAwakeSystems().map((item) =>
        item.id === nextFoundation.id ? nextFoundation : item,
      ),
    );
    setFoundation(nextFoundation);
    setCustomTitle("");
    setShowAdd(false);
    router.push(`/systems/${foundation.id}/${focusArea.id}`);
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

  if (!foundation) {
    return (
      <main className="awake-page min-h-screen px-5 py-8">
        <div className="mx-auto max-w-xl">
          <Link href="/" className="text-sm text-stone-500">
            ← Foundations
          </Link>
          <h1 className="mt-12 text-xl font-medium">
            Foundation not found
          </h1>
        </div>
      </main>
    );
  }

  const foundationHue = getFoundationHue(
    foundation.title,
    preferences.anchorHue,
  );
  const palette = generateAwakePalette(
    foundationHue,
    preferences.harmony,
    preferences.appearance,
  );
  const centerOrb = generateSystemOrbPalette(
    foundationHue,
    preferences.harmony,
    preferences.appearance,
  );
  const suggestions = getSystemTemplates(foundation.title).filter(
    (title) =>
      !foundation.focusAreas.some(
        (focusArea) =>
          focusArea.title.toLowerCase() === title.toLowerCase(),
      ),
  );

  return (
    <main
      className="awake-page min-h-screen px-5 py-8 transition-colors"
      style={{
        color: palette.text,
        background: `radial-gradient(circle at 50% 12%, ${palette.pageTint}, transparent 54%), ${palette.pageBackground}`,
      }}
    >
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="text-sm transition"
          style={{ color: palette.secondaryText }}
        >
          ← Foundations
        </Link>

        <header className="mt-8 text-center">
          <p
            className="text-xs font-medium uppercase tracking-[0.2em]"
            style={{ color: palette.secondaryText }}
          >
            Foundation
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {foundation.title}
          </h1>
          <p
            className="mt-2 text-sm"
            style={{ color: palette.secondaryText }}
          >
            Systems supporting this foundation
          </p>
        </header>

        <div
          className="mx-auto mt-6 grid w-fit grid-cols-2 rounded-full border p-1"
          style={{
            borderColor: palette.border,
            background: palette.mutedSurface,
          }}
          aria-label="Foundation view"
        >
          {(["orbs", "list"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => selectView(option)}
              className="awake-chip min-h-9 rounded-full px-4 text-sm capitalize"
              style={{
                background:
                  view === option
                    ? palette.primaryAccent
                    : "transparent",
                color:
                  view === option
                    ? palette.buttonText
                    : palette.secondaryText,
              }}
              aria-pressed={view === option}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center justify-center py-9">
          <button
            type="button"
            onPointerDown={beginHold}
            onPointerMove={trackHold}
            onPointerUp={cancelHold}
            onPointerLeave={cancelHold}
            onPointerCancel={cancelHold}
            className={`foundation-center-orb relative flex h-28 w-28 select-none items-center justify-center rounded-full outline-none transition-transform [touch-action:pan-y] ${
              holding ? "scale-95" : ""
            }`}
            style={
              {
                "--center-main": centerOrb.main,
                "--center-highlight": centerOrb.highlight,
                "--center-glow": centerOrb.glow,
                "--center-quiet": centerOrb.quiet,
              } as CSSProperties
            }
            aria-label="Hold for breathing and rhythm"
          >
            <span
              className={`hold-progress absolute inset-[-9px] rounded-full ${
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

        {foundation.focusAreas.length === 0 ? (
          <p
            className="awake-empty-state mx-auto max-w-sm rounded-3xl border border-dashed p-6 text-center text-sm"
            style={{
              borderColor: palette.border,
              background: palette.mutedSurface,
              color: palette.secondaryText,
            }}
          >
            No systems yet
          </p>
        ) : view === "orbs" ? (
          <section
            className="grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3 sm:gap-x-10"
            aria-label={`${foundation.title} systems`}
          >
            {foundation.focusAreas.map((focusArea, index) => {
              const status = getSystemStatus(focusArea);
              const orb = generateSystemOrbPalette(
                foundationHue + index * 12,
                preferences.harmony,
                preferences.appearance,
              );
              const quiet =
                status.primary === "quiet" ||
                status.primary === "new" ||
                status.primary === "paused";
              return (
                <Link
                  key={focusArea.id}
                  href={`/systems/${foundation.id}/${focusArea.id}`}
                  aria-label={`Open ${focusArea.title}. ${status.label}${
                    status.isMine ? ". This is my system" : ""
                  }`}
                  className="group flex min-h-44 flex-col items-center rounded-[2.5rem] px-2 py-3 text-center outline-none transition-transform hover:-translate-y-1"
                  style={{
                    paddingTop: 12 + [0, 16, 5, 20, 8, 14][index % 6],
                    color: palette.text,
                  }}
                >
                  <span
                    className={`foundation-system-orb relative rounded-full ${
                      status.primary === "active" ? "is-active" : ""
                    } ${
                      status.primary === "review" ? "is-review" : ""
                    } ${quiet ? "is-quiet" : ""}`}
                    style={
                      {
                        "--orb-main":
                          status.primary === "new"
                            ? orb.inactiveAmber
                            : orb.main,
                        "--orb-highlight": orb.highlight,
                        "--orb-glow": orb.glow,
                        "--orb-quiet": orb.quiet,
                        "--orb-paused": orb.paused,
                        "--orb-delay": `${-(index % 7) * 0.8}s`,
                      } as CSSProperties
                    }
                  >
                    {status.primary === "review" && (
                      <span
                        className="absolute right-0 top-1 h-3 w-3 rounded-full border-2"
                        style={{
                          borderColor: palette.mutedSurface,
                          background: palette.inactiveAmber,
                        }}
                        aria-hidden="true"
                      />
                    )}
                  </span>
                  <span className="mt-3 text-sm font-medium">
                    {focusArea.title}
                    {status.isMine ? " ★" : ""}
                  </span>
                  <span
                    className="mt-1 text-xs"
                    style={{ color: palette.secondaryText }}
                  >
                    {status.primary === "review"
                      ? "Review"
                      : status.label}
                  </span>
                </Link>
              );
            })}
          </section>
        ) : (
          <section
            className="space-y-3"
            aria-label={`${foundation.title} systems`}
          >
            {foundation.focusAreas.map((focusArea) => {
              const status = getSystemStatus(focusArea);
              return (
                <Link
                  key={focusArea.id}
                  href={`/systems/${foundation.id}/${focusArea.id}`}
                  aria-label={`Open ${focusArea.title}. ${status.label}${
                    status.isMine ? ". This is my system" : ""
                  }`}
                  className="awake-card flex min-h-20 items-center justify-between rounded-3xl border px-5 py-4 shadow-sm transition hover:-translate-y-0.5"
                  style={{
                    borderColor: palette.border,
                    background: palette.mutedSurface,
                    color: palette.text,
                  }}
                >
                  <div>
                    <h2 className="text-base font-medium">
                      {focusArea.title}
                      {status.isMine ? " ★" : ""}
                    </h2>
                    <p
                      className="mt-1 text-xs"
                      style={{ color: palette.secondaryText }}
                    >
                      {status.label}
                    </p>
                  </div>
                  <span aria-hidden="true">→</span>
                </Link>
              );
            })}
          </section>
        )}

        <section className="mt-8 text-center">
          {!showAdd ? (
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="min-h-11 rounded-full border px-5 text-sm font-medium"
              style={{
                borderColor: palette.border,
                background: palette.mutedSurface,
                color: palette.secondaryText,
              }}
            >
              Add system
            </button>
          ) : (
            <div
              className="mx-auto max-w-lg rounded-3xl border p-5 text-left shadow-sm"
              style={{
                borderColor: palette.border,
                background: palette.mutedSurface,
              }}
            >
              <p className="text-sm font-medium">
                Add to {foundation.title}
              </p>
              {suggestions.length > 0 && (
                <>
                  <p
                    className="mt-1 text-xs"
                    style={{ color: palette.secondaryText }}
                  >
                    Suggested systems
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {suggestions.map((title) => (
                      <button
                        key={title}
                        type="button"
                        onClick={() => addSystem(title)}
                        className="min-h-10 rounded-full px-4 text-sm"
                        style={{
                          background: palette.primaryAccent,
                          color: palette.buttonText,
                        }}
                      >
                        {title}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <label
                className="mt-5 block text-sm"
                style={{ color: palette.secondaryText }}
              >
                Create custom
                <input
                  value={customTitle}
                  onChange={(event) =>
                    setCustomTitle(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") addSystem(customTitle);
                  }}
                  className="mt-2 w-full border px-4"
                  placeholder="System name"
                />
              </label>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdd(false);
                    setCustomTitle("");
                  }}
                  className="min-h-11 px-4 text-sm"
                  style={{ color: palette.secondaryText }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!customTitle.trim()}
                  onClick={() => addSystem(customTitle)}
                  className="min-h-11 rounded-2xl px-5 text-sm font-medium disabled:opacity-35"
                  style={{
                    background: palette.primaryAccent,
                    color: palette.buttonText,
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {practiceOpen && (
        <PracticeSpace
          primaryColor={centerOrb.main}
          secondaryColor={centerOrb.glow}
          pageBackground={palette.pageBackground}
          isDark={preferences.appearance === "dark"}
          onFinish={() => setPracticeOpen(false)}
        />
      )}

      <style jsx>{`
        .foundation-center-orb {
          background:
            radial-gradient(
              circle at 32% 25%,
              rgba(255, 255, 255, 0.9),
              transparent 28%
            ),
            linear-gradient(
              145deg,
              var(--center-highlight),
              var(--center-main) 58%,
              var(--center-quiet)
            );
          box-shadow:
            inset -11px -13px 21px
              color-mix(in srgb, var(--center-main) 25%, transparent),
            inset 8px 9px 17px rgba(255, 255, 255, 0.55),
            0 14px 30px
              color-mix(in srgb, var(--center-glow) 18%, transparent);
        }

        .foundation-center-orb::after {
          position: absolute;
          inset: -38%;
          z-index: -1;
          content: "";
          border-radius: inherit;
          background: radial-gradient(
            circle,
            color-mix(in srgb, var(--center-glow) 24%, transparent),
            transparent 68%
          );
          opacity: 0.16;
          transition:
            opacity 650ms ease,
            transform 650ms ease;
        }

        .foundation-center-orb:active::after {
          opacity: 0.42;
          transform: scale(1.08);
        }

        .hold-progress {
          border: 2px solid
            color-mix(in srgb, var(--center-glow) 12%, transparent);
          opacity: 0;
          transform: scale(0.82);
        }

        .hold-progress.is-holding {
          animation: center-hold 750ms ease-out forwards;
        }

        .foundation-system-orb {
          width: 78px;
          height: 78px;
          background:
            radial-gradient(
              circle at 30% 24%,
              rgba(255, 255, 255, 0.88),
              transparent 29%
            ),
            radial-gradient(
              circle at 70% 72%,
              color-mix(in srgb, var(--orb-glow) 32%, transparent),
              transparent 57%
            ),
            linear-gradient(
              145deg,
              var(--orb-highlight),
              var(--orb-main) 58%,
              var(--orb-quiet)
            );
          box-shadow:
            inset -8px -10px 16px
              color-mix(in srgb, var(--orb-main) 30%, transparent),
            inset 6px 7px 13px rgba(255, 255, 255, 0.42),
            0 10px 22px rgba(30, 35, 31, 0.1);
          transition:
            filter 400ms ease,
            opacity 400ms ease,
            transform 400ms ease;
        }

        .foundation-system-orb::after {
          position: absolute;
          inset: -24%;
          z-index: -1;
          content: "";
          border-radius: inherit;
          background: radial-gradient(
            circle,
            color-mix(in srgb, var(--orb-glow) 52%, transparent),
            transparent 68%
          );
          opacity: 0.14;
        }

        .foundation-system-orb.is-active::after {
          opacity: 0.48;
          animation: orb-breathe 7s ease-in-out infinite;
          animation-delay: var(--orb-delay);
        }

        .foundation-system-orb.is-review::after {
          opacity: 0.68;
        }

        .foundation-system-orb.is-quiet {
          filter: saturate(0.66);
          opacity: 0.7;
        }

        @keyframes center-hold {
          from {
            opacity: 0.35;
            transform: scale(0.82);
          }
          to {
            border-color: var(--center-glow);
            box-shadow: 0 0 0 15px
              color-mix(in srgb, var(--center-glow) 14%, transparent);
            opacity: 1;
            transform: scale(1.08);
          }
        }

        @keyframes orb-breathe {
          0%,
          100% {
            transform: scale(0.96);
          }
          50% {
            transform: scale(1.06);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .foundation-system-orb,
          .foundation-system-orb::after,
          .foundation-center-orb,
          .hold-progress {
            animation: none !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}
