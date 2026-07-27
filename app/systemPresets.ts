export type SystemPreset = {
  title: string;
  icon: string;
  description: string;
};

export const systemPresets: SystemPreset[] = [
  {
    title: "Health",
    icon: "❤️",
    description: "Care for the body that carries you.",
  },
  {
    title: "Home",
    icon: "🏡",
    description: "Create a place that gives you peace.",
  },
  {
    title: "Finances",
    icon: "💰",
    description: "Build freedom one choice at a time.",
  },
  {
    title: "Relationships",
    icon: "🤝",
    description: "Invest in the people who matter.",
  },
  {
    title: "Learning",
    icon: "📚",
    description: "Stay curious and keep growing.",
  },
  {
    title: "Work",
    icon: "💼",
    description: "Build with purpose, not pressure.",
  },
  {
    title: "Creativity",
    icon: "🎨",
    description: "Make room to create.",
  },
  {
    title: "Energy",
    icon: "◌",
    description: "Protect the rhythms that help you feel present.",
  },
  {
    title: "Boundaries",
    icon: "◌",
    description: "Create space for what matters.",
  },
  {
    title: "Communication",
    icon: "◌",
    description: "Make understanding easier to reach.",
  },
  {
    title: "Personal Growth",
    icon: "🌿",
    description: "Become who you're becoming.",
  },
];

export const defaultSystems = systemPresets.map(
  (preset) => preset.title
);

export function getSystemPreset(title: string) {
  return systemPresets.find(
    (preset) =>
      preset.title.toLowerCase() === title.toLowerCase()
  );
}
