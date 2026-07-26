export type AwakeHarmony =
  | "balanced"
  | "softContrast"
  | "closeHarmony";

export type AwakeAppearance = "light" | "dark";

export type AwakeColorPreferences = {
  anchorHue: number;
  harmony: AwakeHarmony;
  appearance: AwakeAppearance;
};

export type AwakePalette = {
  primaryAccent: string;
  companion: string;
  pageBackground: string;
  pageTint: string;
  orbHighlight: string;
  orbGlow: string;
  inactiveAmber: string;
  text: string;
  secondaryText: string;
  buttonText: string;
  lightText: string;
  border: string;
  mutedSurface: string;
  navigation: string;
  focus: string;
};

export type SystemOrbPalette = {
  main: string;
  highlight: string;
  glow: string;
  quiet: string;
  paused: string;
  inactiveAmber: string;
};

export const AWAKE_COLOR_PREFERENCES_KEY =
  "awake-color-preferences";

export const defaultColorPreferences: AwakeColorPreferences = {
  anchorHue: 154,
  harmony: "softContrast",
  appearance: "light",
};

const legacyThemePreferences: Record<
  string,
  Pick<AwakeColorPreferences, "anchorHue" | "appearance">
> = {
  roseSage: { anchorHue: 348, appearance: "light" },
  clayMoss: { anchorHue: 18, appearance: "light" },
  lavenderMint: { anchorHue: 258, appearance: "light" },
  yinYang: { anchorHue: 220, appearance: "light" },
  ocean: { anchorHue: 210, appearance: "light" },
  forest: { anchorHue: 142, appearance: "light" },
  sunset: { anchorHue: 24, appearance: "light" },
  midnight: { anchorHue: 196, appearance: "dark" },
};

function normalizeHue(hue: number) {
  return ((Math.round(hue) % 360) + 360) % 360;
}

function companionHue(hue: number, harmony: AwakeHarmony) {
  if (harmony === "balanced") return normalizeHue(hue + 180);
  if (harmony === "closeHarmony") return normalizeHue(hue + 38);
  return normalizeHue(hue + 150);
}

function hsl(hue: number, saturation: number, lightness: number) {
  return `hsl(${normalizeHue(hue)} ${saturation}% ${lightness}%)`;
}

function hslToRgb(
  hue: number,
  saturation: number,
  lightness: number,
) {
  const h = normalizeHue(hue) / 360;
  const s = saturation / 100;
  const l = lightness / 100;
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const channel = (offset: number) => {
    let value = h + offset;
    if (value < 0) value += 1;
    if (value > 1) value -= 1;
    if (value < 1 / 6) return p + (q - p) * 6 * value;
    if (value < 1 / 2) return q;
    if (value < 2 / 3) return p + (q - p) * (2 / 3 - value) * 6;
    return p;
  };
  return [channel(1 / 3), channel(0), channel(-1 / 3)];
}

function luminance(rgb: number[]) {
  const channels = rgb.map((channel) =>
    channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return (
    channels[0] * 0.2126 +
    channels[1] * 0.7152 +
    channels[2] * 0.0722
  );
}

function contrast(first: number[], second: number[]) {
  const lighter = Math.max(luminance(first), luminance(second));
  const darker = Math.min(luminance(first), luminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}

function readableButtonText(
  hue: number,
  saturation: number,
  lightness: number,
) {
  const background = hslToRgb(hue, saturation, lightness);
  const dark = hslToRgb(hue, 18, 13);
  const light = hslToRgb(hue, 12, 98);
  return contrast(background, dark) >= contrast(background, light)
    ? hsl(hue, 18, 13)
    : hsl(hue, 12, 98);
}

export function generateAwakePalette(
  anchorHue: number,
  harmony: AwakeHarmony,
  appearance: AwakeAppearance,
): AwakePalette {
  const hue = normalizeHue(anchorHue);
  const companion = companionHue(hue, harmony);
  const dark = appearance === "dark";
  const accentLightness = dark ? 68 : 38;
  const accentSaturation = dark ? 38 : 42;

  return {
    primaryAccent: hsl(hue, accentSaturation, accentLightness),
    companion: hsl(companion, dark ? 32 : 35, dark ? 68 : 52),
    pageBackground: dark
      ? `radial-gradient(circle at 50% 14%, ${hsl(
          hue,
          20,
          17,
        )} 0%, ${hsl(companion, 14, 10)} 48%, ${hsl(
          hue,
          12,
          8,
        )} 100%)`
      : `radial-gradient(circle at 50% 14%, ${hsl(
          hue,
          42,
          98,
        )} 0%, ${hsl(companion, 28, 96)} 48%, ${hsl(
          hue,
          22,
          94,
        )} 100%)`,
    pageTint: hsl(hue, dark ? 18 : 34, dark ? 16 : 96),
    orbHighlight: hsl(hue, dark ? 42 : 48, dark ? 84 : 91),
    orbGlow: hsl(companion, dark ? 40 : 38, dark ? 67 : 55),
    inactiveAmber: hsl(43, dark ? 30 : 38, dark ? 48 : 67),
    text: dark ? hsl(hue, 10, 93) : hsl(hue, 16, 15),
    secondaryText: dark ? hsl(hue, 10, 70) : hsl(hue, 10, 39),
    buttonText: readableButtonText(
      hue,
      accentSaturation,
      accentLightness,
    ),
    lightText: hsl(hue, 12, 98),
    border: dark ? hsl(hue, 16, 27) : hsl(hue, 17, 83),
    mutedSurface: dark
      ? hsl(hue, 15, 15)
      : hsl(hue, 34, 98),
    navigation: hsl(companion, dark ? 34 : 38, dark ? 70 : 38),
    focus: hsl(companion, dark ? 46 : 52, dark ? 72 : 37),
  };
}

export function generateSystemOrbPalette(
  anchorHue: number,
  harmony: AwakeHarmony,
  appearance: AwakeAppearance,
): SystemOrbPalette {
  const hue = normalizeHue(anchorHue);
  const companion = companionHue(hue, harmony);
  const dark = appearance === "dark";

  return {
    main: hsl(hue, dark ? 42 : 44, dark ? 62 : 47),
    highlight: hsl(hue, dark ? 38 : 48, dark ? 84 : 88),
    glow: hsl(companion, dark ? 40 : 42, dark ? 68 : 56),
    quiet: hsl(hue, dark ? 20 : 23, dark ? 42 : 68),
    paused: hsl(hue, 11, dark ? 36 : 62),
    inactiveAmber: hsl(43, dark ? 28 : 36, dark ? 48 : 68),
  };
}

const foundationHueOffsets: Record<string, number> = {
  health: 0,
  financial: 42,
  finances: 42,
  home: 24,
  learning: 72,
  relationships: 132,
  energy: 188,
  work: 215,
  creativity: 292,
  boundaries: 330,
  communication: 108,
};

export function getFoundationHue(
  title: string,
  awakeAnchorHue: number,
) {
  const knownOffset =
    foundationHueOffsets[title.trim().toLowerCase()];
  if (knownOffset !== undefined) {
    return normalizeHue(awakeAnchorHue + knownOffset);
  }
  const stableOffset = Array.from(title).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );
  return normalizeHue(awakeAnchorHue + (stableOffset % 240));
}

export function loadColorPreferences(): AwakeColorPreferences {
  if (typeof window === "undefined") return defaultColorPreferences;

  try {
    const stored = localStorage.getItem(
      AWAKE_COLOR_PREFERENCES_KEY,
    );
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<AwakeColorPreferences>;
      return {
        anchorHue:
          typeof parsed.anchorHue === "number"
            ? normalizeHue(parsed.anchorHue)
            : defaultColorPreferences.anchorHue,
        harmony:
          parsed.harmony === "balanced" ||
          parsed.harmony === "softContrast" ||
          parsed.harmony === "closeHarmony"
            ? parsed.harmony
            : defaultColorPreferences.harmony,
        appearance:
          parsed.appearance === "dark" ? "dark" : "light",
      };
    }

    const legacyTheme = localStorage.getItem("awake-wheel-theme");
    const legacy = legacyTheme
      ? legacyThemePreferences[legacyTheme]
      : undefined;
    return {
      ...defaultColorPreferences,
      ...legacy,
    };
  } catch {
    return defaultColorPreferences;
  }
}

export function saveColorPreferences(
  preferences: AwakeColorPreferences,
) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    AWAKE_COLOR_PREFERENCES_KEY,
    JSON.stringify(preferences),
  );
  window.dispatchEvent(new Event("awake-appearance-change"));
}

export function colorToHue(color?: string) {
  if (!color?.startsWith("#") || color.length !== 7) {
    return defaultColorPreferences.anchorHue;
  }
  const red = Number.parseInt(color.slice(1, 3), 16) / 255;
  const green = Number.parseInt(color.slice(3, 5), 16) / 255;
  const blue = Number.parseInt(color.slice(5, 7), 16) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  if (delta === 0) return defaultColorPreferences.anchorHue;
  let hue = 0;
  if (max === red) hue = ((green - blue) / delta) % 6;
  if (max === green) hue = (blue - red) / delta + 2;
  if (max === blue) hue = (red - green) / delta + 4;
  return normalizeHue(hue * 60);
}
