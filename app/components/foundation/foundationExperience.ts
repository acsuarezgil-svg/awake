import type { AwakeFocusArea, AwakeSystem } from "../../systems";
import {
  foundationExperienceTranslations,
  type Language,
} from "../../translations";

export type HomeViewState =
  | { mode: "world" }
  | { mode: "foundation"; foundationId: string }
  | {
      mode: "system-preview";
      foundationId: string;
      systemId: string;
    };

export function getFoundationSystems(foundation: AwakeSystem) {
  return foundation.focusAreas ?? [];
}

function mostRecentActivity(system: AwakeFocusArea) {
  const dates = [
    system.lastReviewedAt,
    ...(system.reviews ?? []).map((review) => review.reviewedAt),
    ...system.experiments.map(
      (experiment) => experiment.completedAt ?? experiment.startedAt,
    ),
    ...system.lessons.map((lesson) => lesson.date),
    ...system.gratitude.map((entry) => entry.date),
  ].filter((value): value is string => Boolean(value));

  return dates
    .map((value) => new Date(value))
    .filter((value) => !Number.isNaN(value.getTime()))
    .sort((a, b) => b.getTime() - a.getTime())[0];
}

export function getLastSupportedText(
  system: AwakeFocusArea,
  language: Language,
  now = new Date(),
) {
  const text = foundationExperienceTranslations[language];
  const activity = mostRecentActivity(system);
  if (!activity) return text.noSupport;

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const activityDay = new Date(
    activity.getFullYear(),
    activity.getMonth(),
    activity.getDate(),
  );
  const days = Math.max(
    0,
    Math.round((today.getTime() - activityDay.getTime()) / 86_400_000),
  );

  if (days === 0) return text.supportedToday;
  if (days === 1) return text.supportedYesterday;
  return text.supportedDaysAgo(days);
}

export function getSystemPreview(system: AwakeFocusArea) {
  return {
    description:
      system.understanding?.purpose ||
      system.understanding?.meetsNeed ||
      "",
    care: (system.careActions ?? []).slice(0, 3),
  };
}
