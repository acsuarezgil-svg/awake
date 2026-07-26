import type {
  FoundationId,
  PersonalSystem,
  SystemActionType,
} from "../types/systems";

export type SystemActionTemplate = {
  id: string;
  title: string;
  type: SystemActionType;
};

export type SystemTemplate = {
  id: string;
  foundationId: FoundationId;
  name: string;
  purpose: string;
  knowledge: string[];
  actions: SystemActionTemplate[];
};

export const systemTemplates: SystemTemplate[] = [
  {
    id: "home-hvac",
    foundationId: "home",
    name: "HVAC",
    purpose:
      "Keep the home's air comfortable and help the HVAC system run efficiently.",
    knowledge: [
      "Filter replacement timing depends on the filter, home, pets, and air conditions.",
      "A system may need attention sooner when airflow becomes weaker or the filter looks dirty.",
    ],
    actions: [
      {
        id: "replace-filter",
        title: "Replace air filter",
        type: "maintenance",
      },
      {
        id: "check-filter-size",
        title: "Confirm filter size",
        type: "maintenance",
      },
      {
        id: "inspect-vents",
        title: "Check vents for blocked airflow",
        type: "maintenance",
      },
      {
        id: "schedule-inspection",
        title: "Plan a professional inspection",
        type: "investment",
      },
    ],
  },
  {
    id: "home-cleaning",
    foundationId: "home",
    name: "Cleaning",
    purpose: "Keep the home usable, peaceful, and easier to maintain.",
    knowledge: [
      "Small recurring resets can prevent cleaning from becoming one large task.",
    ],
    actions: [
      {
        id: "reset-main-area",
        title: "Reset one main area",
        type: "maintenance",
      },
      {
        id: "clean-bathroom",
        title: "Clean the bathroom",
        type: "maintenance",
      },
      {
        id: "remove-unused-items",
        title: "Remove unused items",
        type: "investment",
      },
    ],
  },
  {
    id: "home-safety",
    foundationId: "home",
    name: "Home Safety",
    purpose: "Reduce preventable risks within the home.",
    knowledge: [
      "Safety systems are most useful when checked before they are needed.",
    ],
    actions: [
      {
        id: "test-smoke-detectors",
        title: "Test smoke detectors",
        type: "maintenance",
      },
      {
        id: "check-extinguisher",
        title: "Check fire extinguisher",
        type: "maintenance",
      },
      {
        id: "review-emergency-plan",
        title: "Review emergency plan",
        type: "investment",
      },
    ],
  },
];

export function createSystemFromTemplate(
  template: SystemTemplate,
): PersonalSystem {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    foundationId: template.foundationId,
    name: template.name,
    purpose: template.purpose,
    status: "active",
    knowledge: template.knowledge,
    actions: template.actions.map((action) => ({
      ...action,
    })),
    createdAt: now,
    updatedAt: now,
  };
}