export type FoundationView = "orb" | "list";

export type FoundationViewPreferences = {
  defaultView: FoundationView;
  byFoundation: Record<string, FoundationView>;
};

export const FOUNDATION_VIEW_STORAGE_KEY = "awake-foundation-view";

export const defaultFoundationViewPreferences: FoundationViewPreferences = {
  defaultView: "orb",
  byFoundation: {},
};

export function loadFoundationViewPreferences(): FoundationViewPreferences {
  if (typeof window === "undefined") return defaultFoundationViewPreferences;
  try {
    const raw = localStorage.getItem(FOUNDATION_VIEW_STORAGE_KEY);
    if (!raw) return defaultFoundationViewPreferences;
    if (raw === "list" || raw === "orb" || raw === "orbs") {
      return {
        defaultView: raw === "list" ? "list" : "orb",
        byFoundation: {},
      };
    }
    const parsed = JSON.parse(raw) as Partial<FoundationViewPreferences>;
    const byFoundation = Object.fromEntries(
      Object.entries(parsed.byFoundation ?? {}).filter(
        (entry): entry is [string, FoundationView] =>
          entry[1] === "orb" || entry[1] === "list",
      ),
    );
    return {
      defaultView: parsed.defaultView === "list" ? "list" : "orb",
      byFoundation,
    };
  } catch {
    return defaultFoundationViewPreferences;
  }
}

export function saveFoundationViewPreferences(
  preferences: FoundationViewPreferences,
) {
  localStorage.setItem(
    FOUNDATION_VIEW_STORAGE_KEY,
    JSON.stringify(preferences),
  );
}

