"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { translations, type Language } from "../translations";
import {
  isDarkWheelTheme,
  isWheelTheme,
  wheelThemes,
  type WheelTheme,
} from "../theme";

const defaultPatterns = ["Urgency", "Overthinking", "Avoidance"];
const defaultInvestments = ["Exercise", "Learning", "Creativity"];

const defaultValues = [
  "Honesty",
  "Kindness",
  "Growth",
  "Health",
  "Family",
  "Courage",
  "Creativity",
  "Peace",
];

const defaultBoundaries = [
  "Pause",
  "Say No",
  "Rest",
  "Protect Sleep",
  "Leave",
  "Ask for Help",
  "Limit Work",
  "Take Space",
];

type WheelView = "awareness" | "compass";

type WheelSection =
  | "direction"
  | "patterns"
  | "investments"
  | "values"
  | "boundaries";

const defaultDirections = [
  "Rest",
  "Health",
  "Creativity",
  "Learning",
  "Connection",
  "Peace",
  "Purpose",
  "Play",
  "Faith",
  "Self-Understanding",
];

export default function DirectionPage() {
  const [patterns, setPatterns] = useState(defaultPatterns);
  const [investments, setInvestments] = useState(defaultInvestments);
  const [values, setValues] = useState(defaultValues);
  const [boundaries, setBoundaries] =
    useState(defaultBoundaries);

  const [wheelView, setWheelView] =
    useState<WheelView>("awareness");
  const [directions, setDirections] = useState(defaultDirections);
  const [selected, setSelected] = useState<string[]>([]);
  const [language, setLanguage] = useState<Language>("en");
  const [wheelTheme, setWheelTheme] =
    useState<WheelTheme>("roseSage");
  const [activeSection, setActiveSection] =
  useState<WheelSection>("direction");

  const t = translations[language];

  useEffect(() => {
    const savedPatterns = localStorage.getItem("awake-patterns");
    const savedInvestments = localStorage.getItem("awake-investments");
    const savedDirections = localStorage.getItem("awake-directions");
    const savedSelected = localStorage.getItem("awake-direction");
    const savedLanguage = localStorage.getItem("awake-language") as Language | null;
    const savedWheelView = localStorage.getItem("awake-wheel-view");
    const savedValues = localStorage.getItem("awake-values");
    const savedBoundaries = localStorage.getItem("awake-boundaries");

    if (
      savedWheelView === "awareness" ||
      savedWheelView === "compass"
    ) {
      setWheelView(savedWheelView);

      if (savedWheelView === "compass") {
        setActiveSection("values");
      }
    }

    if (savedValues) {
      setValues(JSON.parse(savedValues));
    }

    if (savedBoundaries) {
      setBoundaries(JSON.parse(savedBoundaries));
    }

    if (savedPatterns) {
      setPatterns(JSON.parse(savedPatterns));
    }

    if (savedInvestments) {
      setInvestments(JSON.parse(savedInvestments));
    }

    if (savedDirections) {
      setDirections(JSON.parse(savedDirections));
    }

    if (savedSelected) {
      setSelected(JSON.parse(savedSelected));
    }

    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
    const savedWheelTheme = localStorage.getItem(
      "awake-wheel-theme"
    );

    if (savedWheelTheme && isWheelTheme(savedWheelTheme)) {
      setWheelTheme(savedWheelTheme);
    }
  }, []);

  function savePatterns(updated: string[]) {
    setPatterns(updated);
    localStorage.setItem("awake-patterns", JSON.stringify(updated));
  }

  function saveInvestments(updated: string[]) {
    setInvestments(updated);
    localStorage.setItem("awake-investments", JSON.stringify(updated));
  }

  function saveValues(updated: string[]) {
    setValues(updated);
    localStorage.setItem(
      "awake-values",
      JSON.stringify(updated)
    );
  }

  function saveBoundaries(updated: string[]) {
    setBoundaries(updated);
    localStorage.setItem(
      "awake-boundaries",
      JSON.stringify(updated)
    );
  }

  function saveDirections(updated: string[]) {
    setDirections(updated);
    localStorage.setItem("awake-directions", JSON.stringify(updated));
  }

  function saveSelected(updated: string[]) {
    setSelected(updated);
    localStorage.setItem("awake-direction", JSON.stringify(updated));
  }

  function toggleDirection(item: string) {
    if (selected.includes(item)) {
      saveSelected(selected.filter((value) => value !== item));
      return;
    }

    saveSelected([...selected, item]);
  }

  function addPattern() {
    const name = prompt("New pattern:")?.trim();

    if (!name || patterns.includes(name)) return;

    savePatterns([...patterns, name]);
  }

  function editPattern(oldName: string) {
    const newName = prompt("Edit pattern:", oldName)?.trim();

    if (!newName || newName === oldName) return;
    if (patterns.includes(newName)) return;

    savePatterns(
      patterns.map((item) => (item === oldName ? newName : item))
    );
  }

  function deletePattern(name: string) {
    const confirmed = confirm(`Delete pattern "${name}"?`);

    if (!confirmed) return;

    savePatterns(patterns.filter((item) => item !== name));
  }

  function addInvestment() {
    const name = prompt("New investment:")?.trim();

    if (!name || investments.includes(name)) return;

    saveInvestments([...investments, name]);
  }

  function editInvestment(oldName: string) {
    const newName = prompt(
      "Edit investment:",
      oldName
    )?.trim();

    if (!newName || newName === oldName) return;
    if (investments.includes(newName)) return;

    saveInvestments(
      investments.map((item) =>
        item === oldName ? newName : item
      )
    );
  }

  function deleteInvestment(name: string) {
    const confirmed = confirm(
      `Delete investment "${name}"?`
    );

    if (!confirmed) return;

    saveInvestments(
      investments.filter((item) => item !== name)
    );
  }

  function addDirection() {
    const name = prompt("New direction:")?.trim();

    if (!name || directions.includes(name)) return;

    saveDirections([...directions, name]);
  }

  function editDirection(oldName: string) {
    const newName = prompt(
      "Edit direction:",
      oldName
    )?.trim();

    if (!newName || newName === oldName) return;
    if (directions.includes(newName)) return;

    const updatedDirections = directions.map((item) =>
      item === oldName ? newName : item
    );

    const updatedSelected = selected.map((item) =>
      item === oldName ? newName : item
    );

    saveDirections(updatedDirections);
    saveSelected(updatedSelected);
  }

  function deleteDirection(name: string) {
    const isDefault = defaultDirections.includes(name);

    const confirmed = confirm(
      isDefault
        ? `"${name}" is a default Awake direction.\n\nAre you sure you want to delete it?`
        : `Delete direction "${name}"?`
    );

    if (!confirmed) return;

    saveDirections(
      directions.filter((item) => item !== name)
    );

    saveSelected(
      selected.filter((item) => item !== name)
    );
  }

  const activeTheme = wheelThemes[wheelTheme];
  const isDark = isDarkWheelTheme(wheelTheme);

  return (
    <main
      className={`min-h-screen px-5 py-8 transition-[background] duration-500 ${
        isDark ? "text-stone-100" : "text-stone-800"
      }`}
      style={{
        background: activeTheme.pageBackground,
      }}
    >
      <section className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="text-sm text-stone-400 transition hover:text-stone-700"
        >
          {t.back}
        </Link>

        <header className="mt-10 text-center">
          <p className="text-xs lowercase tracking-[0.4em] text-stone-400">
            shape your wheel
          </p>

          <h1
            className={`mt-4 text-3xl font-light ${
              isDark ? "text-stone-100" : "text-stone-800"
            }`}
          >
            What are you learning to notice?
          </h1>

          <p
            className={`mx-auto mt-3 max-w-md text-sm leading-6 ${
              isDark ? "text-slate-300" : "text-stone-400"
            }`}
          >
            Your wheel can change as you discover new patterns,
            investments, and directions.
          </p>
        </header>
        <nav
          aria-label="Shape your wheel sections"
          className={`mx-auto mt-8 flex w-full max-w-md rounded-full border p-1 ${
            isDark
              ? "border-white/10 bg-slate-900/60"
              : "border-stone-200 bg-white/80"
          }`}
        >
          {(
            wheelView === "awareness"
              ? ([
                  ["direction", "Direction"],
                  ["patterns", "Patterns"],
                  ["investments", "Investments"],
                ] as const)
              : ([
                  ["values", "Values"],
                  ["boundaries", "Boundaries"],
                ] as const)
          ).map(([sectionKey, label]) => {
            const isActive = activeSection === sectionKey;

            return (
              <button
                key={sectionKey}
                type="button"
                onClick={() => setActiveSection(sectionKey)}
                aria-pressed={isActive}
                className={`min-w-0 flex-1 rounded-full px-2 py-2.5 text-xs transition sm:text-sm ${
                  isActive
                    ? isDark
                      ? "bg-slate-700 text-stone-100 shadow-sm"
                      : "bg-stone-800 text-white shadow-sm"
                    : isDark
                      ? "text-slate-400 hover:text-stone-100"
                      : "text-stone-400 hover:text-stone-700"
                }`}
              >
                {label}
              </button>
            );
          })}
        </nav>

        {activeSection === "patterns" && (
          <section
            className={`mt-8 rounded-3xl border px-5 py-6 transition-colors duration-500 ${
              isDark
                ? "border-rose-400/20 bg-slate-800/70"
                : "border-rose-100 bg-rose-50/40"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  className={`text-xl font-light ${
                    isDark ? "text-stone-100" : "text-stone-700"
                  }`}
                >
                  Patterns
                </h2>

                <p
                  className={`mt-1 text-sm leading-6 ${
                    isDark ? "text-slate-300" : "text-stone-400"
                  }`}
                >
                  What takes energy or keeps returning?
                </p>
              </div>

              <button
                type="button"
                onClick={addPattern}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  isDark
                    ? "border-rose-400/20 bg-slate-700 text-stone-100 hover:bg-slate-600"
                    : "border-rose-200 bg-white text-stone-500 hover:border-rose-300 hover:text-stone-700"
                }`}
              >
                + Add
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {patterns.map((item) => (
                <div
                  key={item}
                  className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition-colors ${
                    isDark
                      ? "border-slate-600 bg-slate-700/80"
                      : "border-rose-100 bg-white"
                  }`}
                >
                  <span
                    className={`min-w-0 flex-1 text-sm ${
                      isDark ? "text-stone-100" : "text-stone-700"
                    }`}
                  >
                    {item}
                  </span>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => editPattern(item)}
                      className="rounded-full px-3 py-1 text-xs text-stone-400 transition hover:bg-stone-50 hover:text-stone-700"
                    >
                      {t.edit}
                    </button>

                    <button
                      type="button"
                      onClick={() => deletePattern(item)}
                      className="rounded-full px-3 py-1 text-xs text-rose-400 transition hover:bg-rose-50 hover:text-rose-700"
                    >
                      {t.delete}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeSection === "investments" && (
          <section
            className={`mt-8 rounded-3xl border px-5 py-6 transition-colors duration-500 ${
              isDark
                ? "border-emerald-400/20 bg-slate-800/70"
                : "border-emerald-100 bg-emerald-50/40"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  className={`text-xl font-light ${
                    isDark ? "text-stone-100" : "text-stone-700"
                  }`}
                >
                  Investments
                </h2>

                <p
                  className={`mt-1 text-sm leading-6 ${
                    isDark ? "text-slate-300" : "text-stone-400"
                  }`}
                >
                  What do you want to nurture or grow?
                </p>
              </div>

              <button
                type="button"
                onClick={addInvestment}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  isDark
                    ? "border-emerald-400/20 bg-slate-700 text-stone-100 hover:bg-slate-600"
                    : "border-emerald-200 bg-white text-stone-500 hover:border-emerald-300 hover:text-stone-700"
                }`}
              >
                + Add
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {investments.map((item) => (
                <div
                  key={item}
                  className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition-colors ${
                    isDark
                      ? "border-slate-600 bg-slate-700/80"
                      : "border-emerald-100 bg-white"
                  }`}
                >
                  <span
                    className={`min-w-0 flex-1 text-sm ${
                      isDark ? "text-stone-100" : "text-stone-700"
                    }`}
                  >
                    {item}
                  </span>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => editInvestment(item)}
                      className="rounded-full px-3 py-1 text-xs text-stone-400 transition hover:bg-stone-50 hover:text-stone-700"
                    >
                      {t.edit}
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteInvestment(item)}
                      className="rounded-full px-3 py-1 text-xs text-emerald-500 transition hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      {t.delete}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeSection === "direction" && (
          <section
            className={`mt-8 rounded-3xl border px-5 py-6 transition-colors duration-500 ${
              isDark
                ? "border-sky-400/20 bg-slate-800/70"
                : "border-sky-100 bg-sky-50/40"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  className={`text-xl font-light ${
                    isDark ? "text-stone-100" : "text-stone-700"
                  }`}
                >
                  Your direction
                </h2>

                <p
                  className={`mt-1 text-sm leading-6 ${
                    isDark ? "text-slate-300" : "text-stone-400"
                  }`}
                >
                  What do you want more of in your life?
                </p>
              </div>

              <button
                type="button"
                onClick={addDirection}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  isDark
                    ? "border-sky-400/20 bg-slate-700 text-stone-100 hover:bg-slate-600"
                    : "border-sky-200 bg-white text-stone-500 hover:border-sky-300 hover:text-stone-700"
                }`}
              >
                + Add
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {directions.map((item) => {
                const isSelected = selected.includes(item);

                return (
                  <div
                    key={item}
                    className={`rounded-2xl border px-4 py-3 transition ${
                      isDark
                        ? isSelected
                          ? "border-sky-400/40 bg-slate-600/90"
                          : "border-slate-600 bg-slate-700/80"
                        : isSelected
                          ? "border-sky-200 bg-sky-100/70"
                          : "border-sky-100 bg-white"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleDirection(item)}
                      aria-pressed={isSelected}
                      className={`w-full text-left text-sm ${
                        isDark ? "text-stone-100" : "text-stone-700"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span>{item}</span>

                        <span
                          className={`text-xs ${
                            isSelected
                              ? isDark
                                ? "text-sky-300"
                                : "text-sky-600"
                              : isDark
                                ? "text-slate-400"
                                : "text-stone-300"
                          }`}
                        >
                          {isSelected ? "Selected" : "Choose"}
                        </span>
                      </span>
                    </button>

                    <div
                      className={`mt-3 flex gap-2 border-t pt-3 ${
                        isDark ? "border-slate-600" : "border-sky-100"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => editDirection(item)}
                        className="rounded-full px-3 py-1 text-xs text-stone-400 transition hover:text-stone-200"
                      >
                        {t.edit}
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteDirection(item)}
                        className="rounded-full px-3 py-1 text-xs text-sky-500 transition hover:text-sky-300"
                      >
                        {t.delete}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/"
            className="inline-flex rounded-full border border-stone-200 px-5 py-2.5 text-sm text-stone-500 transition hover:border-stone-300 hover:text-stone-700"
          >
            Return to your wheel
          </Link>
        </div>
      </section>
    </main>
  );
}