"use client";

import { useLayoutEffect } from "react";

import {
  generateAwakePalette,
  loadColorPreferences,
} from "../colorPalette";

export const AWAKE_APPEARANCE_EVENT =
  "awake-appearance-change";

function applyAppearance() {
  const preferences = loadColorPreferences();
  const palette = generateAwakePalette(
    preferences.anchorHue,
    preferences.harmony,
    preferences.appearance,
  );
  const root = document.documentElement;

  root.dataset.awakeAppearance = preferences.appearance;
  root.style.colorScheme = preferences.appearance;
  root.style.setProperty(
    "--awake-page-background",
    palette.pageBackground,
  );
  root.style.setProperty("--awake-page-tint", palette.pageTint);
  root.style.setProperty("--awake-surface", palette.mutedSurface);
  root.style.setProperty(
    "--awake-surface-elevated",
    preferences.appearance === "dark"
      ? `color-mix(in srgb, ${palette.mutedSurface} 82%, white)`
      : `color-mix(in srgb, ${palette.mutedSurface} 82%, white)`,
  );
  root.style.setProperty(
    "--awake-surface-subtle",
    `color-mix(in srgb, ${palette.mutedSurface} 76%, transparent)`,
  );
  root.style.setProperty("--awake-text", palette.text);
  root.style.setProperty(
    "--awake-text-secondary",
    palette.secondaryText,
  );
  root.style.setProperty(
    "--awake-text-muted",
    `color-mix(in srgb, ${palette.secondaryText} 72%, transparent)`,
  );
  root.style.setProperty("--awake-accent", palette.primaryAccent);
  root.style.setProperty(
    "--awake-accent-contrast",
    palette.buttonText,
  );
  root.style.setProperty(
    "--awake-accent-soft",
    `color-mix(in srgb, ${palette.primaryAccent} 14%, ${palette.mutedSurface})`,
  );
  root.style.setProperty("--awake-companion", palette.companion);
  root.style.setProperty("--awake-border", palette.border);
  root.style.setProperty(
    "--awake-border-strong",
    `color-mix(in srgb, ${palette.border} 55%, ${palette.text})`,
  );
  root.style.setProperty("--awake-focus", palette.focus);
  root.style.setProperty("--awake-navigation", palette.navigation);
  root.style.setProperty("--awake-orb-highlight", palette.orbHighlight);
  root.style.setProperty("--awake-orb-glow", palette.orbGlow);
  root.style.setProperty(
    "--awake-inactive",
    palette.inactiveAmber,
  );
}

export default function AwakeAppearanceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useLayoutEffect(() => {
    applyAppearance();
    const handleChange = () => applyAppearance();
    window.addEventListener("storage", handleChange);
    window.addEventListener(AWAKE_APPEARANCE_EVENT, handleChange);
    return () => {
      window.removeEventListener("storage", handleChange);
      window.removeEventListener(
        AWAKE_APPEARANCE_EVENT,
        handleChange,
      );
    };
  }, []);

  return children;
}
