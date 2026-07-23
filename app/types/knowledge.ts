export type LifeAreaStatus = "active" | "stable" | "quiet";

export type SystemStatus = "active" | "stable" | "quiet";

export type ExperimentStatus =
  | "planned"
  | "active"
  | "completed"
  | "paused";

export type ExperimentOutcome =
  | "worked"
  | "partly-worked"
  | "did-not-work";

export type LifeArea = {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: LifeAreaStatus;
  accent: string;
  background: string;
};

export type LifeMap = {
  id: string;
  areaId: string;
  name: string;
  icon?: string;
  purpose: string;
  commonChallenges: string[];
  ideasToTry: string[];
};

export type PersonalSystem = {
  id: string;
  areaId: string;
  mapId?: string;

  name: string;
  purpose: string;
  currentVersion: string;

  status: SystemStatus;

  createdAt: string;
  updatedAt: string;
};

export type Experiment = {
  id: string;
  areaId: string;
  mapId?: string;
  systemId?: string;

  title: string;
  question: string;
  plan: string;

  startDate: string;
  endDate?: string;

  status: ExperimentStatus;
  outcome?: ExperimentOutcome;

  notes?: string;

  createdAt: string;
  updatedAt: string;
};

export type SystemInsight = {
  id: string;
  areaId: string;
  systemId?: string;
  experimentId?: string;

  text: string;

  createdAt: string;
  updatedAt: string;
};