export type ConnectionType =
  | "pattern"
  | "investment"
  | "value"
  | "boundary";

export type SystemConnection = {
  name: string;
  type: ConnectionType;
};

export type SystemObservation = {
  id: string;
  date: string;
  text: string;
  connections?: SystemConnection[];
};

export type SystemExperimentStatus =
  | "active"
  | "completed"
  | "paused";

export type SystemExperiment = {
  id: string;
  title: string;
  startedAt: string;
  completedAt?: string;
  status: SystemExperimentStatus;
  review?: string;
  decision?: "keep" | "modify" | "replace";
};

export type SystemLesson = {
  id: string;
  date: string;
  text: string;
};

export type SystemGratitude = {
  id: string;
  date: string;
  text: string;
};

export type SystemUnderstanding = {
  currentApproach: string;
  helps: string;
  obstacles: string;
  purpose: string;
  meetsNeed: string;
};

export type FocusAreaActionType =
  | "maintenance"
  | "investment";

export type FocusAreaCareAction = {
  id: string;
  title: string;
  type: FocusAreaActionType;
};

export type SystemCommitmentStatus =
  | "active"
  | "completed"
  | "extended"
  | "paused";

export type SystemCommitment = {
  id: string;
  startDate: string;
  reviewDate: string;
  plannedPeriodValue: number;
  plannedPeriodUnit: "days" | "weeks" | "months";
  selectedDays?: number[];
  flexibleSchedule?: boolean;
  plannedDurationMinutes?: number;
  status: SystemCommitmentStatus;
  parentCommitmentId?: string;
  createdAt: string;
  updatedAt: string;
};

export type SystemReview = {
  id: string;
  commitmentId: string;
  supportResult: "yes" | "somewhat" | "no";
  completedAsPlanned: boolean;
  completedDates?: string[];
  completedCount?: number;
  averageDurationMinutes?: number;
  totalDurationMinutes?: number;
  reviewedAt: string;
};

export type FocusAreaSystemStatus =
  | "evolving"
  | "testing"
  | "paused";

export type AwakeFocusArea = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;

  understanding: SystemUnderstanding;
  careActions?: FocusAreaCareAction[];
  color?: string;
  colorHue?: number;
  isMySystem?: boolean;
  status?: FocusAreaSystemStatus;
  commitments?: SystemCommitment[];
  reviews?: SystemReview[];
  currentCommitmentId?: string;
  lastUpdatedAt?: string;
  lastReviewedAt?: string;
  experiments: SystemExperiment[];
  lessons: SystemLesson[];
  gratitude: SystemGratitude[];
};

export type AwakeSystem = {
  id: string;
  title: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;

  understanding: SystemUnderstanding;

  observations: SystemObservation[];
  experiments: SystemExperiment[];
  lessons: SystemLesson[];
  gratitude: SystemGratitude[];

  focusAreas: AwakeFocusArea[];
  focusAreasInitialized: boolean;
};

export const defaultSystemTitles = [
  "Self Trust",
  "Financial",
  "Nutrition",
  "Fitness",
  "Energy",
  "Relationships",
  "Learning",
  "Work",
  "Boundaries",
  "Communication",
  "Home",
];

export function createAwakeSystem(title: string): AwakeSystem {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    title: title.trim(),
    createdAt: now,
    updatedAt: now,

    understanding: {
      currentApproach: "",
      helps: "",
      obstacles: "",
      purpose: "",
      meetsNeed: "",
    },

    observations: [],
    experiments: [],
    lessons: [],
    gratitude: [],

    focusAreas: [],
    focusAreasInitialized: false,
  };
}

export function createAwakeFocusArea(
  title: string
): AwakeFocusArea {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    title: title.trim(),
    createdAt: now,
    updatedAt: now,

    understanding: {
      currentApproach: "",
      helps: "",
      obstacles: "",
      purpose: "",
      meetsNeed: "",
    },

    color: "#7c9a82",
    colorHue: 139,
    isMySystem: false,
    status: "evolving",
    commitments: [],
    reviews: [],
    lastUpdatedAt: now,

    experiments: [],
    lessons: [],
    gratitude: [],
  };
}
