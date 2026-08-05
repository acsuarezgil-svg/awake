import { AWAKE_LEARNING_SYSTEMS_KEY } from "./storageKeys";
import type {
  CurriculumSection,
  KnowledgePack,
  KnowledgePackStage,
  LearningLesson,
  LearningModule,
  LessonPracticeActivity,
  LessonResource,
  PracticeBlock,
  StageModification,
  UserLearningSystem,
} from "./types/learning";

export { AWAKE_LEARNING_SYSTEMS_KEY } from "./storageKeys";

function isStoredLearningSystem(value: unknown): value is UserLearningSystem {
  if (!value || typeof value !== "object") return false;

  const item = value as Partial<UserLearningSystem>;
  return (
    typeof item.id === "string" &&
    typeof item.sourcePackId === "string" &&
    typeof item.sourcePackTitle === "string" &&
    typeof item.sourceStageId === "string" &&
    typeof item.title === "string" &&
    (item.level === "beginner" ||
      item.level === "intermediate" ||
      item.level === "advanced") &&
    typeof item.stageTitle === "string" &&
    typeof item.stageDescription === "string" &&
    typeof item.estimatedDuration === "string" &&
    item.status === "active" &&
    typeof item.createdAt === "string" &&
    typeof item.updatedAt === "string" &&
    typeof item.sessionsPerWeek === "number" &&
    typeof item.minutesPerSession === "number" &&
    Array.isArray(item.suggestedDays) &&
    Array.isArray(item.learningPath) &&
    Array.isArray(item.practiceTemplate) &&
    Array.isArray(item.outcomes) &&
    Array.isArray(item.readinessChecks) &&
    Array.isArray(item.modifications) &&
    typeof item.currentModuleId === "string" &&
    Array.isArray(item.completedModuleIds)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function normalizeActivity(
  value: unknown,
): LessonPracticeActivity | undefined {
  if (!isRecord(value)) return undefined;
  if (
    typeof value.id !== "string" ||
    typeof value.title !== "string" ||
    typeof value.order !== "number"
  ) return undefined;

  return {
    id: value.id,
    title: value.title,
    order: value.order,
    ...(typeof value.description === "string"
      ? { description: value.description }
      : {}),
    ...(typeof value.minutes === "number" && value.minutes > 0
      ? { minutes: value.minutes }
      : {}),
  };
}

function normalizeResource(value: unknown): LessonResource | undefined {
  if (!isRecord(value)) return undefined;
  const validTypes = ["text", "video", "audio", "sheet-music", "link"];
  if (
    typeof value.id !== "string" ||
    typeof value.title !== "string" ||
    typeof value.type !== "string" ||
    !validTypes.includes(value.type)
  ) return undefined;

  return {
    id: value.id,
    title: value.title,
    type: value.type as LessonResource["type"],
    ...(typeof value.reference === "string"
      ? { reference: value.reference }
      : {}),
  };
}

function normalizeLesson(value: unknown): LearningLesson | undefined {
  if (!isRecord(value)) return undefined;
  if (
    typeof value.id !== "string" ||
    typeof value.title !== "string" ||
    typeof value.order !== "number" ||
    typeof value.estimatedMinutes !== "number" ||
    !Array.isArray(value.focusHighlights) ||
    !Array.isArray(value.practiceActivities)
  ) return undefined;

  const focusHighlights = value.focusHighlights
    .filter((item): item is string => typeof item === "string" && item.length > 0)
    .slice(0, 3);
  const practiceActivities = value.practiceActivities
    .map(normalizeActivity)
    .filter((item): item is LessonPracticeActivity => Boolean(item))
    .sort((a, b) => a.order - b.order);
  if (focusHighlights.length === 0 || practiceActivities.length === 0) {
    return undefined;
  }

  const readinessChecks = Array.isArray(value.readinessChecks)
    ? value.readinessChecks.filter(
        (item): item is string => typeof item === "string" && item.length > 0,
      )
    : undefined;
  const resources = Array.isArray(value.resources)
    ? value.resources
        .map(normalizeResource)
        .filter((item): item is LessonResource => Boolean(item))
    : undefined;

  return {
    id: value.id,
    title: value.title,
    order: value.order,
    estimatedMinutes: value.estimatedMinutes,
    focusHighlights,
    practiceActivities,
    ...(typeof value.description === "string"
      ? { description: value.description }
      : {}),
    ...(readinessChecks?.length ? { readinessChecks } : {}),
    ...(resources?.length ? { resources } : {}),
  };
}

function normalizeCurriculum(value: unknown): CurriculumSection[] {
  if (!Array.isArray(value)) return [];

  const sections: CurriculumSection[] = [];
  for (const section of value) {
    if (
      !isRecord(section) ||
      typeof section.id !== "string" ||
      typeof section.title !== "string" ||
      typeof section.order !== "number" ||
      !Array.isArray(section.lessons)
    ) continue;

    const lessons = section.lessons
      .map(normalizeLesson)
      .filter((item): item is LearningLesson => Boolean(item))
      .sort((a, b) => a.order - b.order);
    if (lessons.length === 0) continue;

    sections.push({
      id: section.id,
      title: section.title,
      order: section.order,
      lessons,
      ...(typeof section.description === "string"
        ? { description: section.description }
        : {}),
    });
  }

  return sections.sort((a, b) => a.order - b.order);
}

function fallbackCurriculum(system: UserLearningSystem): CurriculumSection[] {
  const activities = system.practiceTemplate.map((block, index) => ({
    id: `${system.id}-legacy-activity-${block.id}`,
    title: block.title,
    description: block.guidance,
    minutes: block.minutes,
    order: index + 1,
  }));

  return [{
    id: `${system.id}-legacy-section`,
    title: "Learning path",
    description: "Your original journey, organized into lessons.",
    order: 1,
    lessons: system.learningPath.map((module, index) => ({
      id: `${system.id}-legacy-lesson-${module.id}`,
      title: module.title,
      description: module.description,
      order: index + 1,
      estimatedMinutes: system.minutesPerSession,
      focusHighlights: [module.title, ...module.outcomes].slice(0, 3),
      practiceActivities: activities.map((item) => ({ ...item })),
    })),
  }];
}

export function normalizeLearningSystem(
  system: UserLearningSystem,
): UserLearningSystem {
  const curriculumSections = normalizeCurriculum(system.curriculumSections);
  const safeCurriculum = curriculumSections.length > 0
    ? curriculumSections
    : fallbackCurriculum(system);
  const firstSection = safeCurriculum[0];
  const section = safeCurriculum.find(
    (item) => item.id === system.currentCurriculumSectionId,
  ) ?? firstSection;
  const lessonIds = new Set(
    safeCurriculum.flatMap((item) => item.lessons.map((lesson) => lesson.id)),
  );
  const lesson = section?.lessons.find(
    (item) => item.id === system.currentLessonId,
  ) ?? section?.lessons[0];

  return {
    ...system,
    curriculumSections: safeCurriculum,
    currentCurriculumSectionId: section?.id ?? "",
    currentLessonId: lesson?.id ?? "",
    completedLessonIds: Array.isArray(system.completedLessonIds)
      ? system.completedLessonIds.filter(
          (id): id is string => typeof id === "string" && lessonIds.has(id),
        )
      : [],
  };
}

export function loadLearningSystems(): UserLearningSystem[] {
  if (typeof window === "undefined") return [];

  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(AWAKE_LEARNING_SYSTEMS_KEY) ?? "[]",
    );
    return Array.isArray(parsed)
      ? parsed.filter(isStoredLearningSystem).map(normalizeLearningSystem)
      : [];
  } catch {
    return [];
  }
}

function saveLearningSystems(systems: UserLearningSystem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    AWAKE_LEARNING_SYSTEMS_KEY,
    JSON.stringify(systems),
  );
}

function copyModules(modules: readonly LearningModule[]): LearningModule[] {
  return modules.map((module) => ({
    ...module,
    outcomes: [...module.outcomes],
  }));
}

function copyPracticeBlocks(
  blocks: readonly PracticeBlock[],
): PracticeBlock[] {
  return blocks.map((block) => ({ ...block }));
}

function copyModifications(
  modifications: readonly StageModification[],
): StageModification[] {
  return modifications.map((modification) => ({
    ...modification,
    suggestedDays: modification.suggestedDays
      ? [...modification.suggestedDays]
      : undefined,
  }));
}

function copyCurriculum(
  sections: readonly CurriculumSection[],
): CurriculumSection[] {
  return sections.map((section) => ({
    ...section,
    lessons: section.lessons.map((lesson) => ({
      ...lesson,
      focusHighlights: [...lesson.focusHighlights],
      practiceActivities: lesson.practiceActivities.map((item) => ({ ...item })),
      readinessChecks: lesson.readinessChecks
        ? [...lesson.readinessChecks]
        : undefined,
      resources: lesson.resources
        ? lesson.resources.map((resource) => ({ ...resource }))
        : undefined,
    })),
  }));
}

export function createLearningSystem(
  pack: KnowledgePack,
  stage: KnowledgePackStage,
  selectedDays: readonly string[],
  minutesPerSession: number,
): UserLearningSystem {
  const now = new Date().toISOString();
  const curriculumSections = copyCurriculum(stage.curriculumSections);
  const currentSection = [...curriculumSections].sort(
    (a, b) => a.order - b.order,
  )[0];
  const currentLesson = currentSection
    ? [...currentSection.lessons].sort((a, b) => a.order - b.order)[0]
    : undefined;

  return {
    id: crypto.randomUUID(),
    sourcePackId: pack.id,
    sourcePackTitle: pack.title,
    sourceStageId: stage.id,
    title: `${pack.title} · ${stage.title}`,
    level: stage.level,
    stageTitle: stage.title,
    stageDescription: stage.description,
    estimatedDuration: stage.estimatedDuration,
    status: "active",
    createdAt: now,
    updatedAt: now,
    sessionsPerWeek: selectedDays.length,
    minutesPerSession,
    suggestedDays: [...selectedDays],
    learningPath: copyModules(stage.learningPath),
    practiceTemplate: copyPracticeBlocks(stage.practiceTemplate),
    outcomes: [...stage.outcomes],
    readinessChecks: [...stage.readinessChecks],
    modifications: copyModifications(stage.modifications),
    currentModuleId: stage.learningPath[0]?.id ?? "",
    completedModuleIds: [],
    curriculumSections,
    currentCurriculumSectionId: currentSection?.id ?? "",
    currentLessonId: currentLesson?.id ?? "",
    completedLessonIds: [],
  };
}

export function appendLearningSystem(
  system: UserLearningSystem,
): void {
  saveLearningSystems([...loadLearningSystems(), system]);
}

export function findLearningSystem(
  id: string,
): UserLearningSystem | undefined {
  return loadLearningSystems().find((system) => system.id === id);
}
