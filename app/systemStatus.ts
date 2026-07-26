import type {
  AwakeFocusArea,
  AwakeSystem,
  SystemCommitment,
} from "./systems";

export type SystemPrimaryStatus =
  | "review"
  | "active"
  | "mine"
  | "paused"
  | "new"
  | "quiet";

export type SystemStatus = {
  primary: SystemPrimaryStatus;
  label: string;
  isMine: boolean;
  reviewDue: boolean;
  activeCommitment: boolean;
};

export type FoundationSummary = {
  hasReviewDue: boolean;
  activeCount: number;
  mineCount: number;
  pausedCount: number;
  totalSystems: number;
  lastMeaningfulUpdate?: string;
};

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function currentCommitment(
  focusArea: AwakeFocusArea,
): SystemCommitment | undefined {
  return (focusArea.commitments ?? []).find(
    (commitment) =>
      commitment.id === focusArea.currentCommitmentId,
  );
}

export function getSystemStatus(
  focusArea: AwakeFocusArea,
  today = localDateKey(),
): SystemStatus {
  const commitment = currentCommitment(focusArea);
  const commitmentIsActive = commitment?.status === "active";
  const reviewDue =
    commitmentIsActive &&
    Boolean(commitment?.reviewDate) &&
    commitment!.reviewDate <= today;
  const activeCommitment = commitmentIsActive && !reviewDue;
  const isMine = focusArea.isMySystem === true;

  if (reviewDue) {
    return {
      primary: "review",
      label: "Review due",
      isMine,
      reviewDue,
      activeCommitment,
    };
  }
  if (activeCommitment) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
      primary: "active",
      label:
        commitment?.reviewDate === localDateKey(tomorrow)
          ? "Review tomorrow"
          : "Active",
      isMine,
      reviewDue,
      activeCommitment,
    };
  }
  if (isMine) {
    return {
      primary: "mine",
      label: "Mine",
      isMine,
      reviewDue,
      activeCommitment,
    };
  }
  if (focusArea.status === "paused") {
    return {
      primary: "paused",
      label: "Paused",
      isMine,
      reviewDue,
      activeCommitment,
    };
  }
  if (
    (focusArea.commitments?.length ?? 0) === 0 &&
    focusArea.careActions === undefined
  ) {
    return {
      primary: "new",
      label: "New",
      isMine,
      reviewDue,
      activeCommitment,
    };
  }
  return {
    primary: "quiet",
    label: "Quiet",
    isMine,
    reviewDue,
    activeCommitment,
  };
}

export function getFoundationSummary(
  foundation: AwakeSystem,
): FoundationSummary {
  const statuses = foundation.focusAreas.map((focusArea) =>
    getSystemStatus(focusArea),
  );
  const updates = foundation.focusAreas
    .flatMap((focusArea) => [
      focusArea.lastUpdatedAt,
      focusArea.lastReviewedAt,
      focusArea.updatedAt,
    ])
    .filter((value): value is string => Boolean(value))
    .sort();

  return {
    hasReviewDue: statuses.some((status) => status.reviewDue),
    activeCount: statuses.filter(
      (status) => status.activeCommitment,
    ).length,
    mineCount: statuses.filter((status) => status.isMine).length,
    pausedCount: statuses.filter(
      (status) => status.primary === "paused",
    ).length,
    totalSystems: foundation.focusAreas.length,
    lastMeaningfulUpdate: updates.at(-1),
  };
}

export function getFoundationLabel(
  summary: FoundationSummary,
) {
  if (summary.hasReviewDue) return "Review due";
  if (summary.activeCount > 0) {
    return `${summary.activeCount} active`;
  }
  if (summary.mineCount > 0) {
    return `${summary.mineCount} ${summary.mineCount === 1 ? "mine" : "mine"}`;
  }
  if (
    summary.totalSystems > 0 &&
    summary.pausedCount === summary.totalSystems
  ) {
    return "Paused";
  }
  if (summary.totalSystems === 0) return "No systems yet";
  return `${summary.totalSystems} systems`;
}
