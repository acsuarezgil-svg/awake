export type RhythmSide = "left" | "right";
export type RhythmStep = RhythmSide | "rest";
export type RhythmStage =
  | "pulse"
  | "echo"
  | "flow"
  | "cadence"
  | "harmony";

export type RhythmPattern = {
  id: string;
  name: string;
  stage: RhythmStage;
  steps: RhythmStep[];
  subdivision: 1 | 2;
};

export const rhythmStages: Array<{
  id: RhythmStage;
  label: string;
  description: string;
}> = [
  { id: "pulse", label: "Pulse", description: "Watch a slow, steady beat." },
  { id: "echo", label: "Echo", description: "Listen once, then answer." },
  { id: "flow", label: "Flow", description: "Stay with a longer phrase." },
  { id: "cadence", label: "Cadence", description: "Let guidance become quieter." },
  { id: "harmony", label: "Harmony", description: "Feel the musical shape." },
];

export const rhythmPatterns: RhythmPattern[] = [
  {
    id: "pulse-alternate",
    name: "Steady pulse",
    stage: "pulse",
    steps: ["left", "right", "left", "right"],
    subdivision: 1,
  },
  {
    id: "pulse-pairs",
    name: "Gentle pairs",
    stage: "pulse",
    steps: ["left", "left", "right", "right"],
    subdivision: 1,
  },
  {
    id: "echo-space",
    name: "Echo and space",
    stage: "echo",
    steps: ["left", "right", "rest", "left", "right", "rest"],
    subdivision: 1,
  },
  {
    id: "flow-crossing",
    name: "Crossing flow",
    stage: "flow",
    steps: ["left", "right", "left", "left", "right", "rest", "right", "left"],
    subdivision: 2,
  },
  {
    id: "cadence-return",
    name: "Return",
    stage: "cadence",
    steps: ["left", "right", "right", "left", "rest", "left", "right", "left"],
    subdivision: 2,
  },
  {
    id: "harmony-phrase",
    name: "Open phrase",
    stage: "harmony",
    steps: ["left", "right", "left", "rest", "right", "left", "right", "rest"],
    subdivision: 2,
  },
];

export function patternsForStage(stage: RhythmStage) {
  return rhythmPatterns.filter((pattern) => pattern.stage === stage);
}

export function readablePattern(pattern: RhythmPattern) {
  return pattern.steps
    .map((step) =>
      step === "left" ? "Left" : step === "right" ? "Right" : "Pause",
    )
    .join(", ");
}

