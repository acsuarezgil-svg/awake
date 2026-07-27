"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  type AwakeFocusArea,
  type AwakeSystem,
  type FocusAreaCareAction,
  type SystemCommitment,
  type SystemReview,
} from "../../../systems";
import {
  loadAwakeSystems,
  saveAwakeSystems,
} from "../../../systemStorage";
import {
  colorToHue,
  defaultColorPreferences,
  generateAwakePalette,
  generateSystemOrbPalette,
  loadColorPreferences,
  type AwakeColorPreferences,
} from "../../../colorPalette";
import AwakeColorPicker from "../../../components/AwakeColorPicker";
import FocusAreaActions from "./FocusAreaActions";
import { getSystemStatus } from "../../../systemStatus";

const periodOptions = [
  { label: "1 week", value: 1, unit: "weeks" },
  { label: "2 weeks", value: 2, unit: "weeks" },
  { label: "3 weeks", value: 3, unit: "weeks" },
  { label: "1 month", value: 1, unit: "months" },
  { label: "3 months", value: 3, unit: "months" },
] as const;

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function addPeriod(
  start: Date,
  value: number,
  unit: "days" | "weeks" | "months",
) {
  const result = new Date(start);
  if (unit === "days") result.setDate(result.getDate() + value);
  if (unit === "weeks") result.setDate(result.getDate() + value * 7);
  if (unit === "months") result.setMonth(result.getMonth() + value);
  return result;
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatDate(value?: string) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function relativeDate(value?: string) {
  if (!value) return "No updates yet";
  const then = new Date(value);
  if (Number.isNaN(then.getTime())) return "No updates yet";
  const days = Math.round(
    (Date.now() - then.getTime()) / 86_400_000,
  );
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

export default function SystemLifecyclePage() {
  const params = useParams<{ id: string; focusAreaId: string }>();
  const router = useRouter();
  const [systems, setSystems] = useState<AwakeSystem[]>([]);
  const [system, setSystem] = useState<AwakeSystem | null>(null);
  const [focusArea, setFocusArea] = useState<AwakeFocusArea | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [showCommitment, setShowCommitment] = useState(false);
  const [showColor, setShowColor] = useState(false);
  const [draftColorHue, setDraftColorHue] = useState(139);
  const [colorPreferences, setColorPreferences] =
    useState<AwakeColorPreferences>(defaultColorPreferences);
  const [periodIndex, setPeriodIndex] = useState(2);
  const [customPeriod, setCustomPeriod] = useState("4");
  const [customUnit, setCustomUnit] =
    useState<"days" | "weeks" | "months">("weeks");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [flexible, setFlexible] = useState(true);
  const [duration, setDuration] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [showDeleteSystem, setShowDeleteSystem] = useState(false);
  const [supportResult, setSupportResult] =
    useState<SystemReview["supportResult"] | null>(null);
  const [completedAsPlanned, setCompletedAsPlanned] =
    useState<boolean | null>(null);
  const [completedCount, setCompletedCount] = useState("");
  const [averageDuration, setAverageDuration] = useState("");

  useEffect(() => {
    const stored = loadAwakeSystems();
    const selectedSystem =
      stored.find((item) => item.id === params.id) ?? null;
    const selectedFocus =
      selectedSystem?.focusAreas.find(
        (item) => item.id === params.focusAreaId,
      ) ?? null;
    // Hydrate the client-only local system store after mounting.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSystems(stored);
    setSystem(selectedSystem);
    setFocusArea(selectedFocus);
    setColorPreferences(loadColorPreferences());
    setDraftColorHue(
      selectedFocus?.colorHue ??
        colorToHue(selectedFocus?.color),
    );
    setLoaded(true);
  }, [params.id, params.focusAreaId]);

  const palette = generateAwakePalette(
    colorPreferences.anchorHue,
    colorPreferences.harmony,
    colorPreferences.appearance,
  );

  const commitments = useMemo(
    () => focusArea?.commitments ?? [],
    [focusArea],
  );
  const reviews = useMemo(
    () => focusArea?.reviews ?? [],
    [focusArea],
  );
  const currentCommitment =
    commitments.find(
      (item) => item.id === focusArea?.currentCommitmentId,
    ) ?? null;
  const activeCommitment =
    currentCommitment?.status === "active"
      ? currentCommitment
      : null;
  const latestReview = reviews.at(-1);
  const systemStatus = focusArea ? getSystemStatus(focusArea) : null;

  function saveFocusArea(nextFocusArea: AwakeFocusArea) {
    if (!system) return;
    const nextSystem = {
      ...system,
      focusAreas: system.focusAreas.map((item) =>
        item.id === nextFocusArea.id ? nextFocusArea : item,
      ),
      updatedAt: nextFocusArea.lastUpdatedAt ?? new Date().toISOString(),
    };
    const nextSystems = systems.map((item) =>
      item.id === nextSystem.id ? nextSystem : item,
    );
    saveAwakeSystems(nextSystems);
    setSystems(nextSystems);
    setSystem(nextSystem);
    setFocusArea(nextFocusArea);
  }

  function updateMeaningfully(
    changes: Partial<AwakeFocusArea>,
  ) {
    if (!focusArea) return;
    const now = new Date().toISOString();
    saveFocusArea({
      ...focusArea,
      ...changes,
      updatedAt: now,
      lastUpdatedAt: now,
    });
  }

  function saveCareActions(actions: FocusAreaCareAction[]) {
    updateMeaningfully({ careActions: actions });
  }

  function saveSystemColor() {
    const orb = generateSystemOrbPalette(
      draftColorHue,
      colorPreferences.harmony,
      colorPreferences.appearance,
    );
    updateMeaningfully({
      colorHue: draftColorHue,
      color: orb.main,
    });
    setShowColor(false);
  }

  function deleteSystem() {
    if (!system || !focusArea) return;
    const nextSystems = systems.map((item) =>
      item.id === system.id
        ? {
            ...item,
            focusAreas: item.focusAreas.filter(
              (candidate) => candidate.id !== focusArea.id,
            ),
            updatedAt: new Date().toISOString(),
          }
        : item,
    );
    saveAwakeSystems(nextSystems);

    for (const key of [
      "awake-focus-area-action-events",
      "awake-system-action-events",
    ]) {
      try {
        const saved = localStorage.getItem(key);
        const events = saved ? JSON.parse(saved) : [];
        if (!Array.isArray(events)) continue;
        localStorage.setItem(
          key,
          JSON.stringify(
            events.filter(
              (event) =>
                !event ||
                typeof event !== "object" ||
                !("focusAreaId" in event) ||
                event.focusAreaId !== focusArea.id,
            ),
          ),
        );
      } catch {
        // Leave malformed legacy data untouched.
      }
    }

    router.push(`/systems/${system.id}`);
  }

  function createCommitmentFrom(
    source?: SystemCommitment,
    extension = false,
  ) {
    if (!focusArea) return;
    const now = new Date();
    const option = source
      ? {
          value: source.plannedPeriodValue,
          unit: source.plannedPeriodUnit,
        }
      : periodIndex === -1
        ? {
            value: Math.max(1, Number(customPeriod) || 1),
            unit: customUnit,
          }
        : periodOptions[periodIndex];
    const commitment: SystemCommitment = {
      id: crypto.randomUUID(),
      startDate: dateKey(now),
      reviewDate: dateKey(addPeriod(now, option.value, option.unit)),
      plannedPeriodValue: option.value,
      plannedPeriodUnit: option.unit,
      selectedDays: source?.selectedDays ?? (flexible ? undefined : selectedDays),
      flexibleSchedule: source?.flexibleSchedule ?? flexible,
      plannedDurationMinutes:
        source?.plannedDurationMinutes ??
        (duration ? Number(duration) : undefined),
      status: "active",
      parentCommitmentId: extension ? source?.id : undefined,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    const nextCommitments = commitments.map((item) =>
      item.id === source?.id && extension
        ? { ...item, status: "extended" as const, updatedAt: now.toISOString() }
        : item,
    );
    updateMeaningfully({
      commitments: [...nextCommitments, commitment],
      currentCommitmentId: commitment.id,
      status: "testing",
    });
    setShowCommitment(false);
  }

  function submitReview() {
    if (!focusArea || !activeCommitment || !supportResult || completedAsPlanned === null) {
      return;
    }
    const now = new Date().toISOString();
    const review: SystemReview = {
      id: crypto.randomUUID(),
      commitmentId: activeCommitment.id,
      supportResult,
      completedAsPlanned,
      completedCount:
        !completedAsPlanned && completedCount
          ? Number(completedCount)
          : undefined,
      averageDurationMinutes:
        !completedAsPlanned && averageDuration
          ? Number(averageDuration)
          : undefined,
      reviewedAt: now,
    };
    updateMeaningfully({
      commitments: commitments.map((item) =>
        item.id === activeCommitment.id
          ? { ...item, status: "completed" as const, updatedAt: now }
          : item,
      ),
      reviews: [...reviews, review],
      currentCommitmentId: undefined,
      lastReviewedAt: now,
      status: "evolving",
    });
    setShowReview(false);
    setSupportResult(null);
    setCompletedAsPlanned(null);
    setCompletedCount("");
    setAverageDuration("");
  }

  if (!loaded) return null;

  if (!system || !focusArea) {
    return (
      <main className="min-h-screen bg-[#f7f6f2] px-5 py-8 text-stone-800">
        <div className="mx-auto max-w-lg">
          <Link href="/" className="text-sm text-stone-500">← Systems</Link>
          <h1 className="mt-10 text-2xl font-semibold">System not found</h1>
        </div>
      </main>
    );
  }

  return (
    <main
      className="awake-page min-h-screen px-5 py-8 transition-colors"
      style={{
        background: palette.pageBackground,
        color: palette.text,
      }}
    >
      <div className="mx-auto w-full max-w-lg">
        <Link
          href={`/systems/${system.id}`}
          className="text-sm transition"
          style={{ color: palette.secondaryText }}
        >
          ← {system.title}
        </Link>

        <header className="mt-8">
          <p
            className="text-xs uppercase tracking-[0.2em]"
            style={{ color: palette.secondaryText }}
          >
            {system.title} Foundation
          </p>
          <div className="mt-2 flex items-start justify-between gap-5">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                {focusArea.title}
              </h1>
              <p
                className="mt-2 text-sm"
                style={{ color: palette.secondaryText }}
              >
                {systemStatus?.label ?? "System"} · Last updated{" "}
                {relativeDate(focusArea.lastUpdatedAt)}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                updateMeaningfully({ isMySystem: !focusArea.isMySystem })
              }
              className={`min-h-11 shrink-0 rounded-full border px-4 text-sm transition ${
                focusArea.isMySystem
                  ? "border-amber-300 bg-amber-50 text-amber-800"
                  : "border-stone-200 bg-white text-stone-600"
              }`}
              aria-pressed={focusArea.isMySystem}
            >
              {focusArea.isMySystem ? "★ This is my system" : "☆ Make it yours"}
            </button>
          </div>
        </header>

        <section
          className="mt-7 border-y py-5"
          style={{ borderColor: palette.border }}
        >
          <p
            className="text-xs uppercase tracking-[0.18em]"
            style={{ color: palette.secondaryText }}
          >
            Purpose
          </p>
          <p className="mt-2 leading-7">
            {focusArea.understanding.purpose.trim() || "Not added yet"}
          </p>
        </section>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setDraftColorHue(
                focusArea.colorHue ??
                  colorToHue(focusArea.color),
              );
              setShowColor((open) => !open);
            }}
            className="min-h-11 rounded-full border px-4 text-sm"
            style={{
              borderColor: palette.border,
              background: palette.mutedSurface,
              color: palette.secondaryText,
            }}
            aria-expanded={showColor}
          >
            System color
          </button>
        </div>

        {showColor && (
          <section
            className="mt-4 rounded-3xl border p-5 shadow-sm"
            style={{
              borderColor: palette.border,
              background: palette.mutedSurface,
            }}
            aria-label={`Choose ${focusArea.title} color`}
          >
            <h2 className="text-lg font-semibold">System color</h2>
            <p
              className="mb-5 mt-1 text-sm"
              style={{ color: palette.secondaryText }}
            >
              Give this system an identity. Awake shapes its highlight and glow.
            </p>
            <AwakeColorPicker
              hue={draftColorHue}
              harmony={colorPreferences.harmony}
              appearance={colorPreferences.appearance}
              onHueChange={setDraftColorHue}
              onHarmonyChange={(harmony) =>
                setColorPreferences({ ...colorPreferences, harmony })
              }
              showPreview={false}
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowColor(false)}
                className="min-h-11 px-4 text-sm"
                style={{ color: palette.secondaryText }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveSystemColor}
                className="min-h-11 rounded-2xl px-5 text-sm font-medium"
                style={{
                  background: palette.primaryAccent,
                  color: palette.buttonText,
                }}
              >
                Save color
              </button>
            </div>
          </section>
        )}

        <FocusAreaActions
          systemId={system.id}
          focusAreaId={focusArea.id}
          focusAreaTitle={focusArea.title}
          savedActions={focusArea.careActions}
          isDark={colorPreferences.appearance === "dark"}
          onSaveActions={saveCareActions}
        />

        <section className="mt-12">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-stone-400">
                Commitment
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Try this version
              </h2>
            </div>
            {!currentCommitment && !showCommitment && (
              <button
                type="button"
                onClick={() => setShowCommitment(true)}
                className="rounded-full bg-stone-900 px-4 py-2.5 text-sm font-medium text-white"
              >
                Set commitment
              </button>
            )}
          </div>

          {currentCommitment ? (
            <div className="mt-5 rounded-3xl bg-white p-5 shadow-sm">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-stone-400">Started</p>
                  <p className="mt-1 font-medium">{formatDate(currentCommitment.startDate)}</p>
                </div>
                <div>
                  <p className="text-stone-400">Review</p>
                  <p className="mt-1 font-medium">{formatDate(currentCommitment.reviewDate)}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-stone-600">
                {currentCommitment.flexibleSchedule
                  ? "Flexible schedule"
                  : currentCommitment.selectedDays?.map((day) => dayLabels[day]).join(", ")}
                {currentCommitment.plannedDurationMinutes
                  ? ` · ${currentCommitment.plannedDurationMinutes} minutes`
                  : ""}
              </p>
              {activeCommitment ? (
                <button
                  type="button"
                  onClick={() => setShowReview(true)}
                  className="mt-5 min-h-11 w-full rounded-2xl border border-stone-200 text-sm font-medium"
                >
                  Review this system
                </button>
              ) : (
                <p className="mt-5 text-sm text-stone-400">
                  This commitment is paused.
                </p>
              )}
            </div>
          ) : !showCommitment ? (
            <p className="mt-4 text-sm leading-6 text-stone-500">
              Choose how long to try the current version before checking in.
            </p>
          ) : null}

          {showCommitment && (
            <div className="mt-5 rounded-3xl bg-white p-5 shadow-sm">
              <p className="font-medium">Try this system for</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {periodOptions.map((option, index) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setPeriodIndex(index)}
                    className={`min-h-11 rounded-2xl border text-sm ${
                      periodIndex === index
                        ? "border-stone-800 bg-stone-800 text-white"
                        : "border-stone-200 text-stone-600"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPeriodIndex(-1)}
                  className={`min-h-11 rounded-2xl border text-sm ${
                    periodIndex === -1
                      ? "border-stone-800 bg-stone-800 text-white"
                      : "border-stone-200 text-stone-600"
                  }`}
                >
                  Custom
                </button>
              </div>
              {periodIndex === -1 && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <input
                    aria-label="Custom period"
                    type="number"
                    min="1"
                    value={customPeriod}
                    onChange={(event) => setCustomPeriod(event.target.value)}
                    className="rounded-2xl border border-stone-200 px-4 py-3"
                  />
                  <select
                    aria-label="Custom period unit"
                    value={customUnit}
                    onChange={(event) =>
                      setCustomUnit(
                        event.target.value as "days" | "weeks" | "months",
                      )
                    }
                    className="rounded-2xl border border-stone-200 bg-white px-4 py-3"
                  >
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                  </select>
                </div>
              )}
              <label className="mt-5 flex min-h-11 items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={flexible}
                  onChange={(event) => setFlexible(event.target.checked)}
                  className="h-5 w-5"
                />
                Keep the schedule flexible
              </label>
              {!flexible && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {dayLabels.map((day, index) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() =>
                        setSelectedDays((current) =>
                          current.includes(index)
                            ? current.filter((item) => item !== index)
                            : [...current, index],
                        )
                      }
                      className={`min-h-10 rounded-full px-3 text-xs ${
                        selectedDays.includes(index)
                          ? "bg-stone-800 text-white"
                          : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              )}
              <label className="mt-5 block text-sm text-stone-600">
                Minutes, if useful
                <input
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none"
                />
              </label>
              <div className="mt-5 flex justify-end gap-2">
                <button type="button" onClick={() => setShowCommitment(false)} className="px-4 py-3 text-sm text-stone-500">
                  Cancel
                </button>
                <button type="button" onClick={() => createCommitmentFrom()} className="rounded-xl bg-stone-900 px-5 py-3 text-sm font-medium text-white">
                  Start
                </button>
              </div>
            </div>
          )}
        </section>

        {showReview && activeCommitment && (
          <section className="mt-8 rounded-3xl bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold">Did this system support you?</h2>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {(["yes", "somewhat", "no"] as const).map((result) => (
                <button
                  key={result}
                  type="button"
                  onClick={() => setSupportResult(result)}
                  className={`min-h-11 rounded-2xl border text-sm capitalize ${
                    supportResult === result
                      ? "border-stone-800 bg-stone-800 text-white"
                      : "border-stone-200"
                  }`}
                >
                  {result}
                </button>
              ))}
            </div>
            <p className="mt-6 font-medium">What actually happened?</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setCompletedAsPlanned(true)} className={`min-h-11 rounded-2xl border text-sm ${completedAsPlanned === true ? "border-stone-800 bg-stone-800 text-white" : "border-stone-200"}`}>
                As planned
              </button>
              <button type="button" onClick={() => setCompletedAsPlanned(false)} className={`min-h-11 rounded-2xl border text-sm ${completedAsPlanned === false ? "border-stone-800 bg-stone-800 text-white" : "border-stone-200"}`}>
                Different
              </button>
            </div>
            {completedAsPlanned === false && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="text-xs text-stone-500">
                  Sessions or days
                  <input type="number" min="0" value={completedCount} onChange={(event) => setCompletedCount(event.target.value)} className="mt-2 w-full rounded-xl border border-stone-200 px-3 py-3 text-sm" />
                </label>
                <label className="text-xs text-stone-500">
                  Average minutes
                  <input type="number" min="0" value={averageDuration} onChange={(event) => setAverageDuration(event.target.value)} className="mt-2 w-full rounded-xl border border-stone-200 px-3 py-3 text-sm" />
                </label>
              </div>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setShowReview(false)} className="px-4 py-3 text-sm text-stone-500">Cancel</button>
              <button type="button" disabled={!supportResult || completedAsPlanned === null} onClick={submitReview} className="rounded-xl bg-stone-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-35">
                Save review
              </button>
            </div>
          </section>
        )}

        {latestReview && !activeCommitment && (
          <section className="mt-10">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-400">Last review</p>
            <div className="mt-3 rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-sm text-stone-500">{formatDate(latestReview.reviewedAt)}</p>
              <p className="mt-2 text-lg font-medium capitalize">
                Supported you: {latestReview.supportResult}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => createCommitmentFrom(commitments.find((item) => item.id === latestReview.commitmentId))} className="min-h-11 rounded-2xl bg-stone-900 text-sm font-medium text-white">
                  Continue
                </button>
                <button type="button" onClick={() => createCommitmentFrom(commitments.find((item) => item.id === latestReview.commitmentId), true)} className="min-h-11 rounded-2xl border border-stone-200 text-sm font-medium">
                  Extend
                </button>
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById("care-edit")?.click();
                    document.getElementById("care")?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }}
                  className="min-h-11 rounded-2xl border border-stone-200 text-sm font-medium"
                >
                  Edit system
                </button>
                <button
                  type="button"
                  onClick={() => updateMeaningfully({ status: "paused" })}
                  className="min-h-11 rounded-2xl border border-stone-200 text-sm font-medium"
                >
                  Pause
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="mt-10 border-t border-stone-200 py-8">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                updateMeaningfully({
                  status: focusArea.status === "paused" ? "evolving" : "paused",
                  commitments: commitments.map((item) =>
                    item.id === currentCommitment?.id
                      ? {
                          ...item,
                          status:
                            focusArea.status === "paused" ? "active" : "paused",
                          updatedAt: new Date().toISOString(),
                        }
                      : item,
                  ),
                })
              }
              className="min-h-11 rounded-full border border-stone-200 bg-white px-4 text-sm text-stone-600"
            >
              {focusArea.status === "paused" ? "Resume system" : "Pause system"}
            </button>
            {focusArea.lastReviewedAt && (
              <span className="flex min-h-11 items-center px-2 text-xs text-stone-400">
                Last reviewed {relativeDate(focusArea.lastReviewedAt)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteSystem(true)}
            className="awake-button awake-button-danger mt-5"
          >
            Delete system
          </button>
        </section>
      </div>

      {showDeleteSystem && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/25 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-sm sm:items-center sm:justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-system-title"
          onClick={() => setShowDeleteSystem(false)}
        >
          <section
            className="awake-card w-full max-w-sm"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="delete-system-title">
              Delete {focusArea.title}?
            </h2>
            <p className="awake-supporting mt-3">
              This removes its plan, commitments, reviews, lessons,
              gratitude, experiments, observations, and action history.
              The {system.title} Foundation will remain.
            </p>
            <div className="mt-6 grid gap-2">
              <button
                type="button"
                onClick={deleteSystem}
                className="awake-button awake-button-danger"
              >
                Delete system
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteSystem(false)}
                className="awake-button awake-button-quiet"
              >
                Cancel
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
