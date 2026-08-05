import { AWAKE_LEARNING_SYSTEMS_KEY } from "./storageKeys";
import type {
  KnowledgePack,
  KnowledgePackStage,
  LearningModule,
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

export function loadLearningSystems(): UserLearningSystem[] {
  if (typeof window === "undefined") return [];

  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(AWAKE_LEARNING_SYSTEMS_KEY) ?? "[]",
    );
    return Array.isArray(parsed)
      ? parsed.filter(isStoredLearningSystem)
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

export function createLearningSystem(
  pack: KnowledgePack,
  stage: KnowledgePackStage,
  selectedDays: readonly string[],
  minutesPerSession: number,
): UserLearningSystem {
  const now = new Date().toISOString();

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
