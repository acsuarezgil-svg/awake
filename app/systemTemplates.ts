export const systemTemplates: Record<string, string[]> = {
  Health: [
    "Exercise",
    "Nutrition",
    "Sleep",
    "Recovery",
    "Preventative Care",
  ],

  Home: [
    "Cleaning",
    "Organization",
    "Maintenance",
    "Garden",
    "Comfort",
  ],

  Finances: [
    "Budget",
    "Emergency Fund",
    "Bills",
    "Investing",
    "Giving",
  ],

  Relationships: [
    "Family",
    "Friends",
    "Partner",
    "Communication",
    "Boundaries",
  ],

  Learning: [
    "Reading",
    "Courses",
    "Skills",
    "Practice",
    "Curiosity",
  ],

  Work: [
    "Planning",
    "Focus",
    "Projects",
    "Communication",
    "Career",
  ],

  Creativity: [
    "Ideas",
    "Writing",
    "Art",
    "Music",
    "Building",
  ],

  "Personal Growth": [
    "Reflection",
    "Confidence",
    "Mindset",
    "Values",
    "Habits",
  ],
};

export function getSystemTemplates(title: string) {
  return systemTemplates[title] ?? [];
}