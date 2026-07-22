"use client";

import { useEffect, useState } from "react";
import {
  createAwakeSystem,
  defaultSystemTitles,
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

export default function SystemsPage() {
  const [systems, setSystems] = useState<AwakeSystem[]>([]);
  const [customTitle, setCustomTitle] = useState("");
  const [loaded, setLoaded] = useState(false);

  const [wheelTheme, setWheelTheme] =
    useState<WheelTheme>("roseSage");

  useEffect(() => {
    const savedSystems = loadAwakeSystems();
    const savedWheelTheme = localStorage.getItem(
      "awake-wheel-theme"
    );

    setSystems(savedSystems);

    if (
      savedWheelTheme &&
      isWheelTheme(savedWheelTheme)
    ) {
      setWheelTheme(savedWheelTheme);
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    saveAwakeSystems(systems);
  }, [systems, loaded]);

  const activeTheme = wheelThemes[wheelTheme];
  const isDark = isDarkWheelTheme(wheelTheme);

  function addSystem(title: string) {
    const cleanTitle = title.trim();

    if (!cleanTitle) return;

    const alreadyExists = systems.some(
      (system) =>
        system.title.toLowerCase() ===
        cleanTitle.toLowerCase()
    );

    if (alreadyExists) return;

    const newSystem = createAwakeSystem(cleanTitle);

    setSystems((current) => [
      ...current,
      newSystem,
    ]);

    setCustomTitle("");
  }

  const availableDefaults = defaultSystemTitles.filter(
    (title) =>
      !systems.some(
        (system) =>
          system.title.toLowerCase() ===
          title.toLowerCase()
      )
  );

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

        <div className="mb-8 mt-5">
          <p
            className={`mb-2 text-xs uppercase tracking-[0.22em] ${
              isDark
                ? "text-slate-400"
                : "text-stone-400"
            }`}
          >
            Understand what supports your life
          </p>

          <h1
            className={`text-4xl font-semibold tracking-tight ${
              isDark
                ? "text-stone-100"
                : "text-stone-900"
            }`}
          >
            Systems
          </h1>

          <p
            className={`mt-3 leading-7 ${
              isDark
                ? "text-slate-300"
                : "text-stone-600"
            }`}
          >
            Build a living understanding of what
            helps, what gets in the way, and what
            you are learning.
          </p>
        </div>

        {systems.length > 0 && (
          <section className="mb-9">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p
                  className={`text-xs uppercase tracking-[0.2em] ${
                    isDark
                      ? "text-slate-400"
                      : "text-stone-400"
                  }`}
                >
                  Your systems
                </p>

                <p
                  className={`mt-1 text-sm ${
                    isDark
                      ? "text-slate-300"
                      : "text-stone-500"
                  }`}
                >
                  {systems.length}{" "}
                  {systems.length === 1
                    ? "system"
                    : "systems"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {systems.map((system) => {
                const entryCount =
                  system.observations.length +
                  system.experiments.length +
                  system.lessons.length +
                  system.gratitude.length;

                return (
                  <button
                    key={system.id}
                    type="button"
                    className={`flex w-full items-center justify-between rounded-3xl border p-5 text-left transition ${
                      isDark
                        ? "border-white/10 bg-slate-800/75 hover:border-white/20 hover:bg-slate-800"
                        : "border-stone-200 bg-white/80 hover:border-stone-300 hover:shadow-sm"
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
                        {system.title}
                      </h2>

                      <p
                        className={`mt-1 text-sm ${
                          isDark
                            ? "text-slate-400"
                            : "text-stone-500"
                        }`}
                      >
                        {entryCount === 0
                          ? "Ready to understand"
                          : `${entryCount} ${
                              entryCount === 1
                                ? "entry"
                                : "entries"
                            }`}
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
              })}
            </div>
          </section>
        )}

        <section
          className={`rounded-[2rem] border p-5 ${
            isDark
              ? "border-white/10 bg-slate-900/35"
              : "border-stone-200 bg-white/55"
          }`}
        >
          <p
            className={`text-xs uppercase tracking-[0.2em] ${
              isDark
                ? "text-slate-400"
                : "text-stone-400"
            }`}
          >
            {systems.length === 0
              ? "Choose where to begin"
              : "Add another system"}
          </p>

          <h2
            className={`mt-2 text-xl font-semibold ${
              isDark
                ? "text-stone-100"
                : "text-stone-800"
            }`}
          >
            What part of life would you like to
            understand?
          </h2>

          {availableDefaults.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {availableDefaults.map((title) => (
                <button
                  key={title}
                  type="button"
                  onClick={() => addSystem(title)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    isDark
                      ? "border-white/15 bg-slate-800/70 text-slate-200 hover:border-white/25"
                      : "border-stone-200 bg-white text-stone-600 hover:border-stone-400"
                  }`}
                >
                  + {title}
                </button>
              ))}
            </div>
          )}

          <div
            className={`my-6 border-t ${
              isDark
                ? "border-white/10"
                : "border-stone-200"
            }`}
          />

          <label
            htmlFor="custom-system"
            className={`text-sm font-medium ${
              isDark
                ? "text-slate-200"
                : "text-stone-700"
            }`}
          >
            Create your own
          </label>

          <div className="mt-3 flex gap-2">
            <input
              id="custom-system"
              value={customTitle}
              onChange={(event) =>
                setCustomTitle(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  addSystem(customTitle);
                }
              }}
              placeholder="Name your system"
              className={`min-w-0 flex-1 rounded-2xl border px-4 py-3 outline-none transition ${
                isDark
                  ? "border-slate-600 bg-slate-800/80 text-stone-100 placeholder:text-slate-500 focus:border-slate-400"
                  : "border-stone-200 bg-white text-stone-800 placeholder:text-stone-400 focus:border-stone-400"
              }`}
            />

            <button
              type="button"
              onClick={() => addSystem(customTitle)}
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
        </section>

        <p
          className={`mt-6 text-center text-xs leading-5 ${
            isDark
              ? "text-slate-500"
              : "text-stone-400"
          }`}
        >
          A system is not a rule. It is something
          you can observe, test, and reshape.
        </p>
      </section>
    </main>
  );
}