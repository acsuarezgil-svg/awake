"use client";

import { useEffect, useMemo, useState } from "react";

import type {
  FocusAreaActionType,
  FocusAreaCareAction,
} from "../../../systems";

type FocusAreaActionEvent = {
  id: string;
  systemId: string;
  focusAreaId: string;
  focusAreaTitle: string;
  actionId: string;
  actionTitle: string;
  actionType: FocusAreaActionType;
  createdAt: string;
};

type FocusAreaActionsProps = {
  systemId: string;
  focusAreaId: string;
  focusAreaTitle: string;
  savedActions?: FocusAreaCareAction[];
  isDark: boolean;
  onSaveActions: (
    actions: FocusAreaCareAction[],
  ) => void;
};

const ACTION_EVENTS_STORAGE_KEY =
  "awake-focus-area-action-events";

const actionTemplates: Record<
  string,
  FocusAreaCareAction[]
> = {
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

const defaultActions: FocusAreaCareAction[] = [
  {
    id: "default-check-in",
    title: "Check in with this area",
    type: "maintenance",
  },
  {
    id: "default-remove-obstacle",
    title: "Remove one small obstacle",
    type: "maintenance",
  },
  {
    id: "default-prepare-next-step",
    title: "Prepare the next step",
    type: "maintenance",
  },
  {
    id: "default-strengthen-system",
    title: "Strengthen this system",
    type: "investment",
  },
  {
    id: "default-small-improvement",
    title: "Try one small improvement",
    type: "investment",
  },
];

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
  savedActions,
  isDark,
  onSaveActions,
}: FocusAreaActionsProps) {
  const actions = useMemo(() => {
    if (savedActions !== undefined) {
      return savedActions;
    }

    const templateKey = normalizeTitle(focusAreaTitle);

    return actionTemplates[templateKey] ?? defaultActions;
  }, [focusAreaTitle, savedActions]);

  const [events, setEvents] = useState<
    FocusAreaActionEvent[]
  >([]);

  const [loaded, setLoaded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftActions, setDraftActions] = useState<
    FocusAreaCareAction[]
  >([]);
  const [validationError, setValidationError] =
    useState("");

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

  function toggleAction(action: FocusAreaCareAction) {
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

  function beginEditing() {
    setDraftActions(
      actions.map((action) => ({ ...action })),
    );
    setValidationError("");
    setIsEditing(true);
  }

  function cancelEditing() {
    setDraftActions([]);
    setValidationError("");
    setIsEditing(false);
  }

  function addAction(type: FocusAreaActionType) {
    setDraftActions((current) => [
      ...current,
      {
        id: `care-${crypto.randomUUID()}`,
        title: "",
        type,
      },
    ]);
    setValidationError("");
  }

  function renameAction(
    actionId: string,
    title: string,
  ) {
    setDraftActions((current) =>
      current.map((action) =>
        action.id === actionId
          ? { ...action, title }
          : action,
      ),
    );
    setValidationError("");
  }

  function deleteAction(actionId: string) {
    const hasHistory = events.some(
      (event) =>
        event.systemId === systemId &&
        event.focusAreaId === focusAreaId &&
        event.actionId === actionId,
    );

    if (
      hasHistory &&
      !window.confirm(
        "Remove this action? Its existing completion history will remain saved, but it will no longer appear in Care.",
      )
    ) {
      return;
    }

    setDraftActions((current) =>
      current.filter(
        (action) => action.id !== actionId,
      ),
    );
    setValidationError("");
  }

  function moveAction(
    actionId: string,
    direction: "up" | "down",
  ) {
    setDraftActions((current) => {
      const action = current.find(
        (item) => item.id === actionId,
      );

      if (!action) return current;

      const maintenance = current.filter(
        (item) => item.type === "maintenance",
      );
      const investment = current.filter(
        (item) => item.type === "investment",
      );
      const group =
        action.type === "maintenance"
          ? maintenance
          : investment;
      const currentIndex = group.findIndex(
        (item) => item.id === actionId,
      );
      const nextIndex =
        direction === "up"
          ? currentIndex - 1
          : currentIndex + 1;

      if (
        currentIndex < 0 ||
        nextIndex < 0 ||
        nextIndex >= group.length
      ) {
        return current;
      }

      const reorderedGroup = [...group];
      [
        reorderedGroup[currentIndex],
        reorderedGroup[nextIndex],
      ] = [
        reorderedGroup[nextIndex],
        reorderedGroup[currentIndex],
      ];

      return action.type === "maintenance"
        ? [...reorderedGroup, ...investment]
        : [...maintenance, ...reorderedGroup];
    });
  }

  function saveCustomization() {
    const normalizedActions = draftActions.map(
      (action) => ({
        ...action,
        title: action.title.trim(),
      }),
    );

    if (
      normalizedActions.some(
        (action) => action.title.length === 0,
      )
    ) {
      setValidationError(
        "Give each action a name before saving.",
      );
      return;
    }

    const hasDuplicates = (
      type: FocusAreaActionType,
    ) => {
      const names = normalizedActions
        .filter((action) => action.type === type)
        .map((action) => action.title.toLowerCase());

      return new Set(names).size !== names.length;
    };

    if (
      hasDuplicates("maintenance") ||
      hasDuplicates("investment")
    ) {
      setValidationError(
        "Action names need to be unique within each group.",
      );
      return;
    }

    onSaveActions(normalizedActions);
    setDraftActions([]);
    setValidationError("");
    setIsEditing(false);
  }

  if (!loaded) {
    return null;
  }

  const maintenanceActions = actions.filter(
    (action) => action.type === "maintenance",
  );

  const investmentActions = actions.filter(
    (action) => action.type === "investment",
  );

  return (
    <section id="care" className="mt-12">
      <div className="flex items-center justify-between gap-4">
        <p
          className={`text-xs uppercase tracking-[0.2em] ${
            isDark
              ? "text-slate-400"
              : "text-stone-400"
          }`}
        >
          Care
        </p>

        {!isEditing && (
          <button
            id="care-edit"
            type="button"
            onClick={beginEditing}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              isDark
                ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            Edit
          </button>
        )}
      </div>

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

      {isEditing ? (
        <div className="mt-7">
          <div className="space-y-9">
            <EditableActionGroup
              title="Maintenance"
              description="Small actions that help keep this system supported."
              type="maintenance"
              actions={draftActions.filter(
                (action) =>
                  action.type === "maintenance",
              )}
              isDark={isDark}
              onAdd={addAction}
              onRename={renameAction}
              onDelete={deleteAction}
              onMove={moveAction}
            />

            <EditableActionGroup
              title="Investment"
              description="Actions that may help this system grow stronger over time."
              type="investment"
              actions={draftActions.filter(
                (action) =>
                  action.type === "investment",
              )}
              isDark={isDark}
              onAdd={addAction}
              onRename={renameAction}
              onDelete={deleteAction}
              onMove={moveAction}
            />
          </div>

          {validationError && (
            <p
              role="alert"
              className={`mt-5 rounded-2xl px-4 py-3 text-sm ${
                isDark
                  ? "bg-rose-950/35 text-rose-200"
                  : "bg-rose-50 text-rose-700"
              }`}
            >
              {validationError}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={cancelEditing}
              className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                isDark
                  ? "text-slate-300 hover:bg-slate-800"
                  : "text-stone-500 hover:bg-stone-100"
              }`}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={saveCustomization}
              className={`rounded-xl px-5 py-3 text-sm font-semibold transition-colors ${
                isDark
                  ? "bg-stone-100 text-stone-900 hover:bg-white"
                  : "bg-stone-900 text-white hover:bg-stone-700"
              }`}
            >
              Save Care
            </button>
          </div>
        </div>
      ) : (
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
      )}
    </section>
  );
}

type ActionGroupProps = {
  title: string;
  description: string;
  actions: FocusAreaCareAction[];
  events: FocusAreaActionEvent[];
  systemId: string;
  focusAreaId: string;
  isDark: boolean;
  onToggle: (action: FocusAreaCareAction) => void;
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

type EditableActionGroupProps = {
  title: string;
  description: string;
  type: FocusAreaActionType;
  actions: FocusAreaCareAction[];
  isDark: boolean;
  onAdd: (type: FocusAreaActionType) => void;
  onRename: (
    actionId: string,
    title: string,
  ) => void;
  onDelete: (actionId: string) => void;
  onMove: (
    actionId: string,
    direction: "up" | "down",
  ) => void;
};

function EditableActionGroup({
  title,
  description,
  type,
  actions,
  isDark,
  onAdd,
  onRename,
  onDelete,
  onMove,
}: EditableActionGroupProps) {
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
        {actions.map((action, index) => (
          <div
            key={action.id}
            className={`rounded-3xl border p-4 ${
              isDark
                ? "border-white/10 bg-slate-800/55"
                : "border-stone-200 bg-white/75"
            }`}
          >
            <label
              htmlFor={`care-action-${action.id}`}
              className="sr-only"
            >
              {title} action
            </label>

            <input
              id={`care-action-${action.id}`}
              type="text"
              value={action.title}
              onChange={(event) =>
                onRename(
                  action.id,
                  event.target.value,
                )
              }
              placeholder="Action name"
              className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors ${
                isDark
                  ? "border-slate-600 bg-slate-900/55 text-stone-100 placeholder:text-slate-500 focus:border-slate-400"
                  : "border-stone-200 bg-white text-stone-800 placeholder:text-stone-400 focus:border-stone-400"
              }`}
            />

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  onMove(action.id, "up")
                }
                disabled={index === 0}
                className={`min-h-10 rounded-xl px-3 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
                  isDark
                    ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                <span aria-hidden="true">↑</span>
                <span className="sr-only">Move up</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onMove(action.id, "down")
                }
                disabled={index === actions.length - 1}
                className={`min-h-10 rounded-xl px-3 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
                  isDark
                    ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                <span aria-hidden="true">↓</span>
                <span className="sr-only">Move down</span>
              </button>

              <button
                type="button"
                onClick={() => onDelete(action.id)}
                className={`ml-auto min-h-10 rounded-xl px-3 text-xs font-medium transition-colors ${
                  isDark
                    ? "text-rose-300 hover:bg-rose-950/35"
                    : "text-rose-700 hover:bg-rose-50"
                }`}
              >
                <span aria-hidden="true">×</span>
                <span className="sr-only">Delete action</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onAdd(type)}
        className={`mt-3 min-h-11 w-full rounded-2xl border border-dashed px-4 text-sm font-medium transition-colors ${
          isDark
            ? "border-slate-600 text-slate-300 hover:border-slate-500 hover:bg-slate-800/55"
            : "border-stone-300 text-stone-600 hover:border-stone-400 hover:bg-white/65"
        }`}
      >
        Add action
      </button>
    </div>
  );
}
