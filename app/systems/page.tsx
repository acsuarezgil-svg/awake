"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createAwakeSystem,
  type AwakeSystem,
} from "../systems";
import {
  loadAwakeSystems,
  saveAwakeSystems,
} from "../systemStorage";
import {
  isDarkWheelTheme,
  isWheelTheme,
  wheelThemes,
  type WheelTheme,
} from "../theme";

const systemGroups = [
  {
    title: "Self",
    systems: ["Self Trust", "Energy", "Health"],
  },
  {
    title: "Life",
    systems: [
      "Relationships",
      "Home",
      "Financial",
      "Boundaries",
    ],
  },
  {
    title: "Growth",
    systems: [
      "Learning",
      "Work",
      "Communication",
    ],
  },
];

export default function SystemsPage() {
  const router = useRouter();

  const [systems, setSystems] = useState<AwakeSystem[]>([]);
  const [customTitle, setCustomTitle] = useState("");
  const [showCustomInput, setShowCustomInput] =
    useState(false);
  const [loaded, setLoaded] = useState(false);

  const [wheelTheme, setWheelTheme] =
    useState<WheelTheme>("roseSage");

  useEffect(() => {
    const savedSystems = loadAwakeSystems();
    const savedTheme = localStorage.getItem(
      "awake-wheel-theme"
    );

    setSystems(savedSystems);

    if (savedTheme && isWheelTheme(savedTheme)) {
      setWheelTheme(savedTheme);
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    saveAwakeSystems(systems);
  }, [systems, loaded]);

  const activeTheme = wheelThemes[wheelTheme];
  const isDark = isDarkWheelTheme(wheelTheme);

  const defaultTitles = useMemo(
    () =>
      new Set(
        systemGroups.flatMap(
          (group) => group.systems
        )
      ),
    []
  );

  const customSystems = systems.filter(
    (system) => !defaultTitles.has(system.title)
  );

  function findSystem(title: string) {
    return systems.find(
      (system) =>
        system.title.toLowerCase() ===
        title.toLowerCase()
    );
  }

  function openSystem(title: string) {
    const cleanTitle = title.trim();

    if (!cleanTitle) return;

    const existingSystem = findSystem(cleanTitle);

    if (existingSystem) {
      router.push(`/systems/${existingSystem.id}`);
      return;
    }

    const newSystem = createAwakeSystem(cleanTitle);
    const updatedSystems = [...systems, newSystem];

    saveAwakeSystems(updatedSystems);
    setSystems(updatedSystems);

    router.push(`/systems/${newSystem.id}`);
  }

  function createCustomSystem() {
    const cleanTitle = customTitle.trim();

    if (!cleanTitle) return;

    openSystem(cleanTitle);
    setCustomTitle("");
    setShowCustomInput(false);
  }

  function getSystemStatus(title: string) {
    const system = findSystem(title);

    if (!system) {
      return "Ready to explore";
    }

    const entryCount =
      system.observations.length +
      system.experiments.length +
      system.lessons.length +
      system.gratitude.length;

    if (entryCount === 0) {
      return "Ready to explore";
    }

    return `${entryCount} ${
      entryCount === 1 ? "entry" : "entries"
    }`;
  }

  function renderSystemCard(title: string) {
    return (
      <button
        key={title}
        type="button"
        onClick={() => openSystem(title)}
        className={`flex w-full items-center justify-between rounded-3xl border px-5 py-5 text-left transition ${
          isDark
            ? "border-white/10 bg-slate-800/70 hover:border-white/20 hover:bg-slate-800"
            : "border-stone-200 bg-white/75 hover:border-stone-300 hover:bg-white hover:shadow-sm"
        }`}
      >
        <div>
          <h2
            className={`text-lg font-semibold ${
              isDark
                ? "text-stone-100"
                : "text-stone-800"
            }`}
          >
            {title}
          </h2>

          <p
            className={`mt-1 text-sm ${
              isDark
                ? "text-slate-400"
                : "text-stone-500"
            }`}
          >
            {getSystemStatus(title)}
          </p>
        </div>

        <span
          className={`text-xl ${
            isDark
              ? "text-slate-400"
              : "text-stone-400"
          }`}
        >
          →
        </span>
      </button>
    );
  }

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
          href="/"
          className={`text-sm transition ${
            isDark
              ? "text-slate-400 hover:text-stone-100"
              : "text-stone-500 hover:text-stone-800"
          }`}
        >
          ← Back
        </a>

        <header className="mb-9 mt-6">
          <p
            className={`text-xs uppercase tracking-[0.22em] ${
              isDark
                ? "text-slate-400"
                : "text-stone-400"
            }`}
          >
            Your living library
          </p>

          <h1
            className={`mt-2 text-4xl font-semibold tracking-tight ${
              isDark
                ? "text-stone-100"
                : "text-stone-900"
            }`}
          >
            Systems
          </h1>

          <p
            className={`mt-4 leading-7 ${
              isDark
                ? "text-slate-300"
                : "text-stone-600"
            }`}
          >
            Everything you understand becomes
            easier to shape.
          </p>
        </header>

        <div className="space-y-9">
          {systemGroups.map((group) => (
            <section key={group.title}>
              <p
                className={`mb-3 px-1 text-xs uppercase tracking-[0.2em] ${
                  isDark
                    ? "text-slate-400"
                    : "text-stone-400"
                }`}
              >
                {group.title}
              </p>

              <div className="space-y-3">
                {group.systems.map(
                  renderSystemCard
                )}
              </div>
            </section>
          ))}

          {customSystems.length > 0 && (
            <section>
              <p
                className={`mb-3 px-1 text-xs uppercase tracking-[0.2em] ${
                  isDark
                    ? "text-slate-400"
                    : "text-stone-400"
                }`}
              >
                Yours
              </p>

              <div className="space-y-3">
                {customSystems.map((system) =>
                  renderSystemCard(system.title)
                )}
              </div>
            </section>
          )}

          <section
            className={`rounded-3xl border p-5 ${
              isDark
                ? "border-white/10 bg-slate-900/35"
                : "border-stone-200 bg-white/55"
            }`}
          >
            {!showCustomInput ? (
              <button
                type="button"
                onClick={() =>
                  setShowCustomInput(true)
                }
                className={`flex w-full items-center justify-between text-left ${
                  isDark
                    ? "text-stone-100"
                    : "text-stone-800"
                }`}
              >
                <div>
                  <p className="font-semibold">
                    Create your own
                  </p>

                  <p
                    className={`mt-1 text-sm ${
                      isDark
                        ? "text-slate-400"
                        : "text-stone-500"
                    }`}
                  >
                    Add a system that is personal
                    to your life.
                  </p>
                </div>

                <span className="text-xl">＋</span>
              </button>
            ) : (
              <div>
                <label
                  htmlFor="custom-system"
                  className={`text-sm font-medium ${
                    isDark
                      ? "text-slate-200"
                      : "text-stone-700"
                  }`}
                >
                  Name your system
                </label>

                <div className="mt-3 flex gap-2">
                  <input
                    id="custom-system"
                    autoFocus
                    value={customTitle}
                    onChange={(event) =>
                      setCustomTitle(
                        event.target.value
                      )
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        createCustomSystem();
                      }

                      if (event.key === "Escape") {
                        setShowCustomInput(false);
                        setCustomTitle("");
                      }
                    }}
                    placeholder="Example: Creativity"
                    className={`min-w-0 flex-1 rounded-2xl border px-4 py-3 outline-none transition ${
                      isDark
                        ? "border-slate-600 bg-slate-800/80 text-stone-100 placeholder:text-slate-500 focus:border-slate-400"
                        : "border-stone-200 bg-white text-stone-800 placeholder:text-stone-400 focus:border-stone-400"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={createCustomSystem}
                    disabled={!customTitle.trim()}
                    className={`rounded-2xl px-5 py-3 font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                      isDark
                        ? "bg-slate-600 text-white hover:bg-slate-500"
                        : "bg-stone-900 text-white hover:bg-stone-700"
                    }`}
                  >
                    Add
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowCustomInput(false);
                    setCustomTitle("");
                  }}
                  className={`mt-3 text-sm ${
                    isDark
                      ? "text-slate-400"
                      : "text-stone-500"
                  }`}
                >
                  Cancel
                </button>
              </div>
            )}
          </section>
        </div>

        <p
          className={`mt-7 text-center text-xs leading-5 ${
            isDark
              ? "text-slate-500"
              : "text-stone-400"
          }`}
        >
          A system is not a rule. It can be
          observed, tested, and reshaped.
        </p>
      </section>
    </main>
  );
}