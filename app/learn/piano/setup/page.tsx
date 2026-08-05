import type { LearningStageLevel } from "../../../types/learning";
import PianoSetupFlow from "./PianoSetupFlow";

function getLevel(value: string | string[] | undefined): LearningStageLevel {
  const level = Array.isArray(value) ? value[0] : value;
  return level === "intermediate" || level === "advanced"
    ? level
    : "beginner";
}

export default async function PianoSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string | string[] }>;
}) {
  const query = await searchParams;
  return <PianoSetupFlow initialLevel={getLevel(query.stage)} />;
}
