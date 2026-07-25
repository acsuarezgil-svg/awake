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
    "Maintenance",
    "Organization",
    "Projects",
  ],

  Finances: [
    "Budget",
    "Savings",
    "Investing",
    "Giving",
  ],

  Relationships: [
    "Family",
    "Friends",
    "Partner",
    "Communication",
  ],

  Learning: [
    "Reading",
    "Courses",
    "Practice",
    "Projects",
  ],

  Work: [
    "Planning",
    "Projects",
    "Meetings",
    "Growth",
  ],

  Creativity: [
    "Ideas",
    "Writing",
    "Music",
    "Art",
  ],

  "Personal Growth": [
    "Mindset",
    "Confidence",
    "Reflection",
    "Purpose",
  ],
};

export function getSystemTemplates(title: string) {
  return systemTemplates[title] ?? [];
}
