"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import {
  generateAwakePalette,
  generateSystemOrbPalette,
  getFoundationHue,
  type AwakeColorPreferences,
} from "../../colorPalette";
import { createAwakeFocusArea, type AwakeSystem } from "../../systems";
import { getSystemTemplates } from "../../systemTemplates";
import {
  foundationExperienceTranslations,
  type Language,
} from "../../translations";
import RotatingOrbRing from "../navigation/RotatingOrbRing";
import {
  getFoundationSystems,
  getLastSupportedText,
  type HomeViewState,
} from "./foundationExperience";

type Props = {
  foundation: AwakeSystem;
  view: HomeViewState;
  preferences: AwakeColorPreferences;
  language: Language;
  onBack: () => void;
  onSelectSystem: (systemId: string) => void;
  onClearPreview: () => void;
  onFoundationChange: (foundation: AwakeSystem) => void;
};

export default function LivingFoundationView({
  foundation,
  view,
  preferences,
  language,
  onBack,
  onSelectSystem,
  onFoundationChange,
}: Props) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [enteringSystemId, setEnteringSystemId] = useState<string | null>(
    null,
  );
  const navigationTimer = useRef<number | null>(null);
  const systems = getFoundationSystems(foundation);
  const selectedId =
    view.mode === "system-preview"
      ? view.systemId
      : systems[0]?.id ?? null;
  const hue = getFoundationHue(foundation.title, preferences.anchorHue);
  const palette = generateAwakePalette(
    hue,
    preferences.harmony,
    preferences.appearance,
  );
  const centerOrb = generateSystemOrbPalette(
    hue,
    preferences.harmony,
    preferences.appearance,
  );
  const text = foundationExperienceTranslations[language];
  const suggestions = getSystemTemplates(foundation.title).filter(
    (title) =>
      !systems.some(
        (system) => system.title.toLowerCase() === title.toLowerCase(),
      ),
  );

  useEffect(
    () => () => {
      if (navigationTimer.current !== null) {
        window.clearTimeout(navigationTimer.current);
      }
    },
    [],
  );

  function enterSystem(systemId: string) {
    if (enteringSystemId) return;
    onSelectSystem(systemId);
    setEnteringSystemId(systemId);
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    navigationTimer.current = window.setTimeout(
      () => router.push(`/systems/${foundation.id}/${systemId}`),
      reducedMotion ? 80 : 680,
    );
  }

  function addSystem(title: string) {
    const clean = title.trim();
    if (!clean) return;
    const next = createAwakeFocusArea(clean);
    onFoundationChange({
      ...foundation,
      focusAreas: [...systems, next],
      focusAreasInitialized: true,
      updatedAt: new Date().toISOString(),
    });
    setAdding(false);
    setCustomTitle("");
    onSelectSystem(next.id);
  }

  return (
    <main
      className="foundation-expanded awake-page min-h-[100dvh] overflow-x-hidden px-4 pb-10 pt-[calc(1rem+env(safe-area-inset-top))] transition-colors duration-700 motion-reduce:duration-0 sm:px-6"
      style={
        {
          color: palette.text,
          background: `radial-gradient(circle at 50% 42%, ${palette.pageTint}, transparent 58%), ${palette.pageBackground}`,
          "--foundation-glow": palette.companion,
          "--foundation-surface": palette.mutedSurface,
          "--foundation-border": palette.border,
        } as CSSProperties
      }
    >
      <div className="mx-auto w-full max-w-3xl">
        <header className="relative min-h-24 text-center">
          <button
            type="button"
            onClick={onBack}
            className="awake-button awake-button-secondary absolute left-0 top-0 h-11 w-11 rounded-full p-0 focus-visible:ring-2"
            aria-label={text.backToWorld}
          >
            <span aria-hidden="true">←</span>
          </button>
          <div className="mx-auto max-w-md px-12">
            <p className="awake-eyebrow">{text.foundation}</p>
            <h1 className="mt-1 text-3xl">{foundation.title}</h1>
            <p className="awake-supporting mt-1">
              {foundation.understanding?.purpose ||
                text.supportDescription}
            </p>
          </div>
        </header>

        {systems.length === 0 ? (
          <section className="foundation-field relative mx-auto mt-4 flex min-h-[31rem] max-w-2xl flex-col items-center justify-center text-center">
            <div className="foundation-field-glow" aria-hidden="true" />
            <div className="foundation-empty-orb relative z-10 h-32 w-32 rounded-full" />
            <h2 className="relative z-10 mt-6 text-xl">{text.noSystems}</h2>
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="awake-button awake-button-primary relative z-10 mt-5"
            >
              {text.addSystem}
            </button>
          </section>
        ) : (
          <RotatingOrbRing
            items={systems}
            selectedId={selectedId}
            onSelectedChange={onSelectSystem}
            onActivate={(system) => enterSystem(system.id)}
            activateOnlyWhenCentered={false}
            ariaLabel={`${foundation.title} ${text.systems}`}
            className={`foundation-system-ring ${
              enteringSystemId ? "is-entering-system" : ""
            }`}
            centerContent={
              <div className="foundation-ring-center">
                <span
                  className="foundation-ring-center-orb"
                  style={
                    {
                      "--center-main": centerOrb.main,
                      "--center-highlight": centerOrb.highlight,
                      "--center-glow": centerOrb.glow,
                      "--center-quiet": centerOrb.quiet,
                    } as CSSProperties
                  }
                  aria-hidden="true"
                >
                  <span>♡</span>
                </span>
                <strong>{foundation.title}</strong>
                <small>
                  {systems.length} {text.systems}
                </small>
              </div>
            }
            getAriaLabel={(system, selected) =>
              `${selected ? "Enter" : "Select and enter"} ${system.title}, ${getLastSupportedText(
                system,
                language,
              )}`
            }
            renderItem={(system, { centered, index }) => {
              const orb = generateSystemOrbPalette(
                hue + index * 13,
                preferences.harmony,
                preferences.appearance,
              );
              return (
                <>
                  <span
                    className={`foundation-child-orb relative block h-[4.75rem] w-[4.75rem] rounded-full sm:h-20 sm:w-20 ${
                      enteringSystemId === system.id ? "is-entering" : ""
                    }`}
                    style={
                      {
                        "--orb-main": orb.main,
                        "--orb-highlight": orb.highlight,
                        "--orb-glow": orb.glow,
                        "--orb-quiet": orb.quiet,
                        "--orbit-index": index,
                      } as CSSProperties
                    }
                    aria-hidden="true"
                  />
                  <span className="mt-2 max-w-24 text-xs font-semibold leading-tight">
                    {system.title}
                  </span>
                  {centered && (
                    <span className="awake-supporting mt-1 max-w-28 text-[0.62rem] leading-tight">
                      {getLastSupportedText(system, language)}
                    </span>
                  )}
                </>
              );
            }}
          />
        )}

        {systems.length > 0 && !adding && !enteringSystemId && (
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="awake-button awake-button-secondary"
            >
              {text.addSystem}
            </button>
          </div>
        )}

        {adding && (
          <section className="foundation-preview mx-auto mt-6 max-w-lg rounded-[2rem] border p-5">
            <h2 className="text-lg">
              {text.addTo} {foundation.title}
            </h2>
            {suggestions.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {suggestions.map((title) => (
                  <button
                    type="button"
                    key={title}
                    onClick={() => addSystem(title)}
                    className="awake-chip min-h-11 px-4"
                  >
                    {title}
                  </button>
                ))}
              </div>
            )}
            <label className="awake-supporting mt-5 block text-sm">
              {text.customSystem}
              <input
                value={customTitle}
                onChange={(event) => setCustomTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") addSystem(customTitle);
                }}
                className="mt-2 w-full border px-4"
                placeholder={text.systemName}
              />
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="awake-button awake-button-quiet"
              >
                {text.cancel}
              </button>
              <button
                type="button"
                disabled={!customTitle.trim()}
                onClick={() => addSystem(customTitle)}
                className="awake-button awake-button-primary disabled:opacity-40"
              >
                {text.add}
              </button>
            </div>
          </section>
        )}
      </div>
      <div className="sr-only" role="status" aria-live="polite">
        {enteringSystemId
          ? `${systems.find((system) => system.id === enteringSystemId)?.title} ${text.selected}`
          : `${text.entered} ${foundation.title}`}
      </div>
    </main>
  );
}
