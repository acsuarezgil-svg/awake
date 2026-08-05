"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from "react";

import {
  defaultColorPreferences,
  loadColorPreferences,
  saveColorPreferences,
  type AwakeColorPreferences,
} from "../colorPalette";
import {
  CIRCLE_CORE_ID,
  CIRCLE_OF_FIFTHS,
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
import PracticeSpace from "./practice/PracticeSpace";
import ExpandedFoundationView from "./foundation/LivingFoundationView";
import type { HomeViewState } from "./foundation/foundationExperience";
import type { Language } from "../translations";

const HIDDEN_FOUNDATIONS_KEY = "awake-hidden-foundations";
const SELECTED_KEY_STORAGE_KEY = "awake-circle-selected-key";

function musicalGlyphs(key: string) {
  return key.replaceAll("#", "♯").replaceAll("b", "♭");
}

const SHARP_SIGNATURE = ["F♯", "C♯", "G♯", "D♯", "A♯", "E♯", "B♯"];
const FLAT_SIGNATURE = ["B♭", "E♭", "A♭", "D♭", "G♭", "C♭", "F♭"];

function keySignatureNotes(
  direction: "core" | "sharp" | "flat",
  count: number,
) {
  if (direction === "core" || count === 0) return [];
  return (direction === "sharp" ? SHARP_SIGNATURE : FLAT_SIGNATURE).slice(
    0,
    count,
  );
}

type HomeDockIconName =
  | "add"
  | "filters"
  | "atmosphere"
  | "privacy"
  | "about";

function HomeDockIcon({ name }: { name: HomeDockIconName }) {
  const paths: Record<HomeDockIconName, ReactNode> = {
    add: <path d="M12 5v14M5 12h14" />,
    filters: (
      <>
        <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
        <circle cx="16" cy="7" r="2" />
        <circle cx="8" cy="17" r="2" />
      </>
    ),
    atmosphere: (
      <>
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
        <path d="M15.8 15.8A5.4 5.4 0 1 1 8.2 8.2a4.2 4.2 0 0 0 7.6 7.6Z" />
      </>
    ),
    privacy: (
      <path d="M12 3 5.5 5.7v5.7c0 4.1 2.7 7.7 6.5 9.1 3.8-1.4 6.5-5 6.5-9.1V5.7L12 3Zm0 5v5" />
    ),
    about: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6M12 7.5v.1" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function handleDockLinkKeyDown(
  event: ReactKeyboardEvent<HTMLAnchorElement>,
) {
  if (event.key !== " ") return;
  event.preventDefault();
  event.currentTarget.click();
}

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
  const [appearanceSection, setAppearanceSection] = useState<
    "appearance" | "filters"
  >("appearance");
  const [actionFoundation, setActionFoundation] =
    useState<AwakeSystem | null>(null);
  const [companionOpen, setCompanionOpen] = useState(false);
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [colorPreferences, setColorPreferences] =
    useState<AwakeColorPreferences>(defaultColorPreferences);
  const lastBackgroundTap = useRef(0);
  const companionChoiceRef = useRef<HTMLAnchorElement>(null);
  const companionWasOpen = useRef(false);

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
    const savedKey = localStorage.getItem(SELECTED_KEY_STORAGE_KEY);
    if (savedKey && CIRCLE_OF_FIFTHS.some((key) => key.id === savedKey)) {
      setSelectedId(savedKey);
    }
    const foundationId = new URL(window.location.href).searchParams.get(
      "foundation",
    );
    const companion = new URL(window.location.href).searchParams.get(
      "companion",
    );
    if (
      foundationId &&
      initialized.some((foundation) => foundation.id === foundationId)
    ) {
      setHomeView({ mode: "foundation", foundationId });
    }
    setCompanionOpen(companion === "learning");
    setLoaded(true);
    const handlePopState = () => {
      const nextId = new URL(window.location.href).searchParams.get(
        "foundation",
      );
      const nextCompanion = new URL(
        window.location.href,
      ).searchParams.get("companion");
      setCompanionOpen(nextCompanion === "learning");
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

  useEffect(() => {
    if (!companionOpen) return;
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (window.history.state?.awakeCompanion) {
        window.history.back();
        return;
      }
      const url = new URL(window.location.href);
      url.searchParams.delete("companion");
      window.history.replaceState({}, "", url);
      setCompanionOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [companionOpen]);

  useEffect(() => {
    if (companionOpen) {
      companionWasOpen.current = true;
      companionChoiceRef.current?.focus();
      return;
    }
    if (!companionWasOpen.current) return;
    companionWasOpen.current = false;
    document
      .querySelector<HTMLButtonElement>(
        '[aria-label="Open learning companion"]',
      )
      ?.focus();
  }, [companionOpen]);

  const visibleFoundations = foundations.filter(
    (foundation) => !hiddenIds.includes(foundation.id),
  );
  const circleItems = mapFoundationsToCircle(visibleFoundations);
  const selectedCircleItem =
    circleItems.find((item) => item.id === selectedId) ?? circleItems[0];

  function selectCircleKey(id: string) {
    setSelectedId(id);
    localStorage.setItem(SELECTED_KEY_STORAGE_KEY, id);
  }

  function selectAdjacentKey(direction: -1 | 1) {
    if (!circleItems.length) return;
    const currentIndex = Math.max(
      0,
      circleItems.findIndex((item) => item.id === selectedCircleItem?.id),
    );
    const nextIndex =
      (currentIndex + direction + circleItems.length) % circleItems.length;
    selectCircleKey(circleItems[nextIndex].id);
  }
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

  function openCompanion() {
    if (companionOpen) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("foundation");
    url.searchParams.set("companion", "learning");
    window.history.pushState(
      { ...window.history.state, awakeCompanion: true },
      "",
      url,
    );
    setCompanionOpen(true);
  }

  function closeCompanion() {
    if (window.history.state?.awakeCompanion) {
      window.history.back();
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.delete("companion");
    window.history.replaceState({}, "", url);
    setCompanionOpen(false);
  }

  function updateFoundation(updated: AwakeSystem) {
    const next = foundations.map((foundation) =>
      foundation.id === updated.id ? updated : foundation,
    );
    setFoundations(next);
    saveAwakeSystems(next);
  }

  if (!loaded) return null;

  if (practiceOpen) {
    return (
      <PracticeSpace
        primaryColor="var(--awake-accent)"
        secondaryColor="var(--awake-orb-glow)"
        pageBackground="var(--awake-page-background)"
        isDark={colorPreferences.appearance === "dark"}
        onFinish={() => setPracticeOpen(false)}
        initialMode="breath"
      />
    );
  }

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
      className={`awake-page awake-home-responsive min-h-screen overflow-x-hidden ${
        companionOpen ? "is-companion-open" : ""
      }`}
      onClick={handleBackgroundTap}
    >
      <ResponsiveLayout
        header={
          <header className="awake-home-header awake-musical-hero">
            <span className="awake-home-brand">Awake</span>
            <div className="awake-musical-hero-inner">
              <p className="awake-eyebrow">Your Foundation</p>
              <h1 className="awake-home-title">
                The Key of {musicalGlyphs(selectedCircleItem?.displayKey ?? "C")}
              </h1>
            </div>
          </header>
        }
        world={
          <div className="awake-world-stage">
            <AwakeCircleOfFifths
              items={circleItems}
              selectedId={selectedId}
              preferences={colorPreferences}
              onSelectedChange={selectCircleKey}
              onOpenCompanion={openCompanion}
              onCenterLongPress={() => setPracticeOpen(true)}
            />
            {selectedCircleItem && (
              <div className="awake-key-selector" aria-label="Selected major key">
                <div className="awake-key-selector-main">
                  <button
                    type="button"
                    onClick={() => selectAdjacentKey(-1)}
                    aria-label="Select previous key"
                  >
                    ←
                  </button>
                  <span aria-live="polite">
                    <i aria-hidden="true" />
                    {musicalGlyphs(selectedCircleItem.displayKey)} major
                  </span>
                  <button
                    type="button"
                    onClick={() => selectAdjacentKey(1)}
                    aria-label="Select next key"
                  >
                    →
                  </button>
                </div>
                <p className="awake-key-signature" aria-live="polite">
                  {keySignatureNotes(
                    selectedCircleItem.direction,
                    selectedCircleItem.accidentalCount,
                  ).length > 0
                    ? keySignatureNotes(
                        selectedCircleItem.direction,
                        selectedCircleItem.accidentalCount,
                      ).map((note) => <span key={note}>{note}</span>)
                    : null}
                </p>
              </div>
            )}
          </div>
        }
        primaryAction={
          <nav
            className="awake-card awake-home-navigation grid w-full max-w-[26rem] grid-cols-5 gap-1 p-1"
            aria-label="Home actions"
          >
            <Link
              href="/systems"
              onClick={(event) => event.stopPropagation()}
              onKeyDown={handleDockLinkKeyDown}
              className="awake-button awake-button-quiet awake-home-navigation-item is-add"
              aria-label="Add system"
              title="Add system"
              data-tooltip="Add system"
            >
              <HomeDockIcon name="add" />
            </Link>
            <button
              type="button"
              className="awake-button awake-button-quiet awake-home-navigation-item"
              aria-label="Manage visible foundations"
              title="Manage visible foundations"
              data-tooltip="Filters"
              aria-expanded={
                appearanceOpen && appearanceSection === "filters"
              }
              aria-controls="awake-appearance-menu"
              onClick={(event) => {
                event.stopPropagation();
                setAppearanceSection("filters");
                setAppearanceOpen(
                  (open) => !(open && appearanceSection === "filters"),
                );
              }}
            >
              <HomeDockIcon name="filters" />
            </button>
            <button
              type="button"
              className="awake-button awake-button-quiet awake-home-navigation-item"
              aria-label="Change atmosphere"
              title="Change atmosphere"
              data-tooltip="Atmosphere"
              aria-expanded={
                appearanceOpen && appearanceSection === "appearance"
              }
              aria-controls="awake-appearance-menu"
              aria-haspopup="dialog"
              onClick={(event) => {
                event.stopPropagation();
                setAppearanceSection("appearance");
                setAppearanceOpen(
                  (open) => !(open && appearanceSection === "appearance"),
                );
              }}
            >
              <HomeDockIcon name="atmosphere" />
            </button>
            <Link
              href="/privacy"
              onClick={(event) => event.stopPropagation()}
              onKeyDown={handleDockLinkKeyDown}
              className="awake-button awake-button-quiet awake-home-navigation-item"
              aria-label="Open privacy"
              title="Open privacy"
              data-tooltip="Privacy"
            >
              <HomeDockIcon name="privacy" />
            </Link>
            <Link
              href="/about"
              onClick={(event) => event.stopPropagation()}
              onKeyDown={handleDockLinkKeyDown}
              className="awake-button awake-button-quiet awake-home-navigation-item"
              aria-label="Open about"
              title="Open about"
              data-tooltip="About"
            >
              <HomeDockIcon name="about" />
            </Link>
          </nav>
        }
      />
      {companionOpen && (
        <section
          className="awake-companion-screen"
          aria-labelledby="awake-companion-question"
        >
          <div className="awake-companion-surface" aria-hidden="true" />
          <div className="awake-companion-content">
            <div>
              <p className="awake-eyebrow">Awake</p>
              <h1 id="awake-companion-question" className="mt-4">
                Where would you like to begin?
              </h1>
              <div className="mt-10">
                <Link
                  ref={companionChoiceRef}
                  href="/learn/piano"
                  className="awake-companion-choice"
                >
                  <span aria-hidden="true">🎼</span> Music
                </Link>
                <p className="mt-4 text-sm text-[var(--awake-text-secondary)]">
                  More learning journeys are coming soon.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeCompanion}
              className="awake-button awake-button-quiet mt-12"
            >
              Return to your world
            </button>
          </div>
        </section>
      )}
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
            <h2 id="awake-appearance-title">
              {appearanceSection === "appearance" ? "Appearance" : "Filters"}
            </h2>
            <p className="awake-supporting mt-1">
              {appearanceSection === "appearance"
                ? "Shape the atmosphere and choose how Foundations appear."
                : "Choose which Foundations are nearby."}
            </p>
            {appearanceSection === "appearance" && (
              <>
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
                    displayScale={colorPreferences.displayScale}
                    onDisplayScaleChange={(displayScale) =>
                      updateColorPreferences({
                        ...colorPreferences,
                        displayScale,
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
              </>
            )}
            {appearanceSection === "filters" && (
              <div className="mt-5">
                <h3 className="sr-only">Navigation orbs</h3>
                <div className="grid gap-2 sm:grid-cols-2">
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
            )}
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
