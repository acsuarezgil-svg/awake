"use client";

import { useEffect, useMemo, useState } from "react";

import type { LifeMapAction } from "@/app/types/knowledge";

type ActionType = "maintenance" | "investment";
type ReflectionType = "insight" | "gratitude";

type SystemAction = {
  id: string;
  title: string;
  type: ActionType;
};

type SystemActionEvent = {
  id: string;
  areaId: string;
  mapId: string;
  actionId: string;
  actionTitle: string;
  actionType: ActionType;
  createdAt: string;
};

type SavedReflection = {
  id: string;
  areaId: string;
  mapId: string;
  type: ReflectionType;
  text: string;
  createdAt: string;
};

type SystemExperienceProps = {
  areaId: string;
  mapId: string;
  mapName: string;
  actions: LifeMapAction[];
};

const ACTION_EVENTS_STORAGE_KEY = "awake-system-action-events";
const REFLECTIONS_STORAGE_KEY = "awake-system-reflections";

function readStoredActionEvents(): SystemActionEvent[] {
  if (typeof window === "undefined") return [];

  try {
    const storedValue = localStorage.getItem(
      ACTION_EVENTS_STORAGE_KEY,
    );

    if (!storedValue) return [];

    return JSON.parse(storedValue) as SystemActionEvent[];
  } catch {
    return [];
  }
}

function getLocalDateKey(dateValue: string | Date): string {
  const date =
    typeof dateValue === "string"
      ? new Date(dateValue)
      : dateValue;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function readStoredReflections(): SavedReflection[] {
  if (typeof window === "undefined") return [];

  try {
    const storedValue = localStorage.getItem(REFLECTIONS_STORAGE_KEY);

    if (!storedValue) return [];

    return JSON.parse(storedValue) as SavedReflection[];
  } catch {
    return [];
  }
}

export default function SystemExperience({
  areaId,
  mapId,
  mapName,
  actions: templateActions,
}: SystemExperienceProps) {
  const defaultActions = useMemo<SystemAction[]>(
    () =>
      templateActions.map((action) => ({
        ...action,
      })),
    [templateActions],
  );

  const [actionEvents, setActionEvents] = useState<
    SystemActionEvent[]
  >([]);

  const [showReflection, setShowReflection] = useState(false);

  const [reflectionType, setReflectionType] =
    useState<ReflectionType | null>(null);

  const [reflectionText, setReflectionText] = useState("");

  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    setActionEvents(readStoredActionEvents());
  }, []);

  function saveActionEvents(
    nextEvents: SystemActionEvent[],
  ) {
    setActionEvents(nextEvents);

    localStorage.setItem(
      ACTION_EVENTS_STORAGE_KEY,
      JSON.stringify(nextEvents),
    );
  }
    function toggleAction(actionId: string) {
    const action = defaultActions.find(
      (item) => item.id === actionId,
    );

    if (!action) return;

    const todayKey = getLocalDateKey(new Date());

    const existingEvent = actionEvents.find(
      (event) =>
        event.mapId === mapId &&
        event.actionId === actionId &&
        getLocalDateKey(event.createdAt) === todayKey,
    );

    setSavedMessage("");

    if (existingEvent) {
      const nextEvents = actionEvents.filter(
        (event) => event.id !== existingEvent.id,
      );

      saveActionEvents(nextEvents);

      setShowReflection(false);
      setReflectionType(null);
      setReflectionText("");

      return;
    }

    const newEvent: SystemActionEvent = {
      id: crypto.randomUUID(),
      areaId,
      mapId,
      actionId: action.id,
      actionTitle: action.title,
      actionType: action.type,
      createdAt: new Date().toISOString(),
    };

    saveActionEvents([...actionEvents, newEvent]);
    setShowReflection(true);
  }

  function saveReflection() {
    if (!reflectionType) return;

    const trimmedText = reflectionText.trim();

    if (!trimmedText) return;

    const storedReflections = readStoredReflections();

    const newReflection: SavedReflection = {
      id: crypto.randomUUID(),
      areaId,
      mapId,
      type: reflectionType,
      text: trimmedText,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(
      REFLECTIONS_STORAGE_KEY,
      JSON.stringify([...storedReflections, newReflection]),
    );

    setReflectionText("");
    setReflectionType(null);
    setShowReflection(false);
    setSavedMessage("Saved to your journey.");
  }

  const maintenanceActions = defaultActions.filter(
    (action) => action.type === "maintenance",
  );

  const investmentActions = defaultActions.filter(
    (action) => action.type === "investment",
  );

  return (
    <div className="mt-12 space-y-10">
      <ActionSection
        title="Maintenance"
        description={`Small actions that help keep ${mapName} supported.`}
        actions={maintenanceActions}
        actionEvents={actionEvents}
        mapId={mapId}
        onToggle={toggleAction}
      />

      {investmentActions.length > 0 && (
        <ActionSection
          title="Investment"
          description={`Actions that may help ${mapName} improve or grow.`}
          actions={investmentActions}
          actionEvents={actionEvents}
          mapId={mapId}
          onToggle={toggleAction}
        />
      )}

      {showReflection && (
        <section className="rounded-[1.75rem] border border-emerald-100 bg-emerald-50/60 p-5">
          {!reflectionType ? (
            <>
              <h2 className="text-lg font-semibold text-stone-800">
                Leave something behind?
              </h2>

              <p className="mt-1 text-sm text-stone-500">
                Optional
              </p>

              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={() => setReflectionType("insight")}
                  className="w-full rounded-2xl border border-white bg-white px-4 py-4 text-left text-sm font-medium text-stone-700 shadow-sm transition hover:border-emerald-200"
                >
                  Today I learned...
                </button>

                <button
                  type="button"
                  onClick={() => setReflectionType("gratitude")}
                  className="w-full rounded-2xl border border-white bg-white px-4 py-4 text-left text-sm font-medium text-stone-700 shadow-sm transition hover:border-emerald-200"
                >
                  Today I am grateful for...
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowReflection(false);
                    setReflectionType(null);
                    setReflectionText("");
                  }}
                  className="w-full py-2 text-sm text-stone-400 transition hover:text-stone-600"
                >
                  Not today
                </button>
              </div>
            </>
          ) : (
            <>
              <label
                htmlFor="system-reflection"
                className="text-sm font-medium text-stone-700"
              >
                {reflectionType === "insight"
                  ? "Today I learned..."
                  : "Today I am grateful for..."}
              </label>

              <textarea
                id="system-reflection"
                value={reflectionText}
                onChange={(event) =>
                  setReflectionText(event.target.value)
                }
                placeholder={
                  reflectionType === "insight"
                    ? "I noticed..."
                    : "Something I appreciate..."
                }
                rows={3}
                autoFocus
                className="mt-3 w-full resize-none rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-800 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
              />

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={saveReflection}
                  disabled={!reflectionText.trim()}
                  className="flex-1 rounded-full bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Save
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setReflectionType(null);
                    setReflectionText("");
                  }}
                  className="rounded-full px-5 py-3 text-sm text-stone-500 transition hover:bg-white"
                >
                  Back
                </button>
              </div>
            </>
          )}
        </section>
      )}

      {savedMessage && (
        <p
          role="status"
          className="text-center text-sm text-emerald-700"
        >
          {savedMessage}
        </p>
      )}
    </div>
  );
}

type ActionSectionProps = {
  title: string;
  description: string;
  actions: SystemAction[];
  actionEvents: SystemActionEvent[];
  mapId: string;
  onToggle: (actionId: string) => void;
};

function ActionSection({
  title,
  description,
  actions,
  actionEvents,
  mapId,
  onToggle,
}: ActionSectionProps) {
  if (actions.length === 0) return null;

  const todayKey = getLocalDateKey(new Date());

  return (
    <section>
      <h2 className="text-xl font-semibold text-stone-800">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-stone-500">
        {description}
      </p>

      <div className="mt-4 space-y-3">
        {actions.map((action) => {
          const isCompleteToday = actionEvents.some(
            (event) =>
              event.mapId === mapId &&
              event.actionId === action.id &&
              getLocalDateKey(event.createdAt) === todayKey,
          );

          return (
            <button
              key={action.id}
              type="button"
              onClick={() => onToggle(action.id)}
              aria-pressed={isCompleteToday}
              className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                isCompleteToday
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-stone-200 bg-white hover:border-emerald-200"
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm ${
                  isCompleteToday
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-stone-300 text-transparent"
                }`}
              >
                ✓
              </span>

              <span
                className={`text-sm ${
                  isCompleteToday
                    ? "font-medium text-emerald-800"
                    : "text-stone-700"
                }`}
              >
                {action.title}
              </span>

              {isCompleteToday && (
                <span className="ml-auto text-xs font-medium text-emerald-700">
                  Today
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}