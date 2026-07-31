import type { AwakeSystem } from "../systems";

export type CircleDirection = "core" | "sharp" | "flat";

export type CircleKey = {
  id: string;
  displayKey: string;
  majorKey: string;
  relativeMinor: string;
  direction: CircleDirection;
  accidentalCount: number;
  stepFromCore: number;
  awakeFoundationName: string;
  foundationAliases: readonly string[];
};

export type CircleFoundationMapping = CircleKey & {
  foundation: AwakeSystem;
  mappingKind: "exact" | "alias" | "fallback" | "reused";
};

export const CIRCLE_CORE_ID = "circle-c";

export const CIRCLE_OF_FIFTHS: readonly CircleKey[] = [
  {
    id: CIRCLE_CORE_ID,
    displayKey: "C",
    majorKey: "C",
    relativeMinor: "Am",
    direction: "core",
    accidentalCount: 0,
    stepFromCore: 0,
    awakeFoundationName: "Core",
    foundationAliases: ["Health", "Self Trust"],
  },
  {
    id: "circle-g",
    displayKey: "G",
    majorKey: "G",
    relativeMinor: "Em",
    direction: "sharp",
    accidentalCount: 1,
    stepFromCore: 1,
    awakeFoundationName: "Growth",
    foundationAliases: ["Personal Growth"],
  },
  {
    id: "circle-d",
    displayKey: "D",
    majorKey: "D",
    relativeMinor: "Bm",
    direction: "sharp",
    accidentalCount: 2,
    stepFromCore: 2,
    awakeFoundationName: "Discipline",
    foundationAliases: ["Work"],
  },
  {
    id: "circle-a",
    displayKey: "A",
    majorKey: "A",
    relativeMinor: "F#m",
    direction: "sharp",
    accidentalCount: 3,
    stepFromCore: 3,
    awakeFoundationName: "Awareness",
    foundationAliases: ["Learning"],
  },
  {
    id: "circle-e",
    displayKey: "E",
    majorKey: "E",
    relativeMinor: "C#m",
    direction: "sharp",
    accidentalCount: 4,
    stepFromCore: 4,
    awakeFoundationName: "Energy",
    foundationAliases: [],
  },
  {
    id: "circle-b",
    displayKey: "B",
    majorKey: "B",
    relativeMinor: "G#m",
    direction: "sharp",
    accidentalCount: 5,
    stepFromCore: 5,
    awakeFoundationName: "Balance",
    foundationAliases: ["Finances"],
  },
  {
    id: "circle-f-sharp",
    displayKey: "F#",
    majorKey: "F#",
    relativeMinor: "D#m / Ebm",
    direction: "sharp",
    accidentalCount: 6,
    stepFromCore: 6,
    awakeFoundationName: "Focus",
    foundationAliases: [],
  },
  {
    id: "circle-d-flat",
    displayKey: "Db",
    majorKey: "Db",
    relativeMinor: "Bbm",
    direction: "flat",
    accidentalCount: 5,
    stepFromCore: 5,
    awakeFoundationName: "Creativity",
    foundationAliases: [],
  },
  {
    id: "circle-a-flat",
    displayKey: "Ab",
    majorKey: "Ab",
    relativeMinor: "Fm",
    direction: "flat",
    accidentalCount: 4,
    stepFromCore: 4,
    awakeFoundationName: "Relationships",
    foundationAliases: [],
  },
  {
    id: "circle-e-flat",
    displayKey: "Eb",
    majorKey: "Eb",
    relativeMinor: "Cm",
    direction: "flat",
    accidentalCount: 3,
    stepFromCore: 3,
    awakeFoundationName: "Expression",
    foundationAliases: ["Communication"],
  },
  {
    id: "circle-b-flat",
    displayKey: "Bb",
    majorKey: "Bb",
    relativeMinor: "Gm",
    direction: "flat",
    accidentalCount: 2,
    stepFromCore: 2,
    awakeFoundationName: "Boundaries",
    foundationAliases: [],
  },
  {
    id: "circle-f",
    displayKey: "F",
    majorKey: "F",
    relativeMinor: "Dm",
    direction: "flat",
    accidentalCount: 1,
    stepFromCore: 1,
    awakeFoundationName: "Foundation",
    foundationAliases: ["Home"],
  },
] as const;

function normalizeName(value: string) {
  return value.trim().toLocaleLowerCase();
}

export function getKeySignatureLabel(key: CircleKey) {
  if (key.direction === "core") return "no sharps or flats";
  const accidental = key.direction === "sharp" ? "sharp" : "flat";
  return `${key.accidentalCount} ${accidental}${key.accidentalCount === 1 ? "" : "s"}`;
}

export function getStepFromCoreLabel(key: CircleKey) {
  if (key.direction === "core") return "Everything connects back to Core.";
  const direction = key.direction === "sharp" ? "clockwise" : "counterclockwise";
  return `${key.stepFromCore} ${key.stepFromCore === 1 ? "step" : "steps"} ${direction} from Core`;
}

export function mapFoundationsToCircle(
  foundations: AwakeSystem[],
): CircleFoundationMapping[] {
  if (foundations.length === 0) return [];

  const used = new Set<string>();
  const resolved = new Map<
    string,
    { foundation: AwakeSystem; mappingKind: CircleFoundationMapping["mappingKind"] }
  >();

  const claim = (key: CircleKey, names: readonly string[], kind: "exact" | "alias") => {
    const normalizedNames = new Set(names.map(normalizeName));
    const foundation = foundations.find(
      (candidate) =>
        !used.has(candidate.id) && normalizedNames.has(normalizeName(candidate.title)),
    );
    if (!foundation) return;
    used.add(foundation.id);
    resolved.set(key.id, { foundation, mappingKind: kind });
  };

  for (const key of CIRCLE_OF_FIFTHS) {
    claim(key, [key.awakeFoundationName], "exact");
  }
  for (const key of CIRCLE_OF_FIFTHS) {
    if (!resolved.has(key.id)) {
      claim(key, key.foundationAliases, "alias");
    }
  }

  const remaining = foundations.filter((foundation) => !used.has(foundation.id));
  let fallbackIndex = 0;

  return CIRCLE_OF_FIFTHS.map((key, index) => {
    const mapped = resolved.get(key.id);
    if (mapped) return { ...key, ...mapped };

    const fallback = remaining[fallbackIndex];
    if (fallback) {
      fallbackIndex += 1;
      used.add(fallback.id);
      return { ...key, foundation: fallback, mappingKind: "fallback" as const };
    }

    return {
      ...key,
      foundation: foundations[index % foundations.length],
      mappingKind: "reused" as const,
    };
  });
}
