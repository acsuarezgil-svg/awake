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
    ideasToTry: [
      "Walk for 15 minutes",
      "Schedule exercise on specific days",
      "Leave your shoes ready",
      "Focus on consistency instead of intensity",
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
      "Phone before sleep",
      "Irregular schedule",
    ],
    ideasToTry: [
      "Dim lights before bed",
      "Charge phone away from bed",
      "Wake up at the same time each day",
    ],
  },

  {
    id: "nutrition",
    areaId: "health",
    name: "Nutrition",
    icon: "🥗",
    purpose:
      "Support your body with nourishing food while building sustainable habits.",
    commonChallenges: [
      "Eating out often",
      "Skipping meals",
      "Impulse snacking",
    ],
    ideasToTry: [
      "Prepare one healthy meal",
      "Drink more water",
      "Plan tomorrow's meals tonight",
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
      "Take care of your home through small, regular maintenance.",
    commonChallenges: [
      "Forgetting maintenance",
      "Waiting until something breaks",
    ],
    ideasToTry: [
      "Create a Saturday reset",
      "Inspect one area each week",
      "Keep tools together",
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
      "Trying to clean everything at once",
    ],
    ideasToTry: [
      "One drawer at a time",
      "15-minute timer",
      "Fill one donation box",
    ],
  },

  {
    id: "repairs",
    areaId: "home",
    name: "Repairs",
    icon: "🪛",
    purpose:
      "Address repairs before they become larger problems.",
    commonChallenges: [
      "Not knowing what to buy",
      "Putting repairs off",
    ],
    ideasToTry: [
      "Make a repair list",
      "Research before buying",
      "Complete one repair each weekend",
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
      "Learn consistently through books, articles, and thoughtful reflection.",
    commonChallenges: [
      "Getting distracted",
      "Not making time",
    ],
    ideasToTry: [
      "Read for 20 minutes",
      "Visit the library",
      "Leave a book where you'll see it",
    ],
  },

  {
    id: "skill-practice",
    areaId: "learning",
    name: "Skill Practice",
    icon: "🎹",
    purpose:
      "Develop skills through deliberate and enjoyable practice.",
    commonChallenges: [
      "Expecting perfection",
      "Skipping difficult parts",
    ],
    ideasToTry: [
      "Practice slowly",
      "Focus on one section",
      "Celebrate small improvements",
    ],
  },

  {
    id: "projects",
    areaId: "learning",
    name: "Projects",
    icon: "💡",
    purpose:
      "Turn ideas into real experiences by building and experimenting.",
    commonChallenges: [
      "Too many ideas",
      "Not knowing the next step",
    ],
    ideasToTry: [
      "Work for 30 minutes",
      "Break projects into milestones",
      "Finish one small piece before starting another",
    ],
  },
];