"use client";

import { useEffect, useMemo, useState } from "react";

type ActionType = "maintenance" | "investment";

type FocusAreaAction = {
  id: string;
  title: string;
  type: ActionType;
};

type FocusAreaActionEvent = {
  id: string;
  systemId: string;
  focusAreaId: string;
  focusAreaTitle: string;
  actionId: string;
  actionTitle: string;
  actionType: ActionType;
  createdAt: string;
};

type FocusAreaActionsProps = {
  systemId: string;
  focusAreaId: string;
  focusAreaTitle: string;
  isDark: boolean;
};

const ACTION_EVENTS_STORAGE_KEY =
  "awake-focus-area-action-events";

const actionTemplates: Record<string, FocusAreaAction[]> = {
  exercise: [
    {
      id: "walk-15-minutes",
      title: "Walk for 15 minutes",
      type: "maintenance",
    },
    {
      id: "prepare-exercise-clothes",
      title: "Leave exercise clothes or shoes ready",
      type: "maintenance",
    },
    {
      id: "choose-movement-days",
      title: "Choose movement days for this week",
      type: "maintenance",
    },
    {
      id: "build-exercise-plan",
      title: "Build a simple exercise plan",
      type: "investment",
    },
  ],

  nutrition: [
    {
      id: "prepare-one-meal",
      title: "Prepare one nourishing meal",
      type: "maintenance",
    },
    {
      id: "prepare-water",
      title: "Keep water ready and accessible",
      type: "maintenance",
    },
    {
      id: "plan-tomorrow-meals",
      title: "Plan tomorrow's meals",
      type: "maintenance",
    },
    {
      id: "create-easy-meal-list",
      title: "Create a list of easy meal options",
      type: "investment",
    },
  ],

  sleep: [
    {
      id: "dim-lights",
      title: "Dim the lights before bed",
      type: "maintenance",
    },
    {
      id: "charge-phone-away",
      title: "Charge the phone away from the bed",
      type: "maintenance",
    },
    {
      id: "choose-wake-time",
      title: "Follow a consistent wake-up time",
      type: "maintenance",
    },
    {
      id: "shape-evening-routine",
      title: "Create a simple evening routine",
      type: "investment",
    },
  ],

  recovery: [
    {
      id: "pause-and-check-in",
      title: "Pause and check what your body needs",
      type: "maintenance",
    },
    {
      id: "take-rest-period",
      title: "Take a period of intentional rest",
      type: "maintenance",
    },
    {
      id: "reduce-one-demand",
      title: "Reduce one unnecessary demand",
      type: "maintenance",
    },
    {
      id: "create-recovery-plan",
      title: "Create a recovery plan for demanding days",
      type: "investment",
    },
  ],

  "preventative-care": [
    {
      id: "review-upcoming-care",
      title: "Review upcoming care needs",
      type: "maintenance",
    },
    {
      id: "record-health-question",
      title: "Record a question or change to remember",
      type: "maintenance",
    },
    {
      id: "organize-health-information",
      title: "Organize important health information",
      type: "maintenance",
    },
    {
      id: "plan-preventative-care",
      title: "Create a preventative-care plan",
      type: "investment",
    },
  ],
};

function normalizeTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
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

function readStoredEvents(): FocusAreaActionEvent[] {
  if (typeof window === "undefined") return [];

  try {
    const storedValue = localStorage.getItem(
      ACTION_EVENTS_STORAGE_KEY,
    );

    if (!storedValue) return [];

    const parsedValue = JSON.parse(storedValue);

    return Array.isArray(parsedValue)
      ? (parsedValue as FocusAreaActionEvent[])
      : [];
  } catch {
    return [];
  }
}

export default function FocusAreaActions({
  systemId,
  focusAreaId,
  focusAreaTitle,
  isDark,
}: FocusAreaActionsProps) {
  const actions = useMemo(() => {
    const templateKey = normalizeTitle(focusAreaTitle);

    return actionTemplates[templateKey] ?? [];
  }, [focusAreaTitle]);

  const [events, setEvents] = useState<
    FocusAreaActionEvent[]
  >([]);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    function loadEvents() {
      setEvents(readStoredEvents());
      setLoaded(true);
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === ACTION_EVENTS_STORAGE_KEY) {
        loadEvents();
      }
    }

    loadEvents();

    window.addEventListener("pageshow", loadEvents);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("pageshow", loadEvents);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  function saveEvents(nextEvents: FocusAreaActionEvent[]) {
    localStorage.setItem(
      ACTION_EVENTS_STORAGE_KEY,
      JSON.stringify(nextEvents),
    );

    setEvents(nextEvents);
  }

  function toggleAction(action: FocusAreaAction) {
    const todayKey = getLocalDateKey(new Date());
    const storedEvents = readStoredEvents();

    const existingEvent = storedEvents.find(
      (event) =>
        event.systemId === systemId &&
        event.focusAreaId === focusAreaId &&
        event.actionId === action.id &&
        getLocalDateKey(event.createdAt) === todayKey,
    );

    if (existingEvent) {
      saveEvents(
        storedEvents.filter(
          (event) => event.id !== existingEvent.id,
        ),
      );

      return;
    }

    const newEvent: FocusAreaActionEvent = {
      id: crypto.randomUUID(),
      systemId,
      focusAreaId,
      focusAreaTitle,
      actionId: action.id,
      actionTitle: action.title,
      actionType: action.type,
      createdAt: new Date().toISOString(),
    };

    saveEvents([...storedEvents, newEvent]);
  }

  if (!loaded || actions.length === 0) {
    return null;
  }

  const maintenanceActions = actions.filter(
    (action) => action.type === "maintenance",
  );

  const investmentActions = actions.filter(
    (action) => action.type === "investment",
  );

  return (
    <section className="mt-12">
      <p
        className={`text-xs uppercase tracking-[0.2em] ${
          isDark
            ? "text-slate-400"
            : "text-stone-400"
        }`}
      >
        Care
      </p>

      <h2
        className={`mt-2 text-2xl font-semibold ${
          isDark
            ? "text-stone-100"
            : "text-stone-800"
        }`}
      >
        How are you supporting this system?
      </h2>

      <p
        className={`mt-2 text-sm leading-6 ${
          isDark
            ? "text-slate-400"
            : "text-stone-500"
        }`}
      >
        These are repeatable actions, not tasks you
        have to finish forever.
      </p>

      <div className="mt-7 space-y-9">
        <ActionGroup
          title="Maintenance"
          description="Small actions that help keep this system supported."
          actions={maintenanceActions}
          events={events}
          systemId={systemId}
          focusAreaId={focusAreaId}
          isDark={isDark}
          onToggle={toggleAction}
        />

        <ActionGroup
          title="Investment"
          description="Actions that may help this system grow stronger over time."
          actions={investmentActions}
          events={events}
          systemId={systemId}
          focusAreaId={focusAreaId}
          isDark={isDark}
          onToggle={toggleAction}
        />
      </div>
    </section>
  );
}

type ActionGroupProps = {
  title: string;
  description: string;
  actions: FocusAreaAction[];
  events: FocusAreaActionEvent[];
  systemId: string;
  focusAreaId: string;
  isDark: boolean;
  onToggle: (action: FocusAreaAction) => void;
};

function ActionGroup({
  title,
  description,
  actions,
  events,
  systemId,
  focusAreaId,
  isDark,
  onToggle,
}: ActionGroupProps) {
  if (actions.length === 0) return null;

  const todayKey = getLocalDateKey(new Date());

  return (
    <div>
      <h3
        className={`text-lg font-semibold ${
          isDark
            ? "text-stone-100"
            : "text-stone-800"
        }`}
      >
        {title}
      </h3>

      <p
        className={`mt-1 text-sm leading-6 ${
          isDark
            ? "text-slate-400"
            : "text-stone-500"
        }`}
      >
        {description}
      </p>

      <div className="mt-4 space-y-3">
        {actions.map((action) => {
          const recordedToday = events.some(
            (event) =>
              event.systemId === systemId &&
              event.focusAreaId === focusAreaId &&
              event.actionId === action.id &&
              getLocalDateKey(event.createdAt) ===
                todayKey,
          );

          return (
            <button
              key={action.id}
              type="button"
              aria-pressed={recordedToday}
              onClick={() => onToggle(action)}
              className={`flex w-full items-center gap-4 rounded-3xl border px-5 py-4 text-left transition-colors duration-200 ${
                recordedToday
                  ? isDark
                    ? "border-emerald-700/60 bg-emerald-950/35"
                    : "border-emerald-200 bg-emerald-50"
                  : isDark
                    ? "border-white/10 bg-slate-800/45 hover:bg-slate-800/70"
                    : "border-stone-200 bg-white/65 hover:border-stone-300"
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm transition-colors duration-200 ${
                  recordedToday
                    ? isDark
                      ? "border-emerald-500 bg-emerald-700 text-white"
                      : "border-emerald-500 bg-emerald-500 text-white"
                    : isDark
                      ? "border-slate-600 text-transparent"
                      : "border-stone-300 text-transparent"
                }`}
              >
                ✓
              </span>

              <span
                className={`text-sm leading-6 transition-colors duration-200 ${
                  recordedToday
                    ? isDark
                      ? "font-medium text-emerald-200"
                      : "font-medium text-emerald-800"
                    : isDark
                      ? "text-stone-200"
                      : "text-stone-700"
                }`}
              >
                {action.title}
              </span>

              {recordedToday && (
                <span
                  className={`ml-auto text-xs font-medium transition-opacity duration-200 ${
                    isDark
                      ? "text-emerald-300"
                      : "text-emerald-700"
                  }`}
                >
                  Supported today
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
