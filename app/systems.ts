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
  };
}