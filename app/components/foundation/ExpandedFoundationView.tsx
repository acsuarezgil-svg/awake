"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
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
import {
  getFoundationSystems,
  type HomeViewState,
} from "./foundationExperience";
import SystemOrb from "./SystemOrb";
import SystemQuickPreview from "./SystemQuickPreview";

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

export default function ExpandedFoundationView({
  foundation,
  view,
  preferences,
  language,
  onBack,
  onSelectSystem,
  onClearPreview,
  onFoundationChange,
}: Props) {
  const [adding, setAdding] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const systems = getFoundationSystems(foundation);
  const selected =
    view.mode === "system-preview"
      ? systems.find((system) => system.id === view.systemId) ?? null
      : null;
  const hue = getFoundationHue(foundation.title, preferences.anchorHue);
  const palette = generateAwakePalette(
    hue,
    preferences.harmony,
    preferences.appearance,
  );
  const suggestions = getSystemTemplates(foundation.title).filter(
    (title) =>
      !systems.some(
        (system) => system.title.toLowerCase() === title.toLowerCase(),
      ),
  );
  const text = foundationExperienceTranslations[language];
  const orbitalLayout = systems.length > 0 && systems.length <= 8;

  function getOrbitStyle(index: number): CSSProperties {
    const count = systems.length;
    const selectedIndex = selected
      ? systems.findIndex((system) => system.id === selected.id)
      : 0;
    const relativeIndex =
      selectedIndex >= 0
        ? (index - selectedIndex + count) % count
        : index;
    const angle = -90 + (360 / count) * relativeIndex;
    const radians = (angle * Math.PI) / 180;
    const radiusX = count <= 5 ? 36 : 38;
    const radiusY = count <= 5 ? 32 : 35;
    return {
      left: `${50 + Math.cos(radians) * radiusX}%`,
      top: `${50 + Math.sin(radians) * radiusY}%`,
    };
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
          background: `radial-gradient(circle at 50% 38%, ${palette.pageTint}, transparent 48%), ${palette.pageBackground}`,
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

        <section className="foundation-field relative mx-auto mt-2 min-h-[31rem] max-w-2xl px-1 py-3 sm:min-h-[36rem]">
          <div className="foundation-field-glow" aria-hidden="true" />
          {systems.length === 0 ? (
            <div className="relative z-10 flex min-h-[22rem] flex-col items-center justify-center text-center">
              <div className="foundation-empty-orb h-32 w-32 rounded-full" />
              <h2 className="mt-6 text-xl">
                {text.noSystems}
              </h2>
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="awake-button awake-button-primary mt-5"
              >
                {text.addSystem}
              </button>
            </div>
          ) : (
            <>
              <div className="foundation-identity pointer-events-none absolute left-1/2 top-1/2 z-[2] -translate-x-1/2 -translate-y-1/2 text-center">
                <span className="foundation-identity-mark" aria-hidden="true">
                  ♡
                </span>
                <h2 className="mt-1 text-2xl font-semibold">
                  {foundation.title}
                </h2>
                <p className="mt-1 text-sm">
                  {systems.length} {text.systems}
                </p>
              </div>
              <div
              className={`foundation-orbit relative z-10 ${
                orbitalLayout
                  ? "is-orbital"
                  : "grid grid-cols-2 place-items-center gap-2 overflow-y-auto py-5 sm:grid-cols-3"
              } ${
                selected ? "has-selection" : ""
              }`}
              aria-label={`${foundation.title} ${text.systems}`}
            >
              {systems.map((system, index) => (
                <SystemOrb
                  key={system.id}
                  system={system}
                  index={index}
                  selected={selected?.id === system.id}
                  dimmed={Boolean(selected && selected.id !== system.id)}
                  colors={generateSystemOrbPalette(
                    hue + index * 13,
                    preferences.harmony,
                    preferences.appearance,
                  )}
                  language={language}
                  onSelect={() => onSelectSystem(system.id)}
                  orbitStyle={
                    orbitalLayout ? getOrbitStyle(index) : undefined
                  }
                />
              ))}
              </div>
            </>
          )}
        </section>

        {selected && (
          <SystemQuickPreview
            foundationId={foundation.id}
            system={selected}
            language={language}
            onClose={onClearPreview}
          />
        )}

        {systems.length > 0 && !adding && (
          <div className="mt-6 text-center">
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
        {selected
          ? `${selected.title} ${text.selected}`
          : `${text.entered} ${foundation.title}`}
      </div>
    </main>
  );
}
