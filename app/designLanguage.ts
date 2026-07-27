import type {
  AwakeAppearance,
  AwakeHarmony,
} from "./colorPalette";

export const awakePrinciples = [
  "Nature over software",
  "Calm over productivity",
  "Atmosphere over themes",
  "Light over shadows",
  "Breathing over bouncing",
  "Foundations over features",
  "Systems over tasks",
  "Reflection over streaks",
  "Simplicity over configuration",
] as const;

export type AwakeAtmosphereId =
  | "forest"
  | "ocean"
  | "dawn"
  | "midnight"
  | "hearth"
  | "bloom";

export type AwakeAtmosphere = {
  id: AwakeAtmosphereId;
  name: string;
  character: string;
  anchorHue: number;
  harmony: AwakeHarmony;
  appearance: AwakeAppearance;
};

export const awakeAtmospheres: readonly AwakeAtmosphere[] = [
  {
    id: "forest",
    name: "Forest",
    character: "Grounded and restorative",
    anchorHue: 146,
    harmony: "softContrast",
    appearance: "light",
  },
  {
    id: "ocean",
    name: "Ocean",
    character: "Spacious and steady",
    anchorHue: 205,
    harmony: "closeHarmony",
    appearance: "light",
  },
  {
    id: "dawn",
    name: "Dawn",
    character: "Warm and hopeful",
    anchorHue: 28,
    harmony: "softContrast",
    appearance: "light",
  },
  {
    id: "midnight",
    name: "Midnight",
    character: "Quiet and enveloping",
    anchorHue: 226,
    harmony: "closeHarmony",
    appearance: "dark",
  },
  {
    id: "hearth",
    name: "Hearth",
    character: "Held and familiar",
    anchorHue: 18,
    harmony: "balanced",
    appearance: "light",
  },
  {
    id: "bloom",
    name: "Bloom",
    character: "Tender and expressive",
    anchorHue: 326,
    harmony: "softContrast",
    appearance: "light",
  },
] as const;

export const awakeTypeScale = {
  display: "clamp(2.25rem, 7vw, 3.5rem)",
  pageTitle: "clamp(1.875rem, 5vw, 2.5rem)",
  sectionTitle: "1.375rem",
  cardTitle: "1rem",
  body: "1rem",
  supporting: "0.875rem",
  label: "0.75rem",
} as const;

export const awakeSpaceScale = {
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
} as const;

export const awakeMotion = {
  settle: "180ms",
  flow: "320ms",
  breathe: "7.5s",
  hold: "750ms",
} as const;

export const awakeComponentClasses = {
  page: "awake-page",
  surface: "awake-surface",
  card: "awake-card",
  primaryButton: "awake-button awake-button-primary",
  secondaryButton: "awake-button awake-button-secondary",
  quietButton: "awake-button awake-button-quiet",
  dangerButton: "awake-button awake-button-danger",
  chip: "awake-chip",
  navigation: "awake-navigation",
  emptyState: "awake-empty-state",
  orb: "awake-orb",
} as const;

export const awakePillars = [
  {
    id: "breathe",
    name: "Breathe",
    purpose: "Return to yourself",
    language: ["Pause", "Breathe", "Return"],
  },
  {
    id: "rhythm",
    name: "Rhythm",
    purpose: "Return to your pattern",
    language: ["Listen", "Flow", "Again"],
  },
  {
    id: "world",
    name: "World",
    purpose: "Understand your life",
    language: ["Notice", "Understand", "Choose"],
  },
  {
    id: "journey",
    name: "Journey",
    purpose: "Notice how you grow",
    language: ["Observe", "Reflect", "Grow"],
  },
] as const;
