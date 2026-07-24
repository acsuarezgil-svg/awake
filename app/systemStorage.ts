import type { AwakeSystem } from "./systems";

export const AWAKE_SYSTEMS_KEY = "awake-systems";

export function loadAwakeSystems(): AwakeSystem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const saved = localStorage.getItem(AWAKE_SYSTEMS_KEY);

    if (!saved) {
      return [];
    }

    const parsed: unknown = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((system) => ({
      ...system,
      focusAreas: system.focusAreas ?? [],
    })) as AwakeSystem[];
  } catch {
    return [];
  }
}

export function saveAwakeSystems(
  systems: AwakeSystem[]
) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    AWAKE_SYSTEMS_KEY,
    JSON.stringify(systems)
  );
}

export function findAwakeSystem(
  systems: AwakeSystem[],
  systemId: string
) {
  return systems.find(
    (system) => system.id === systemId
  );
}

export function updateAwakeSystem(
  systems: AwakeSystem[],
  updatedSystem: AwakeSystem
) {
  return systems.map((system) =>
    system.id === updatedSystem.id
      ? {
          ...updatedSystem,
          updatedAt: new Date().toISOString(),
        }
      : system
  );
}