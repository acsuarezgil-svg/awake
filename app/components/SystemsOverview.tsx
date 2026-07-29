"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type {
  CSSProperties,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";

import {
  defaultColorPreferences,
  generateAwakePalette,
  generateSystemOrbPalette,
  getFoundationHue,
  loadColorPreferences,
  saveColorPreferences,
  type AwakeColorPreferences,
} from "../colorPalette";
import { defaultSystems } from "../systemPresets";
import {
  loadFoundationViewPreferences,
  saveFoundationViewPreferences,
  type FoundationViewPreferences,
} from "../foundationViewPreferences";
import {
  getFoundationLabel,
  getFoundationSummary,
} from "../systemStatus";
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
import RotatingOrbRing from "./navigation/RotatingOrbRing";
import {
  circularOrbOffset,
  useOrbCarouselController,
} from "./navigation/OrbCarousel";
import PracticeSpace from "./practice/PracticeSpace";
import ExpandedFoundationView from "./foundation/LivingFoundationView";
import type { HomeViewState } from "./foundation/foundationExperience";
import type { Language } from "../translations";

const HIDDEN_FOUNDATIONS_KEY = "awake-hidden-foundations";
const BREATHE_ID = "awake-breathe";

type NavigationItem =
  | { id: string; kind: "foundation"; foundation: AwakeSystem }
  | { id: typeof BREATHE_ID; kind: "breathe" };

function offsetTransform(offset: number) {
  if (offset === 0) return "translateX(-50%) scale(1)";
  const direction = offset > 0 ? "+" : "-";
  return `translateX(calc(-50% ${direction} clamp(8rem, 25vw, 12rem))) scale(0.72)`;
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
  const [selectedId, setSelectedId] = useState(BREATHE_ID);
  const [loaded, setLoaded] = useState(false);
  const [practiceOpen, setPracticeOpen] = useState(false);
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
  const longPressTimer = useRef<number | null>(null);
  const longPressStart = useRef<{ x: number; y: number } | null>(null);
  const suppressOpen = useRef(false);
  const lastBackgroundTap = useRef(0);
  const returnTimer = useRef<number | null>(null);

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
      if (longPressTimer.current !== null) {
        window.clearTimeout(longPressTimer.current);
      }
      if (returnTimer.current !== null) {
        window.clearTimeout(returnTimer.current);
      }
    };
  }, []);

  const palette = generateAwakePalette(
    colorPreferences.anchorHue,
    colorPreferences.harmony,
    colorPreferences.appearance,
  );
  const visibleFoundations = foundations.filter(
    (foundation) => !hiddenIds.includes(foundation.id),
  );
  const items: NavigationItem[] = [
    ...visibleFoundations.map(
      (foundation): NavigationItem => ({
        id: foundation.id,
        kind: "foundation",
        foundation,
      }),
    ),
    { id: BREATHE_ID, kind: "breathe" },
  ];
  const selectedIndex = Math.max(
    0,
    items.findIndex((item) => item.id === selectedId),
  );
  const homeCarousel = useOrbCarouselController(
    items,
    selectedId,
    setSelectedId,
  );
  function updateColorPreferences(next: AwakeColorPreferences) {
    setColorPreferences(next);
    saveColorPreferences(next);
  }

  function animateBreatheHome() {
    const breatheIndex = items.findIndex((item) => item.id === BREATHE_ID);
    if (breatheIndex === selectedIndex) return;
    const forward =
      (breatheIndex - selectedIndex + items.length) % items.length;
    const backward =
      (selectedIndex - breatheIndex + items.length) % items.length;
    const direction: -1 | 1 = forward <= backward ? 1 : -1;
    let steps = Math.min(forward, backward);
    let cursor = selectedIndex;

    const rotate = () => {
      if (steps <= 0) return;
      cursor = (cursor + direction + items.length) % items.length;
      setSelectedId(items[cursor].id);
      steps -= 1;
      if (steps > 0) {
        returnTimer.current = window.setTimeout(rotate, 210);
      }
    };
    rotate();
  }

  function handleBackgroundTap(event: ReactMouseEvent<HTMLElement>) {
    if (
      (event.target as HTMLElement).closest("[data-navigation-orb]") ||
      (event.target as HTMLElement).closest("button, a")
    ) {
      return;
    }
    const now = Date.now();
    if (now - lastBackgroundTap.current < 330) {
      animateBreatheHome();
      lastBackgroundTap.current = 0;
    } else {
      lastBackgroundTap.current = now;
    }
  }

  function beginFoundationHold(
    event: ReactPointerEvent<HTMLButtonElement>,
    foundation: AwakeSystem,
  ) {
    suppressOpen.current = false;
    longPressStart.current = { x: event.clientX, y: event.clientY };
    longPressTimer.current = window.setTimeout(() => {
      suppressOpen.current = true;
      setActionFoundation(foundation);
      if ("vibrate" in navigator) navigator.vibrate(22);
    }, 650);
  }

  function trackFoundationHold(
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
    if (!longPressStart.current) return;
    if (
      Math.hypot(
        event.clientX - longPressStart.current.x,
        event.clientY - longPressStart.current.y,
      ) > 9
    ) {
      cancelFoundationHold();
    }
  }

  function cancelFoundationHold() {
    longPressStart.current = null;
    if (longPressTimer.current !== null) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  function hideFoundation(foundation: AwakeSystem) {
    const next = Array.from(new Set([...hiddenIds, foundation.id]));
    setHiddenIds(next);
    localStorage.setItem(HIDDEN_FOUNDATIONS_KEY, JSON.stringify(next));
    setActionFoundation(null);
    setSelectedId(BREATHE_ID);
  }

  function toggleFoundation(foundationId: string) {
    const next = hiddenIds.includes(foundationId)
      ? hiddenIds.filter((id) => id !== foundationId)
      : [...hiddenIds, foundationId];
    setHiddenIds(next);
    localStorage.setItem(HIDDEN_FOUNDATIONS_KEY, JSON.stringify(next));
    if (foundationId === selectedId && next.includes(foundationId)) {
      setSelectedId(BREATHE_ID);
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
      className="awake-page min-h-screen overflow-hidden px-4 pb-12 pt-8 sm:px-6"
      onClick={handleBackgroundTap}
    >
      <div className="mx-auto w-full max-w-4xl">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="awake-eyebrow">Awake</p>
            <h1 className="mt-2">Your world</h1>
            <p className="awake-supporting mt-2">
              Move gently between the parts of life that support you.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setAppearanceOpen((open) => !open);
              }}
              className="awake-button awake-button-secondary h-11 w-11 rounded-full p-0"
              aria-label="Appearance and navigation settings"
              aria-expanded={appearanceOpen}
            >
              <span aria-hidden="true">◐</span>
            </button>
            <Link
              href="/systems"
              onClick={(event) => event.stopPropagation()}
              className="awake-button awake-button-primary hidden sm:inline-flex"
            >
              Add system
            </Link>
          </div>
        </header>

        {appearanceOpen && (
          <section
            className="awake-card relative z-30 mt-6 max-h-[70vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <h2>Appearance</h2>
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

        <RotatingOrbRing
          items={items}
          selectedId={selectedId}
          onSelectedChange={setSelectedId}
          ariaLabel="Foundation world"
          className="home-foundation-ring mt-5"
          onActivate={(item) => {
            if (item.kind === "breathe") setPracticeOpen(true);
            else openFoundation(item.foundation);
          }}
          onLongPress={(item) => {
            if (item.kind === "foundation") {
              setActionFoundation(item.foundation);
            }
          }}
          getAriaLabel={(item, centered) =>
            item.kind === "breathe"
              ? centered
                ? "Open breathing practice"
                : "Bring Breathe to the center"
              : `${centered ? "Enter" : "Bring to center"} ${
                  item.foundation.title
                } foundation, ${item.foundation.focusAreas.length} systems`
          }
          renderItem={(item, { centered, index }) => {
            const foundation =
              item.kind === "foundation" ? item.foundation : null;
            const hue = foundation
              ? getFoundationHue(
                  foundation.title,
                  colorPreferences.anchorHue,
                )
              : colorPreferences.anchorHue;
            const orb = generateSystemOrbPalette(
              hue,
              colorPreferences.harmony,
              colorPreferences.appearance,
            );
            const summary = foundation
              ? getFoundationSummary(foundation)
              : null;

            return item.kind === "breathe" ? (
              <>
                <span
                  className={`breathe-navigation-orb awake-orb flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24 ${
                    centered ? "is-centered" : ""
                  }`}
                >
                  <span className="breathe-navigation-text">Breathe</span>
                  <span
                    className="breathe-navigation-ripple"
                    aria-hidden="true"
                  />
                </span>
                <span className="mt-2 text-sm font-medium">Breathe</span>
                {centered && (
                  <span className="awake-supporting mt-1 text-[0.68rem]">
                    Tap to enter Practice
                  </span>
                )}
              </>
            ) : (
              <>
                <span
                  className="navigation-foundation-orb relative h-20 w-20 rounded-full sm:h-24 sm:w-24"
                  style={
                    {
                      "--nav-main": orb.main,
                      "--nav-highlight": orb.highlight,
                      "--nav-glow": orb.glow,
                      "--nav-quiet": orb.quiet,
                      "--orb-delay": `${-(index % 9) * 0.55}s`,
                    } as CSSProperties
                  }
                />
                <span className="mt-2 max-w-24 text-sm font-medium leading-tight">
                  {item.foundation.title}
                </span>
                {centered && (
                  <span className="awake-supporting mt-1 text-[0.68rem]">
                    {summary ? getFoundationLabel(summary) : "Foundation"}
                  </span>
                )}
              </>
            );
          }}
        />

        <section
          className="hidden"
          aria-label="Foundation navigation"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              homeCarousel.move(-1);
            } else if (event.key === "ArrowRight") {
              event.preventDefault();
              homeCarousel.move(1);
            }
          }}
        >
          {items.map((item, index) => {
            const offset = circularOrbOffset(
              index,
              selectedIndex,
              items.length,
            );
            const isCentered = offset === 0;
            const nearby = Math.abs(offset) <= 1;
            const visible = Math.abs(offset) <= 2;
            const foundation =
              item.kind === "foundation" ? item.foundation : null;
            const hue = foundation
              ? getFoundationHue(
                  foundation.title,
                  colorPreferences.anchorHue,
                )
              : colorPreferences.anchorHue;
            const orb = generateSystemOrbPalette(
              hue,
              colorPreferences.harmony,
              colorPreferences.appearance,
            );
            const summary = foundation
              ? getFoundationSummary(foundation)
              : null;

            return (
              <div
                key={item.id}
                data-navigation-orb
                className="absolute left-1/2 top-12 flex w-36 flex-col items-center text-center transition-all duration-700 ease-out"
                style={{
                  transform: offsetTransform(offset),
                  opacity: visible ? (nearby ? 1 : 0.12) : 0,
                  pointerEvents: nearby ? "auto" : "none",
                  zIndex: isCentered ? 10 : 5 - Math.abs(offset),
                }}
              >
                {item.kind === "breathe" ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      if (homeCarousel.didSwipe.current) {
                        homeCarousel.didSwipe.current = false;
                        return;
                      }
                      if (isCentered) {
                        setPracticeOpen(true);
                      }
                      else setSelectedId(BREATHE_ID);
                    }}
                    className="flex flex-col items-center outline-none"
                    aria-label={
                      isCentered
                        ? "Open breathing practice"
                        : "Move Breathe to the center"
                    }
                  >
                    <span
                      className={`breathe-navigation-orb awake-orb flex h-32 w-32 items-center justify-center ${
                        isCentered ? "is-centered" : ""
                      }`}
                    >
                      <span className="breathe-navigation-text">
                        Breathe
                      </span>
                      <span
                        className="breathe-navigation-ripple"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="mt-5 text-base font-medium">Breathe</span>
                    <span className="awake-supporting mt-1 text-xs">
                      {isCentered ? "Tap to enter Practice" : "Return to yourself"}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onPointerDown={(event) =>
                      isCentered &&
                      beginFoundationHold(event, item.foundation)
                    }
                    onPointerMove={trackFoundationHold}
                    onPointerUp={cancelFoundationHold}
                    onPointerCancel={cancelFoundationHold}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (homeCarousel.didSwipe.current) {
                        homeCarousel.didSwipe.current = false;
                        return;
                      }
                      if (suppressOpen.current) {
                        suppressOpen.current = false;
                        return;
                      }
                      if (!isCentered) {
                        setSelectedId(item.id);
                      } else {
                        openFoundation(item.foundation);
                      }
                    }}
                    className="flex flex-col items-center outline-none"
                    aria-label={`${isCentered ? "Open" : "Center"} ${
                      item.foundation.title
                    } foundation, ${item.foundation.focusAreas.length} systems`}
                  >
                    <span
                      className="navigation-foundation-orb relative h-32 w-32 rounded-full"
                      style={
                        {
                          "--nav-main": orb.main,
                          "--nav-highlight": orb.highlight,
                          "--nav-glow": orb.glow,
                          "--nav-quiet": orb.quiet,
                        } as CSSProperties
                      }
                    />
                    <span className="mt-5 text-base font-medium">
                      {item.foundation.title}
                    </span>
                    <span className="awake-supporting mt-1 text-xs">
                      {summary ? getFoundationLabel(summary) : "Foundation"}
                    </span>
                  </button>
                )}
              </div>
            );
          })}

          <p className="awake-supporting absolute inset-x-0 bottom-16 text-center text-xs">
            Swipe to move · Double-tap the background to return
          </p>
          <div className="absolute inset-x-0 bottom-1 flex justify-center gap-3">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                homeCarousel.move(-1);
              }}
              disabled={items.length < 2}
              className="awake-button awake-button-secondary h-11 w-11 rounded-full p-0 disabled:opacity-35"
              aria-label="Previous orb"
            >
              ←
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                homeCarousel.move(1);
              }}
              disabled={items.length < 2}
              className="awake-button awake-button-secondary h-11 w-11 rounded-full p-0 disabled:opacity-35"
              aria-label="Next orb"
            >
              →
            </button>
          </div>
        </section>

        <div className="flex justify-center sm:hidden">
          <Link
            href="/systems"
            className="awake-button awake-button-primary"
            onClick={(event) => event.stopPropagation()}
          >
            Add system
          </Link>
        </div>
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
              rgba(255, 255, 255, 0.9),
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
            inset 8px 9px 16px rgba(255, 255, 255, 0.48),
            0 12px 30px rgba(28, 34, 30, 0.1),
            0 0 38px color-mix(in srgb, var(--nav-glow) 18%, transparent);
        }

        .breathe-navigation-orb {
          overflow: hidden;
          border: 1px solid var(--awake-breathe-border);
          background:
            radial-gradient(
              circle at 32% 24%,
              color-mix(in srgb, var(--awake-orb-highlight) 76%, white),
              transparent 30%
            ),
            linear-gradient(
              145deg,
              color-mix(in srgb, var(--awake-breathe-background) 78%, white),
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
