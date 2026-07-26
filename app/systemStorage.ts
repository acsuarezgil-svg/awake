import type { AwakeSystem } from "./systems";
import { AWAKE_SYSTEMS_KEY } from "./storageKeys";
import { colorToHue } from "./colorPalette";

export { AWAKE_SYSTEMS_KEY } from "./storageKeys";

const systemColors = [
  "#7c9a82",
  "#8b86a8",
  "#ad846f",
  "#668e9b",
  "#9a8b66",
  "#8f7895",
];

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

    return parsed.map((system, systemIndex) => ({
      ...system,
      observations: system.observations ?? [],
      experiments: system.experiments ?? [],
      lessons: system.lessons ?? [],
      gratitude: system.gratitude ?? [],
      focusAreas: (system.focusAreas ?? []).map(
        (focusArea: AwakeSystem["focusAreas"][number], focusIndex: number) => ({
          ...focusArea,
          understanding: {
            currentApproach:
              focusArea.understanding?.currentApproach ?? "",
            helps: focusArea.understanding?.helps ?? "",
            obstacles:
              focusArea.understanding?.obstacles ?? "",
            purpose:
              focusArea.understanding?.purpose ?? "",
            meetsNeed:
              focusArea.understanding?.meetsNeed ?? "",
          },
          color:
            focusArea.color ??
            systemColors[
              (systemIndex + focusIndex) %
                systemColors.length
            ],
          colorHue:
            focusArea.colorHue ??
            colorToHue(
              focusArea.color ??
                systemColors[
                  (systemIndex + focusIndex) %
                    systemColors.length
                ],
            ),
          isMySystem: focusArea.isMySystem ?? false,
          status: focusArea.status ?? "evolving",
          commitments: focusArea.commitments ?? [],
          reviews: focusArea.reviews ?? [],
          lastUpdatedAt:
            focusArea.lastUpdatedAt ??
            focusArea.updatedAt ??
            focusArea.createdAt,
          experiments: focusArea.experiments ?? [],
          lessons: focusArea.lessons ?? [],
          gratitude: focusArea.gratitude ?? [],
        }),
      ),
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
