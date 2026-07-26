import type { LifeMap } from "@/app/types/knowledge";

export const lifeMaps: LifeMap[] = [
  // -------------------------
  // HEALTH
  // -------------------------

  {
    id: "exercise",
    areaId: "health",
    name: "Exercise",
    icon: "🏃",
    purpose:
      "Move your body in ways that support your physical and mental well-being.",
    commonChallenges: [
      "Lack of motivation",
      "Feeling too busy",
      "Not knowing where to start",
      "Trying to do too much too quickly",
    ],
    knowledge: [
      "Consistency can be more sustainable than starting with intense workouts.",
      "Movement can include walking, mobility, strength, sports, or any activity that supports your body.",
    ],
    actions: [
      {
        id: "walk-15-minutes",
        title: "Walk for 15 minutes",
        type: "maintenance",
      },
      {
        id: "prepare-exercise-clothes",
        title: "Leave exercise clothes or shoes ready",
        type: "maintenance",
      },
      {
        id: "schedule-movement",
        title: "Choose days for movement this week",
        type: "maintenance",
      },
      {
        id: "build-exercise-plan",
        title: "Build a simple exercise plan",
        type: "investment",
      },
    ],
  },

  {
    id: "sleep",
    areaId: "health",
    name: "Sleep",
    icon: "😴",
    purpose:
      "Build routines that help you rest and recover consistently.",
    commonChallenges: [
      "Going to bed late",
      "Using the phone before sleep",
      "Having an irregular schedule",
    ],
    knowledge: [
      "A repeatable evening routine can make it easier to transition toward rest.",
      "Sleep needs and routines differ from person to person.",
    ],
    actions: [
      {
        id: "dim-lights",
        title: "Dim the lights before bed",
        type: "maintenance",
      },
      {
        id: "charge-phone-away",
        title: "Charge the phone away from the bed",
        type: "maintenance",
      },
      {
        id: "choose-wake-time",
        title: "Choose a consistent wake-up time",
        type: "maintenance",
      },
      {
        id: "shape-evening-routine",
        title: "Create a simple evening routine",
        type: "investment",
      },
    ],
  },

  {
    id: "nutrition",
    areaId: "health",
    name: "Nutrition",
    icon: "🥗",
    purpose:
      "Support your body with nourishing food while building sustainable routines.",
    commonChallenges: [
      "Eating out often",
      "Skipping meals",
      "Impulse snacking",
      "Not knowing what to prepare",
    ],
    knowledge: [
      "Preparing even one part of a meal ahead of time can reduce effort later.",
      "A sustainable nutrition system should fit your schedule, preferences, and needs.",
    ],
    actions: [
      {
        id: "prepare-one-meal",
        title: "Prepare one nourishing meal",
        type: "maintenance",
      },
      {
        id: "prepare-water",
        title: "Keep water ready and accessible",
        type: "maintenance",
      },
      {
        id: "plan-tomorrow-meals",
        title: "Plan tomorrow's meals",
        type: "maintenance",
      },
      {
        id: "create-meal-options",
        title: "Create a list of easy meal options",
        type: "investment",
      },
    ],
  },

  // -------------------------
  // HOME
  // -------------------------

  {
    id: "maintenance",
    areaId: "home",
    name: "Maintenance",
    icon: "🔧",
    purpose:
      "Care for your home through small actions that keep it working well.",
    commonChallenges: [
      "Forgetting recurring maintenance",
      "Waiting until something breaks",
      "Not knowing what needs attention",
    ],
    knowledge: [
      "Small preventive actions can reduce the chance of larger problems later.",
      "Maintenance frequency depends on the home, equipment, environment, and manufacturer guidance.",
    ],
    actions: [
      {
        id: "inspect-one-area",
        title: "Inspect one area of the home",
        type: "maintenance",
      },
      {
        id: "check-filter",
        title: "Check an air or water filter",
        type: "maintenance",
      },
      {
        id: "organize-tools",
        title: "Return tools and supplies to one place",
        type: "maintenance",
      },
      {
        id: "create-maintenance-list",
        title: "Create a home maintenance list",
        type: "investment",
      },
    ],
  },

  {
    id: "decluttering",
    areaId: "home",
    name: "Decluttering",
    icon: "📦",
    purpose:
      "Reduce clutter to create a calmer and more functional space.",
    commonChallenges: [
      "Feeling overwhelmed",
      "Trying to clear everything at once",
      "Not knowing what to keep",
    ],
    knowledge: [
      "Small, clearly defined spaces are often easier to complete than whole rooms.",
      "Decluttering can be about improving access and usefulness, not owning as little as possible.",
    ],
    actions: [
      {
        id: "clear-one-surface",
        title: "Clear one surface",
        type: "maintenance",
      },
      {
        id: "organize-one-drawer",
        title: "Organize one drawer",
        type: "maintenance",
      },
      {
        id: "remove-five-items",
        title: "Remove five items that no longer help",
        type: "maintenance",
      },
      {
        id: "create-donation-space",
        title: "Create a permanent donation box",
        type: "investment",
      },
    ],
  },

  {
    id: "repairs",
    areaId: "home",
    name: "Repairs",
    icon: "🪛",
    purpose:
      "Address damaged or worn parts of the home before they become larger problems.",
    commonChallenges: [
      "Not knowing what materials to buy",
      "Putting repairs off",
      "Feeling unsure about doing the repair safely",
    ],
    knowledge: [
      "Some repairs can be handled gradually, while others require prompt professional attention.",
      "Taking measurements and photos before shopping can make finding materials easier.",
    ],
    actions: [
      {
        id: "record-one-repair",
        title: "Record one repair that needs attention",
        type: "maintenance",
      },
      {
        id: "measure-repair-area",
        title: "Measure and photograph the repair area",
        type: "maintenance",
      },
      {
        id: "research-materials",
        title: "Research the needed materials",
        type: "maintenance",
      },
      {
        id: "create-repair-plan",
        title: "Create a repair plan and budget",
        type: "investment",
      },
    ],
  },

  // -------------------------
  // LEARNING
  // -------------------------

  {
    id: "reading",
    areaId: "learning",
    name: "Reading",
    icon: "📖",
    purpose:
      "Learn consistently through books, articles, and thoughtful attention.",
    commonChallenges: [
      "Getting distracted",
      "Not making time",
      "Choosing too many books at once",
    ],
    knowledge: [
      "A visible book and a defined reading place can reduce the effort needed to begin.",
      "Reading does not need to be long to be meaningful.",
    ],
    actions: [
      {
        id: "read-20-minutes",
        title: "Read for 20 minutes",
        type: "maintenance",
      },
      {
        id: "place-book-visible",
        title: "Leave the current book somewhere visible",
        type: "maintenance",
      },
      {
        id: "visit-library",
        title: "Visit the library",
        type: "maintenance",
      },
      {
        id: "create-reading-list",
        title: "Create a focused reading list",
        type: "investment",
      },
    ],
  },

  {
    id: "skill-practice",
    areaId: "learning",
    name: "Skill Practice",
    icon: "🎹",
    purpose:
      "Develop skills through deliberate, repeatable, and enjoyable practice.",
    commonChallenges: [
      "Expecting perfection",
      "Skipping difficult sections",
      "Practicing without a clear focus",
    ],
    knowledge: [
      "Slower practice can make mistakes easier to notice and correct.",
      "A small practice session can still strengthen familiarity and confidence.",
    ],
    actions: [
      {
        id: "practice-slowly",
        title: "Practice slowly for 10 minutes",
        type: "maintenance",
      },
      {
        id: "focus-one-section",
        title: "Focus on one difficult section",
        type: "maintenance",
      },
      {
        id: "repeat-small-part",
        title: "Repeat one small part carefully",
        type: "maintenance",
      },
      {
        id: "create-practice-structure",
        title: "Create a simple practice structure",
        type: "investment",
      },
    ],
  },

  {
    id: "projects",
    areaId: "learning",
    name: "Projects",
    icon: "💡",
    purpose:
      "Turn ideas into real experiences through building and experimentation.",
    commonChallenges: [
      "Having too many ideas",
      "Not knowing the next step",
      "Starting new things before finishing small pieces",
    ],
    knowledge: [
      "Defining one visible next step can make a large project easier to approach.",
      "Projects can teach through partial attempts, not only through completion.",
    ],
    actions: [
      {
        id: "work-30-minutes",
        title: "Work on the project for 30 minutes",
        type: "maintenance",
      },
      {
        id: "choose-next-step",
        title: "Choose the next small step",
        type: "maintenance",
      },
      {
        id: "finish-one-piece",
        title: "Finish one small piece",
        type: "maintenance",
      },
      {
        id: "create-project-milestones",
        title: "Create project milestones",
        type: "investment",
      },
    ],
  },
];