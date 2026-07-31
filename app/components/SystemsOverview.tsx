"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";

import {
  defaultColorPreferences,
  loadColorPreferences,
  saveColorPreferences,
  type AwakeColorPreferences,
} from "../colorPalette";
import {
  CIRCLE_CORE_ID,
  mapFoundationsToCircle,
} from "../music/circleOfFifths";
import { defaultSystems } from "../systemPresets";
import {
  loadFoundationViewPreferences,
  saveFoundationViewPreferences,
  type FoundationViewPreferences,
} from "../foundationViewPreferences";
import {
  createAwakeFocusArea,
  createAwakeSystem,
  type AwakeSystem,
} from "../systems";
import {
  loadAwakeSystems,
  saveAwakeSystems,
} from "../systemStorage";
import { getSystemTemplates } from "../systemTemplates";
import AwakeColorPicker from "./AwakeColorPicker";
import ResponsiveLayout from "./layout/ResponsiveLayout";
import AwakeCircleOfFifths from "./music/AwakeCircleOfFifths";
import ExpandedFoundationView from "./foundation/LivingFoundationView";
import type { HomeViewState } from "./foundation/foundationExperience";
import type { Language } from "../translations";

const HIDDEN_FOUNDATIONS_KEY = "awake-hidden-foundations";

function readHiddenFoundations() {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(HIDDEN_FOUNDATIONS_KEY) ?? "[]",
    );
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function initializeFoundations(stored: AwakeSystem[]) {
  let changed = false;
  const existingTitles = new Set(
    stored.map((foundation) => foundation.title.toLowerCase()),
  );
  const withDefaults = [...stored];

  for (const title of defaultSystems) {
    if (existingTitles.has(title.toLowerCase())) continue;
    const foundation = createAwakeSystem(title);
    foundation.focusAreas = getSystemTemplates(title).map(
      createAwakeFocusArea,
    );
    foundation.focusAreasInitialized = true;
    withDefaults.push(foundation);
    changed = true;
  }

  const initialized = withDefaults.map((foundation) => {
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
  return initialized;
}

export default function SystemsOverview() {
  const [foundations, setFoundations] = useState<AwakeSystem[]>([]);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState(CIRCLE_CORE_ID);
  const [loaded, setLoaded] = useState(false);
  const [homeView, setHomeView] = useState<HomeViewState>({ mode: "world" });
  const [language, setLanguage] = useState<Language>("en");
  const [foundationViewPreferences, setFoundationViewPreferences] =
    useState<FoundationViewPreferences>({
      defaultView: "orb",
      byFoundation: {},
    });
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [actionFoundation, setActionFoundation] =
    useState<AwakeSystem | null>(null);
  const [colorPreferences, setColorPreferences] =
    useState<AwakeColorPreferences>(defaultColorPreferences);
  const lastBackgroundTap = useRef(0);

  useEffect(() => {
    const initialized = initializeFoundations(loadAwakeSystems());
    // Hydrate client-owned local data after mounting.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFoundations(initialized);
    setHiddenIds(readHiddenFoundations());
    setColorPreferences(loadColorPreferences());
    setFoundationViewPreferences(loadFoundationViewPreferences());
    const savedLanguage = localStorage.getItem("awake-language");
    if (savedLanguage === "en" || savedLanguage === "es") {
      setLanguage(savedLanguage);
    }
    const foundationId = new URL(window.location.href).searchParams.get(
      "foundation",
    );
    if (
      foundationId &&
      initialized.some((foundation) => foundation.id === foundationId)
    ) {
      setHomeView({ mode: "foundation", foundationId });
    }
    setLoaded(true);
    const handlePopState = () => {
      const nextId = new URL(window.location.href).searchParams.get(
        "foundation",
      );
      setHomeView(
        nextId &&
          initialized.some((foundation) => foundation.id === nextId)
          ? { mode: "foundation", foundationId: nextId }
          : { mode: "world" },
      );
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const visibleFoundations = foundations.filter(
    (foundation) => !hiddenIds.includes(foundation.id),
  );
  const circleItems = mapFoundationsToCircle(visibleFoundations);
  const totalSystems = visibleFoundations.reduce(
    (total, foundation) => total + foundation.focusAreas.length,
    0,
  );
  function updateColorPreferences(next: AwakeColorPreferences) {
    setColorPreferences(next);
    saveColorPreferences(next);
  }

  function handleBackgroundTap(event: ReactMouseEvent<HTMLElement>) {
    if (
      (event.target as HTMLElement).closest("[data-appearance-control]") ||
      (event.target as HTMLElement).closest("[data-navigation-orb]") ||
      (event.target as HTMLElement).closest("button, a")
    ) {
      return;
    }
    const now = Date.now();
    if (now - lastBackgroundTap.current < 330) {
      setSelectedId(CIRCLE_CORE_ID);
      lastBackgroundTap.current = 0;
    } else {
      lastBackgroundTap.current = now;
    }
  }

  function hideFoundation(foundation: AwakeSystem) {
    const next = Array.from(new Set([...hiddenIds, foundation.id]));
    setHiddenIds(next);
    localStorage.setItem(HIDDEN_FOUNDATIONS_KEY, JSON.stringify(next));
    setActionFoundation(null);
    setSelectedId(CIRCLE_CORE_ID);
  }

  function toggleFoundation(foundationId: string) {
    const next = hiddenIds.includes(foundationId)
      ? hiddenIds.filter((id) => id !== foundationId)
      : [...hiddenIds, foundationId];
    setHiddenIds(next);
    localStorage.setItem(HIDDEN_FOUNDATIONS_KEY, JSON.stringify(next));
    if (next.includes(foundationId)) {
      setSelectedId(CIRCLE_CORE_ID);
    }
  }

  function openFoundation(foundation: AwakeSystem) {
    setHomeView({ mode: "foundation", foundationId: foundation.id });
    const url = new URL(window.location.href);
    url.searchParams.set("foundation", foundation.id);
    window.history.pushState({ foundationId: foundation.id }, "", url);
  }

  function closeFoundation() {
    if (window.history.state?.foundationId) {
      window.history.back();
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.delete("foundation");
    window.history.replaceState({}, "", url);
    setHomeView({ mode: "world" });
  }

  function updateFoundation(updated: AwakeSystem) {
    const next = foundations.map((foundation) =>
      foundation.id === updated.id ? updated : foundation,
    );
    setFoundations(next);
    saveAwakeSystems(next);
  }

  if (!loaded) return null;

  if (homeView.mode !== "world") {
    const foundation = foundations.find(
      (item) => item.id === homeView.foundationId,
    );
    if (foundation) {
      return (
        <ExpandedFoundationView
          foundation={foundation}
          view={homeView}
          preferences={colorPreferences}
          language={language}
          onBack={closeFoundation}
          onSelectSystem={(systemId) =>
            setHomeView({
              mode: "system-preview",
              foundationId: foundation.id,
              systemId,
            })
          }
          onClearPreview={() =>
            setHomeView({
              mode: "foundation",
              foundationId: foundation.id,
            })
          }
          onFoundationChange={updateFoundation}
        />
      );
    }
  }

  return (
    <main
      className="awake-page awake-home-responsive min-h-screen overflow-x-hidden"
      onClick={handleBackgroundTap}
    >
      <ResponsiveLayout
        header={
          <header className="awake-home-header">
            <div>
              <p className="awake-eyebrow">Awake</p>
              <h1 className="awake-home-title">Your world</h1>
              <p className="awake-home-subtitle awake-supporting">
                Move gently between the parts of life that support you.
              </p>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setAppearanceOpen((open) => !open);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  setAppearanceOpen((open) => !open);
                }
              }}
              onPointerDown={(event) => event.stopPropagation()}
              onTouchStart={(event) => event.stopPropagation()}
              className="awake-button awake-button-secondary h-11 w-11 rounded-full p-0"
              aria-label="Appearance and navigation settings"
              aria-expanded={appearanceOpen}
              aria-controls="awake-appearance-menu"
              aria-haspopup="dialog"
              data-appearance-control
            >
              <span aria-hidden="true">◐</span>
            </button>
          </header>
        }
        world={
          <div className="awake-world-stage">
            <AwakeCircleOfFifths
              items={circleItems}
              selectedId={selectedId}
              preferences={colorPreferences}
              onSelectedChange={setSelectedId}
              onEnterFoundation={openFoundation}
              onFoundationLongPress={setActionFoundation}
            />
            {selectedId !== CIRCLE_CORE_ID && (
              <button
                type="button"
                className="awake-circle-reset"
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedId(CIRCLE_CORE_ID);
                }}
              >
                Return to C / Core
              </button>
            )}
            <p className="awake-world-count" aria-live="polite">
              {totalSystems} {totalSystems === 1 ? "system" : "systems"} in your
              world
            </p>
          </div>
        }
        primaryAction={
          <Link
            href="/systems"
            onClick={(event) => event.stopPropagation()}
            className="awake-button awake-button-primary w-full"
          >
            Add system
          </Link>
        }
      />
      <div className="mx-auto w-full max-w-4xl">
        {appearanceOpen && (
          <section
            id="awake-appearance-menu"
            className="awake-card awake-appearance-panel relative z-30 max-h-[70vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
            onTouchStart={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="false"
            aria-labelledby="awake-appearance-title"
            data-appearance-control
          >
            <h2 id="awake-appearance-title">Appearance</h2>
            <p className="awake-supporting mt-1">
              Shape the atmosphere and choose which Foundations are nearby.
            </p>
            <div className="mt-5">
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
                  updateColorPreferences({
                    ...colorPreferences,
                    harmony,
                  })
                }
                onAppearanceChange={(appearance) =>
                  updateColorPreferences({
                    ...colorPreferences,
                    appearance,
                  })
                }
                orbMaterial={colorPreferences.orbMaterial}
                onOrbMaterialChange={(orbMaterial) =>
                  updateColorPreferences({
                    ...colorPreferences,
                    orbMaterial,
                  })
                }
              />
            </div>
            <div className="mt-8 border-t pt-6">
              <h3>Foundation view</h3>
              <p className="awake-supporting mt-1 text-xs">
                Used when a Foundation has no individual preference.
              </p>
              <div className="mt-3 flex gap-2">
                {(["orb", "list"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      const next = {
                        ...foundationViewPreferences,
                        defaultView: option,
                      };
                      setFoundationViewPreferences(next);
                      saveFoundationViewPreferences(next);
                    }}
                    className={`awake-chip min-h-10 px-4 ${
                      foundationViewPreferences.defaultView === option
                        ? "is-selected"
                        : ""
                    }`}
                    aria-pressed={
                      foundationViewPreferences.defaultView === option
                    }
                  >
                    {option === "orb" ? "Orb" : "List"}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-8 border-t pt-6">
              <h3>Navigation orbs</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {foundations.map((foundation) => {
                  const visible = !hiddenIds.includes(foundation.id);
                  return (
                    <label
                      key={foundation.id}
                      className="flex min-h-11 items-center justify-between rounded-2xl border px-4 text-sm"
                    >
                      {foundation.title}
                      <input
                        type="checkbox"
                        checked={visible}
                        onChange={() => toggleFoundation(foundation.id)}
                        aria-label={`Show ${foundation.title} in navigation`}
                        className="h-5 w-5"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="mt-6 flex justify-center gap-2 border-t pt-5">
              <Link
                href="/privacy"
                className="awake-button awake-button-quiet"
              >
                Privacy
              </Link>
              <Link
                href="/about"
                className="awake-button awake-button-quiet"
              >
                About
              </Link>
            </div>
          </section>
        )}
      </div>

      {actionFoundation && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/20 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-sm sm:items-center sm:justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="foundation-actions-title"
          onClick={() => setActionFoundation(null)}
        >
          <section
            className="awake-card w-full max-w-sm"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="foundation-actions-title">
              {actionFoundation.title}
            </h2>
            <p className="awake-supporting mt-2">
              Hiding a Foundation only removes it from this navigation.
            </p>
            <div className="mt-5 grid gap-2">
              <Link
                href={`/systems/${actionFoundation.id}`}
                className="awake-button awake-button-primary"
              >
                Open Foundation
              </Link>
              <button
                type="button"
                onClick={() => hideFoundation(actionFoundation)}
                className="awake-button awake-button-secondary"
              >
                Hide from Navigation
              </button>
              <button
                type="button"
                onClick={() => setActionFoundation(null)}
                className="awake-button awake-button-quiet"
              >
                Cancel
              </button>
            </div>
          </section>
        </div>
      )}


      <style jsx>{`
        .navigation-foundation-orb {
          background:
            radial-gradient(
              circle at 31% 24%,
              color-mix(
                in srgb,
                var(--nav-highlight) 82%,
                var(--awake-surface-elevated)
              ),
              transparent 29%
            ),
            radial-gradient(
              circle at 70% 72%,
              color-mix(in srgb, var(--nav-glow) 28%, transparent),
              transparent 58%
            ),
            linear-gradient(
              145deg,
              var(--nav-highlight),
              var(--nav-main) 58%,
              var(--nav-quiet)
            );
          box-shadow:
            inset -10px -12px 20px
              color-mix(in srgb, var(--nav-main) 28%, transparent),
            inset 8px 9px 16px
              color-mix(
                in srgb,
                var(--nav-highlight) 28%,
                transparent
              ),
            0 12px 30px
              color-mix(in srgb, var(--awake-text) 9%, transparent),
            0 0 38px color-mix(in srgb, var(--nav-glow) 18%, transparent);
        }

        .breathe-navigation-orb {
          overflow: hidden;
          border: 1px solid var(--awake-breathe-border);
          background:
            radial-gradient(
              circle at 32% 24%,
              color-mix(
                in srgb,
                var(--awake-orb-highlight) 82%,
                var(--awake-surface-elevated)
              ),
              transparent 30%
            ),
            linear-gradient(
              145deg,
              color-mix(
                in srgb,
                var(--awake-breathe-background) 82%,
                var(--awake-orb-highlight)
              ),
              var(--awake-breathe-background)
            );
          box-shadow:
            inset 6px 7px 14px
              color-mix(in srgb, var(--awake-orb-highlight) 35%, transparent),
            0 8px 24px
              color-mix(in srgb, var(--awake-breathe-halo) 16%, transparent);
          animation:
            navigation-breathe 7.5s ease-in-out infinite,
            navigation-light 18s linear infinite;
        }

        .breathe-navigation-orb.is-centered {
          border-width: 2px;
          box-shadow:
            inset 6px 7px 16px
              color-mix(in srgb, var(--awake-orb-highlight) 42%, transparent),
            0 10px 28px
              color-mix(in srgb, var(--awake-breathe-halo) 22%, transparent),
            0 0 34px
              color-mix(in srgb, var(--awake-breathe-halo) 14%, transparent);
        }

        .breathe-navigation-text {
          position: relative;
          z-index: 2;
          color: var(--awake-breathe-text);
          font-size: 0.875rem;
          font-weight: 600;
          letter-spacing: 0.04em;
        }

        .breathe-navigation-ripple {
          position: absolute;
          width: 78%;
          height: 78%;
          border: 1px solid
            color-mix(
              in srgb,
              var(--awake-breathe-ripple) 48%,
              transparent
            );
          border-radius: 9999px;
          opacity: 0.72;
        }

        @keyframes navigation-breathe {
          0%,
          100% {
            transform: scale(0.97);
          }
          50% {
            transform: scale(1.035);
          }
        }

        @keyframes navigation-light {
          from {
            filter: hue-rotate(0deg);
          }
          to {
            filter: hue-rotate(10deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .breathe-navigation-orb {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}
