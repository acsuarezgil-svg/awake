export type FoundationId =
  | "health"
  | "home"
  | "money"
  | "relationships"
  | "learning"
  | "work"
  | "transportation"
  | "recreation";

export type SystemStatus = "active" | "stable" | "quiet";

export type SystemActionType = "maintenance" | "investment";

export type ReflectionType = "insight" | "gratitude";

export type SystemAction = {
  id: string;
  title: string;
  type: SystemActionType;
  completedAt?: string;
};

export type PersonalSystem = {
  id: string;
  foundationId: FoundationId;
  name: string;
  purpose: string;
  status: SystemStatus;
  knowledge?: string[];
  actions: SystemAction[];
  createdAt: string;
  updatedAt: string;
};

export type Foundation = {
  id: FoundationId;
  name: string;
  question: string;
  description: string;
};

export type SystemReflection = {
  id: string;
  systemId: string;
  foundationId: FoundationId;
  type: ReflectionType;
  text: string;
  createdAt: string;
};