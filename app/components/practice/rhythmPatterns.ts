export type RhythmSide = "left" | "right";
export type RhythmStep = RhythmSide | "rest";
export type RhythmLevel = "pulse" | "flow" | "weave";
export type RhythmTempo = "slow" | "steady" | "flowing";

export type RhythmPattern = {
  id: string;
  name: string;
  level: RhythmLevel;
  steps: RhythmStep[];
  beatsPerStep?: number;
};

export const rhythmLevels: Array<{
  id: RhythmLevel;
  label: string;
  description: string;
}> = [
  {
    id: "pulse",
    label: "Pulse",
    description: "Simple, steady alternation",
  },
  {
    id: "flow",
    label: "Flow",
    description: "Short groups and light pauses",
  },
  {
    id: "weave",
    label: "Weave",
    description: "Longer patterns and changing direction",
  },
];

export const rhythmTempos: Array<{
  id: RhythmTempo;
  label: string;
  stepMs: number;
  toleranceMs: number;
}> = [
  {
    id: "slow",
    label: "Slow",
    stepMs: 1100,
    toleranceMs: 1050,
  },
  {
    id: "steady",
    label: "Steady",
    stepMs: 820,
    toleranceMs: 760,
  },
  {
    id: "flowing",
    label: "Flowing",
    stepMs: 620,
    toleranceMs: 580,
  },
];

export const rhythmPatterns: RhythmPattern[] = [
  {
    id: "pulse",
    name: "Pulse",
    level: "pulse",
    steps: ["left", "right", "left", "right"],
  },
  {
    id: "double",
    name: "Double",
    level: "pulse",
    steps: ["left", "left", "right", "right"],
  },
  {
    id: "flow",
    name: "Flow",
    level: "flow",
    steps: ["left", "right", "right", "left"],
  },
  {
    id: "echo",
    name: "Echo",
    level: "flow",
    steps: [
      "left",
      "right",
      "left",
      "rest",
      "right",
      "left",
      "right",
    ],
  },
  {
    id: "rest",
    name: "Rest",
    level: "flow",
    steps: [
      "left",
      "right",
      "rest",
      "left",
      "right",
      "rest",
      "right",
      "left",
    ],
  },
  {
    id: "wave",
    name: "Wave",
    level: "weave",
    steps: [
      "left",
      "left",
      "right",
      "left",
      "rest",
      "right",
      "right",
      "left",
      "right",
    ],
  },
  {
    id: "cross",
    name: "Cross",
    level: "weave",
    steps: [
      "left",
      "right",
      "left",
      "right",
      "rest",
      "right",
      "left",
      "right",
      "left",
    ],
  },
];

export function patternsForLevel(level: RhythmLevel) {
  return rhythmPatterns.filter((pattern) => pattern.level === level);
}

export function readablePattern(pattern: RhythmPattern) {
  return pattern.steps
    .map((step) => {
      if (step === "left") return "Left";
      if (step === "right") return "Right";
      return "Pause";
    })
    .join(", ");
}
