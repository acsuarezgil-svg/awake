export type LearningStageLevel =
  | "beginner"
  | "intermediate"
  | "advanced";

export type LearningModule = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly estimatedMinutes: number;
  readonly outcomes: readonly string[];
};

export type PracticeBlock = {
  readonly id: string;
  readonly title: string;
  readonly minutes: number;
  readonly guidance: string;
};

export type LessonPracticeActivity = {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly minutes?: number;
  readonly order: number;
};

export type LessonResource = {
  readonly id: string;
  readonly title: string;
  readonly type: "text" | "video" | "audio" | "sheet-music" | "link";
  readonly reference?: string;
};

export type LearningLesson = {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly order: number;
  readonly estimatedMinutes: number;
  readonly focusHighlights: readonly string[];
  readonly practiceActivities: readonly LessonPracticeActivity[];
  readonly readinessChecks?: readonly string[];
  readonly resources?: readonly LessonResource[];
};

export type CurriculumSection = {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly order: number;
  readonly lessons: readonly LearningLesson[];
};

export type StageModification = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly sessionsPerWeek?: number;
  readonly minutesPerSession?: number;
  readonly suggestedDays?: readonly string[];
};

export type KnowledgePackStage = {
  readonly id: string;
  readonly level: LearningStageLevel;
  readonly title: string;
  readonly description: string;
  readonly estimatedDuration: string;
  readonly recommendedSessionsPerWeek: number;
  readonly recommendedMinutesPerSession: number;
  readonly suggestedDays: readonly string[];
  readonly outcomes: readonly string[];
  readonly learningPath: readonly LearningModule[];
  readonly curriculumSections: readonly CurriculumSection[];
  readonly practiceTemplate: readonly PracticeBlock[];
  readonly readinessChecks: readonly string[];
  readonly modifications: readonly StageModification[];
};

export type KnowledgePack = {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly subject: string;
  readonly stages: readonly KnowledgePackStage[];
};

/**
 * A future, user-owned copy made from a curated pack. It deliberately does not
 * extend KnowledgePack so personal changes can never mutate the recommendation.
 */
export type UserLearningSystem = {
  id: string;
  sourcePackId: string;
  sourcePackTitle: string;
  sourceStageId: string;
  title: string;
  level: LearningStageLevel;
  stageTitle: string;
  stageDescription: string;
  estimatedDuration: string;
  status: "active";
  createdAt: string;
  updatedAt: string;
  sessionsPerWeek: number;
  minutesPerSession: number;
  suggestedDays: string[];
  learningPath: LearningModule[];
  practiceTemplate: PracticeBlock[];
  outcomes: string[];
  readinessChecks: string[];
  modifications: StageModification[];
  currentModuleId: string;
  completedModuleIds: string[];
  curriculumSections?: CurriculumSection[];
  currentCurriculumSectionId?: string;
  currentLessonId?: string;
  completedLessonIds?: string[];
};
