import type {
  PersonalSystem,
  SystemReflection,
} from "../types/systems";

const SYSTEMS_KEY = "awake-systems";
const REFLECTIONS_KEY = "awake-system-reflections";

function safelyParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function getStoredSystems(): PersonalSystem[] {
  if (typeof window === "undefined") return [];

  return safelyParse<PersonalSystem[]>(
    localStorage.getItem(SYSTEMS_KEY),
    [],
  );
}

export function saveStoredSystems(systems: PersonalSystem[]): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(SYSTEMS_KEY, JSON.stringify(systems));
}

export function getStoredSystemReflections(): SystemReflection[] {
  if (typeof window === "undefined") return [];

  return safelyParse<SystemReflection[]>(
    localStorage.getItem(REFLECTIONS_KEY),
    [],
  );
}

export function saveStoredSystemReflections(
  reflections: SystemReflection[],
): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    REFLECTIONS_KEY,
    JSON.stringify(reflections),
  );
}