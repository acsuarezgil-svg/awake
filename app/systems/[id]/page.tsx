"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type {
  AwakeSystem,
  SystemUnderstanding,
} from "../../systems";
import {
  loadAwakeSystems,
  saveAwakeSystems,
} from "../../systemStorage";
import {
  isDarkWheelTheme,
  isWheelTheme,
  wheelThemes,
  type WheelTheme,
} from "../../theme";

type UnderstandingField = keyof SystemUnderstanding;

const understandingPrompts: Array<{
  field: UnderstandingField;
  title: string;
  prompt: string;
  placeholder: string;
}> = [
  {
    field: "currentApproach",
    title: "Current approach",
    prompt: "How does this currently work in your life?",
    placeholder:
      "Describe what you usually do, expect, avoid, or rely on...",
  },
  {
    field: "helps",
    title: "What helps",
    prompt: "What supports this system when it is working well?",
    placeholder:
      "People, routines, environments, choices, reminders...",
  },
  {
    field: "obstacles",
    title: "What gets in the way",
    prompt: "What tends to make this harder?",
    placeholder:
      "Patterns, pressure, uncertainty, habits, circumstances...",
  },
  {
    field: "purpose",
    title: "Purpose",
    prompt:
      "What need is your current approach trying to meet?",
    placeholder:
      "Protection, belonging, rest, control, safety, understanding...",
  },
  {
    field: "meetsNeed",
    title: "What you are discovering",
    prompt:
      "Is this approach meeting the need, or does something need to change?",
    placeholder:
      "What seems true now? What might be worth trying differently?",
  },
];

export default function SystemDetailPage() {
  const params = useParams();
  const systemId = params.id as string;

  const [systems, setSystems] = useState<AwakeSystem[]>([]);
  const [system, setSystem] =
    useState<AwakeSystem | null>(null);

  const [understanding, setUnderstanding] =
    useState<SystemUnderstanding>({
      currentApproach: "",
      helps: "",
      obstacles: "",
      purpose: "",
      meetsNeed: "",
    });

  const [wheelTheme, setWheelTheme] =
    useState<WheelTheme>("roseSage");

  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedSystems = loadAwakeSystems();
    const selectedSystem =
      storedSystems.find(
        (item) => item.id === systemId
      ) ?? null;

    const savedTheme = localStorage.getItem(
      "awake-wheel-theme"
    );

    setSystems(storedSystems);
    setSystem(selectedSystem);

    if (selectedSystem) {
      setUnderstanding(
        selectedSystem.understanding
      );
    }

    if (savedTheme && isWheelTheme(savedTheme)) {
      setWheelTheme(savedTheme);
    }

    setLoaded(true);
  }, [systemId]);

  const activeTheme = wheelThemes[wheelTheme];
  const isDark = isDarkWheelTheme(wheelTheme);

  function updateUnderstanding(
    field: UnderstandingField,
    value: string
  ) {
    setUnderstanding((current) => ({
      ...current,
      [field]: value,
    }));

    setSaved(false);
  }

  function saveUnderstanding() {
    if (!system) return;

    const now = new Date().toISOString();

    const updatedSystem: AwakeSystem = {
      ...system,
      understanding,
      updatedAt: now,
    };

    const updatedSystems = systems.map((item) =>
      item.id === system.id ? updatedSystem : item
    );

    saveAwakeSystems(updatedSystems);

    setSystems(updatedSystems);
    setSystem(updatedSystem);
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2200);
  }

  if (!loaded) {
    return null;
  }

  if (!system) {
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
          <a
            href="/systems"
            className={`text-sm ${
              isDark
                ? "text-slate-400"
                : "text-stone-500"
            }`}
          >
            ← Systems
          </a>

          <h1 className="mt-8 text-3xl font-semibold">
            System not found
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
        "Moments, patterns, and connections you notice.",
    },
    {
      title: "Experiments",
      count: system.experiments.length,
      description:
        "Small changes you are testing in real life.",
    },
    {
      title: "Lessons",
      count: system.lessons.length,
      description:
        "Understanding you want to carry forward.",
    },
    {
      title: "Gratitude",
      count: system.gratitude.length,
      description:
        "What has supported you in this part of life.",
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
        <a
          href="/systems"
          className={`text-sm transition ${
            isDark
              ? "text-slate-400 hover:text-stone-100"
              : "text-stone-500 hover:text-stone-800"
          }`}
        >
          ← Systems
        </a>

        <header className="mb-9 mt-7">
          <p
            className={`text-xs uppercase tracking-[0.22em] ${
              isDark
                ? "text-slate-400"
                : "text-stone-400"
            }`}
          >
            Understanding
          </p>

          <h1
            className={`mt-2 text-4xl font-semibold tracking-tight ${
              isDark
                ? "text-stone-100"
                : "text-stone-900"
            }`}
          >
            {system.title}
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

        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p
                className={`text-xs uppercase tracking-[0.2em] ${
                  isDark
                    ? "text-slate-400"
                    : "text-stone-400"
                }`}
              >
                Foundation
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
            </div>
          </div>

          <div className="space-y-4">
            {understandingPrompts.map((item) => (
              <article
                key={item.field}
                className={`rounded-[1.75rem] border p-5 ${
                  isDark
                    ? "border-white/10 bg-slate-800/65"
                    : "border-stone-200 bg-white/75"
                }`}
              >
                <label
                  htmlFor={item.field}
                  className={`block text-xs uppercase tracking-[0.17em] ${
                    isDark
                      ? "text-slate-400"
                      : "text-stone-400"
                  }`}
                >
                  {item.title}
                </label>

                <p
                  className={`mt-3 text-lg font-medium leading-7 ${
                    isDark
                      ? "text-stone-100"
                      : "text-stone-800"
                  }`}
                >
                  {item.prompt}
                </p>

                <textarea
                  id={item.field}
                  value={understanding[item.field]}
                  onChange={(event) =>
                    updateUnderstanding(
                      item.field,
                      event.target.value
                    )
                  }
                  placeholder={item.placeholder}
                  rows={4}
                  className={`mt-4 w-full resize-none rounded-2xl border px-4 py-3 leading-6 outline-none transition ${
                    isDark
                      ? "border-slate-600 bg-slate-900/55 text-stone-100 placeholder:text-slate-500 focus:border-slate-400"
                      : "border-stone-200 bg-white/85 text-stone-800 placeholder:text-stone-400 focus:border-stone-400"
                  }`}
                />
              </article>
            ))}
          </div>

          <button
            type="button"
            onClick={saveUnderstanding}
            className={`mt-5 w-full rounded-2xl px-5 py-4 text-base font-semibold transition ${
              saved
                ? isDark
                  ? "bg-emerald-800/70 text-emerald-100"
                  : "bg-emerald-100 text-emerald-800"
                : isDark
                  ? "bg-stone-100 text-stone-900 hover:bg-white"
                  : "bg-stone-900 text-white hover:bg-stone-700"
            }`}
          >
            {saved
              ? "Understanding saved"
              : "Save understanding"}
          </button>
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