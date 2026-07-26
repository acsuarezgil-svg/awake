"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createAwakeFocusArea } from "../../../systems";
import { getSystemTemplates } from "../../../systemTemplates";
import FocusAreaActions from "./FocusAreaActions";
import type {
    AwakeFocusArea,
    AwakeSystem,
    FocusAreaCareAction,
    SystemUnderstanding,
} from "../../../systems";
import {
  loadAwakeSystems,
  saveAwakeSystems,
} from "../../../systemStorage";
import {
  isDarkWheelTheme,
  isWheelTheme,
  wheelThemes,
  type WheelTheme,
} from "../../../theme";
import Link from "next/link";

type UnderstandingField = keyof SystemUnderstanding;

const understandingPrompts: Array<{
  field: UnderstandingField;
  title: string;
  helper: string;
  placeholder: string;
}> = [
  {
    field: "purpose",
    title: "Purpose",
    helper: "Why this system matters to me",
    placeholder:
      "Describe why this area matters to you...",
  },
  {
    field: "currentApproach",
    title: "Current approach",
    helper: "How this system works today",
    placeholder:
      "Describe how this currently works in your life...",
  },
  {
    field: "helps",
    title: "What supports it",
    helper: "What makes this easier",
    placeholder:
      "People, routines, environments, or choices that help...",
  },
  {
    field: "obstacles",
    title: "What gets in the way",
    helper: "What is making this difficult lately",
    placeholder:
      "Patterns, pressure, uncertainty, or circumstances...",
  },
  {
    field: "meetsNeed",
    title: "Working theory",
    helper:
      "What I currently believe helps this system work",
    placeholder:
      "Describe what you currently believe helps...",
  },
];

const emptyUnderstanding: SystemUnderstanding = {
  currentApproach: "",
  helps: "",
  obstacles: "",
  purpose: "",
  meetsNeed: "",
};

function formatUpdatedDate(value: string): string | null {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function SystemDetailPage() {
  const params = useParams<{
    id: string;
    focusAreaId: string;
    }>();

    const systemId = params.id;
    const focusAreaId = params.focusAreaId;

  const [systems, setSystems] = useState<AwakeSystem[]>([]);
  const [system, setSystem] =
    useState<AwakeSystem | null>(null);
    const [focusArea, setFocusArea] =
     useState<AwakeFocusArea | null>(null);



  const [understanding, setUnderstanding] =
    useState<SystemUnderstanding>(emptyUnderstanding);

  const [editingField, setEditingField] =
    useState<UnderstandingField | null>(null);

  const [draftValue, setDraftValue] = useState("");

  const [wheelTheme, setWheelTheme] =
    useState<WheelTheme>("roseSage");

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const storedSystems = loadAwakeSystems();
    const selectedSystem =
      storedSystems.find(
        (item) => item.id === systemId
      ) ?? null;

    let workingSystems = storedSystems;
    let workingSystem = selectedSystem;

    if (
        workingSystem &&
        !workingSystem.focusAreasInitialized
        ) {
        const templates = getSystemTemplates(
            workingSystem.title
        );

        workingSystem = {
            ...workingSystem,
            focusAreas: templates.map((title) =>
            createAwakeFocusArea(title)
            ),
            focusAreasInitialized: true,
        };

        workingSystems = storedSystems.map((item) =>
            item.id === workingSystem!.id
            ? workingSystem!
            : item
        );

        saveAwakeSystems(workingSystems);
        }

        const selectedFocusArea =
        workingSystem?.focusAreas.find(
            (item) => item.id === focusAreaId
        ) ?? null;

        const savedTheme = localStorage.getItem(
        "awake-wheel-theme"
        );

        setSystems(workingSystems);
        setSystem(workingSystem);
        setFocusArea(selectedFocusArea);

    if (selectedFocusArea) {
        setUnderstanding(
            {
              ...emptyUnderstanding,
              ...selectedFocusArea.understanding,
            }
        );
        } else {
        setUnderstanding(emptyUnderstanding);
        }

    if (savedTheme && isWheelTheme(savedTheme)) {
    setWheelTheme(savedTheme);
    }

    setLoaded(true);
}, [systemId, focusAreaId]);
  const activeTheme = wheelThemes[wheelTheme];
  const isDark = isDarkWheelTheme(wheelTheme);

  function beginEditing(field: UnderstandingField) {
    setEditingField(field);
    setDraftValue(understanding[field] ?? "");
  }

  function cancelEditing() {
    setEditingField(null);
    setDraftValue("");
  }

  function saveUnderstanding(field: UnderstandingField) {
    if (!system || !focusArea) return;

    const now = new Date().toISOString();
    const nextUnderstanding: SystemUnderstanding = {
      ...understanding,
      [field]: draftValue.trim(),
    };

    const updatedFocusArea: AwakeFocusArea = {
        ...focusArea,
        understanding: nextUnderstanding,
        updatedAt: now,
    };

    const updatedSystem: AwakeSystem = {
        ...system,
        focusAreas: system.focusAreas.map((item) =>
        item.id === focusArea.id
            ? updatedFocusArea
            : item
        ),
        updatedAt: now,
    };

    const updatedSystems = systems.map((item) =>
        item.id === system.id
        ? updatedSystem
        : item
    );

    saveAwakeSystems(updatedSystems);

    setSystems(updatedSystems);
    setSystem(updatedSystem);
    setFocusArea(updatedFocusArea);
    setUnderstanding(nextUnderstanding);
    setEditingField(null);
    setDraftValue("");
    }

  function saveCareActions(
    careActions: FocusAreaCareAction[],
  ) {
    if (!system || !focusArea) return;

    const now = new Date().toISOString();

    const updatedFocusArea: AwakeFocusArea = {
      ...focusArea,
      careActions,
      updatedAt: now,
    };

    const updatedSystem: AwakeSystem = {
      ...system,
      focusAreas: system.focusAreas.map((item) =>
        item.id === focusArea.id
          ? updatedFocusArea
          : item,
      ),
      updatedAt: now,
    };

    const updatedSystems = systems.map((item) =>
      item.id === system.id
        ? updatedSystem
        : item,
    );

    saveAwakeSystems(updatedSystems);

    setSystems(updatedSystems);
    setSystem(updatedSystem);
    setFocusArea(updatedFocusArea);
  }

    if (!loaded) {
    return null;
    }

    if (!system || !focusArea) {
    return (
        <main
        className={`min-h-screen px-5 py-8 ${
            isDark
            ? "text-stone-100"
            : "text-stone-800"
        }`}
        style={{
            background: activeTheme.pageBackground,
        }}
        >
        <section className="mx-auto w-full max-w-md">
            <Link
            href="/systems"
            className={`text-sm ${
                isDark
                ? "text-slate-400"
                : "text-stone-500"
            }`}
            >
            ← Systems
            </Link>

            <h1 className="mt-8 text-3xl font-semibold">
            Focus area not found
            </h1>
        </section>
        </main>
    );
    }
  const activitySections = [
    {
        title: "Observations",
        count: system.observations.length,
        description:
        "Moments, patterns, and connections you notice across this system.",
    },
    {
        title: "Experiments",
        count: focusArea.experiments.length,
        description:
        "Small changes you are testing in this focus area.",
    },
    {
        title: "Lessons",
        count: focusArea.lessons.length,
        description:
        "Understanding you want to carry forward.",
    },
    {
        title: "Gratitude",
        count: focusArea.gratitude.length,
        description:
        "What has supported you in this focus area.",
    },
    ];

  return (
    <main
      className={`min-h-screen w-full px-5 py-8 transition-[background] duration-500 ${
        isDark
          ? "text-stone-100"
          : "text-stone-800"
      }`}
      style={{
        background: activeTheme.pageBackground,
      }}
    >
      <section className="mx-auto w-full max-w-md">
        <Link
            href={`/systems/${system.id}`}
            className={`text-sm ${
                isDark
                ? "text-slate-400"
                : "text-stone-500"
            }`}
            >
            ← {system.title}
            </Link>

        <header className="mb-9 mt-7">
          <p
            className={`text-xs uppercase tracking-[0.22em] ${
              isDark
                ? "text-slate-400"
                : "text-stone-400"
            }`}
          >
            Focus Area
          </p>

          <h1
            className={`mt-2 text-4xl font-semibold tracking-tight ${
              isDark
                ? "text-stone-100"
                : "text-stone-900"
            }`}
          >
            {focusArea.title}
          </h1>

          <p
            className={`mt-4 leading-7 ${
              isDark
                ? "text-slate-300"
                : "text-stone-600"
            }`}
          >
            This is not something you have to
            finish. Update it as your understanding
            changes.
          </p>
        </header>


        <FocusAreaActions
          systemId={system.id}
          focusAreaId={focusArea.id}
          focusAreaTitle={focusArea.title}
          savedActions={focusArea.careActions}
          isDark={isDark}
          onSaveActions={saveCareActions}
        />

        <section className="mt-12">
          <p
            className={`text-xs uppercase tracking-[0.2em] ${
              isDark
                ? "text-slate-400"
                : "text-stone-400"
            }`}
          >
            Understanding
          </p>

          <h2
            className={`mt-2 text-2xl font-semibold ${
              isDark
                ? "text-stone-100"
                : "text-stone-800"
            }`}
          >
            What feels true right now?
          </h2>

          <p
            className={`mt-2 text-sm leading-6 ${
              isDark
                ? "text-slate-400"
                : "text-stone-500"
            }`}
          >
            Keep what is useful and revise it as your
            understanding changes.
          </p>

          <div className="mt-5 space-y-3">
            {understandingPrompts.map((item) => {
              const isEditing =
                editingField === item.field;
              const savedValue =
                understanding[item.field]?.trim();
              const updatedDate =
                focusArea.updatedAt !==
                focusArea.createdAt
                  ? formatUpdatedDate(
                      focusArea.updatedAt,
                    )
                  : null;

              return (
                <article
                  key={item.field}
                  className={`rounded-3xl border px-5 py-4 transition-colors duration-200 ${
                    isEditing
                      ? isDark
                        ? "border-slate-500 bg-slate-800/80"
                        : "border-stone-300 bg-white/90"
                      : isDark
                        ? "border-white/10 bg-slate-800/45"
                        : "border-stone-200 bg-white/65"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3
                        className={`font-semibold ${
                          isDark
                            ? "text-stone-100"
                            : "text-stone-800"
                        }`}
                      >
                        {item.title}
                      </h3>

                      <p
                        className={`mt-1 text-sm leading-5 ${
                          isDark
                            ? "text-slate-400"
                            : "text-stone-500"
                        }`}
                      >
                        {item.helper}
                      </p>
                    </div>

                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() =>
                          beginEditing(item.field)
                        }
                        className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                          isDark
                            ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                        }`}
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="mt-4">
                      <label
                        htmlFor={`understanding-${item.field}`}
                        className="sr-only"
                      >
                        {item.title}
                      </label>

                      <textarea
                        id={`understanding-${item.field}`}
                        value={draftValue}
                        onChange={(event) =>
                          setDraftValue(
                            event.target.value,
                          )
                        }
                        placeholder={item.placeholder}
                        rows={3}
                        autoFocus
                        className={`w-full resize-none rounded-2xl border px-4 py-3 text-sm leading-6 outline-none transition-colors ${
                          isDark
                            ? "border-slate-600 bg-slate-900/55 text-stone-100 placeholder:text-slate-500 focus:border-slate-400"
                            : "border-stone-200 bg-white text-stone-800 placeholder:text-stone-400 focus:border-stone-400"
                        }`}
                      />

                      <div className="mt-3 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                            isDark
                              ? "text-slate-300 hover:bg-slate-700"
                              : "text-stone-500 hover:bg-stone-100"
                          }`}
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            saveUnderstanding(
                              item.field,
                            )
                          }
                          className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                            isDark
                              ? "bg-stone-100 text-stone-900 hover:bg-white"
                              : "bg-stone-900 text-white hover:bg-stone-700"
                          }`}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <p
                        className={`whitespace-pre-wrap text-sm leading-6 ${
                          savedValue
                            ? isDark
                              ? "text-stone-200"
                              : "text-stone-700"
                            : isDark
                              ? "italic text-slate-500"
                              : "italic text-stone-400"
                        }`}
                      >
                        {savedValue || "Not added yet"}
                      </p>

                      {savedValue && updatedDate && (
                        <p
                          className={`mt-3 text-xs ${
                            isDark
                              ? "text-slate-500"
                              : "text-stone-400"
                          }`}
                        >
                          Updated {updatedDate}
                        </p>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>


        <section className="mt-12">
          <p
            className={`text-xs uppercase tracking-[0.2em] ${
              isDark
                ? "text-slate-400"
                : "text-stone-400"
            }`}
          >
            Activity
          </p>

          <h2
            className={`mt-2 text-2xl font-semibold ${
              isDark
                ? "text-stone-100"
                : "text-stone-800"
            }`}
          >
            What is changing over time?
          </h2>

          <div className="mt-5 space-y-3">
            {activitySections.map((item) => (
              <div
                key={item.title}
                className={`rounded-3xl border px-5 py-5 ${
                  isDark
                    ? "border-white/10 bg-slate-800/45"
                    : "border-stone-200 bg-white/55"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3
                      className={`text-lg font-semibold ${
                        isDark
                          ? "text-stone-100"
                          : "text-stone-800"
                      }`}
                    >
                      {item.title}
                    </h3>

                    <p
                      className={`mt-1 text-sm leading-6 ${
                        isDark
                          ? "text-slate-400"
                          : "text-stone-500"
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>

                  <span
                    className={`flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm font-medium ${
                      isDark
                        ? "bg-slate-700 text-slate-200"
                        : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {item.count}
                  </span>
                </div>

                <p
                  className={`mt-4 text-xs ${
                    isDark
                      ? "text-slate-500"
                      : "text-stone-400"
                  }`}
                >
                  Coming next
                </p>
              </div>
            ))}
          </div>
        </section>

        <p
          className={`my-8 text-center text-xs leading-5 ${
            isDark
              ? "text-slate-500"
              : "text-stone-400"
          }`}
        >
          Understanding can change without making
          the earlier version wrong.
        </p>
      </section>
    </main>
  );
}
