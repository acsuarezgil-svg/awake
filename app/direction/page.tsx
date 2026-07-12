"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { translations, type Language } from "../translations";

const defaultPatterns = ["Urgency", "Overthinking", "Avoidance"];
const defaultInvestments = ["Exercise", "Learning", "Creativity"];

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
  const [directions, setDirections] = useState(defaultDirections);
  const [selected, setSelected] = useState<string[]>([]);
  const [language, setLanguage] = useState<Language>("en");

  const t = translations[language];

  useEffect(() => {
    const savedPatterns = localStorage.getItem("awake-patterns");
    const savedInvestments = localStorage.getItem("awake-investments");
    const savedDirections = localStorage.getItem("awake-directions");
    const savedSelected = localStorage.getItem("awake-direction");
    const savedLanguage = localStorage.getItem(
      "awake-language"
    ) as Language | null;

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
  }, []);

  function savePatterns(updated: string[]) {
    setPatterns(updated);
    localStorage.setItem("awake-patterns", JSON.stringify(updated));
  }

  function saveInvestments(updated: string[]) {
    setInvestments(updated);
    localStorage.setItem("awake-investments", JSON.stringify(updated));
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

  return (
    <main className="min-h-screen bg-white px-5 py-8">
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

          <h1 className="mt-4 text-3xl font-light text-stone-800">
            What are you learning to notice?
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-400">
            Your wheel can change as you discover new patterns,
            investments, and directions.
          </p>
        </header>

        <section className="mt-12 rounded-3xl border border-rose-100 bg-rose-50/40 px-5 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-light text-stone-700">
                Patterns
              </h2>

              <p className="mt-1 text-sm leading-6 text-stone-400">
                What takes energy or keeps returning?
              </p>
            </div>

            <button
              type="button"
              onClick={addPattern}
              className="rounded-full border border-rose-200 bg-white px-3 py-1.5 text-sm text-stone-500 transition hover:border-rose-300 hover:text-stone-700"
            >
              + Add
            </button>
          </div>

          <div className="mt-6 space-y-3">
            {patterns.map((item) => (
              <div
                key={item}
                className="flex items-center justify-between gap-3 rounded-2xl border border-rose-100 bg-white px-4 py-3"
              >
                <span className="min-w-0 flex-1 text-sm text-stone-700">
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

        <section className="mt-6 rounded-3xl border border-emerald-100 bg-emerald-50/40 px-5 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-light text-stone-700">
                Investments
              </h2>

              <p className="mt-1 text-sm leading-6 text-stone-400">
                What do you want to nurture or grow?
              </p>
            </div>

            <button
              type="button"
              onClick={addInvestment}
              className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-sm text-stone-500 transition hover:border-emerald-300 hover:text-stone-700"
            >
              + Add
            </button>
          </div>

          <div className="mt-6 space-y-3">
            {investments.map((item) => (
              <div
                key={item}
                className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-white px-4 py-3"
              >
                <span className="min-w-0 flex-1 text-sm text-stone-700">
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

        <section className="mt-6 rounded-3xl border border-sky-100 bg-sky-50/40 px-5 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-light text-stone-700">
                Your direction
              </h2>

              <p className="mt-1 text-sm leading-6 text-stone-400">
                What do you want more of in your life?
              </p>
            </div>

            <button
              type="button"
              onClick={addDirection}
              className="rounded-full border border-sky-200 bg-white px-3 py-1.5 text-sm text-stone-500 transition hover:border-sky-300 hover:text-stone-700"
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
                    isSelected
                      ? "border-sky-200 bg-sky-100/70"
                      : "border-sky-100 bg-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleDirection(item)}
                    aria-pressed={isSelected}
                    className="w-full text-left text-sm text-stone-700"
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span>{item}</span>

                      <span
                        className={`text-xs ${
                          isSelected
                            ? "text-sky-600"
                            : "text-stone-300"
                        }`}
                      >
                        {isSelected ? "Selected" : "Choose"}
                      </span>
                    </span>
                  </button>

                  <div className="mt-3 flex gap-2 border-t border-sky-100 pt-3">
                    <button
                      type="button"
                      onClick={() => editDirection(item)}
                      className="rounded-full px-3 py-1 text-xs text-stone-400 transition hover:bg-white hover:text-stone-700"
                    >
                      {t.edit}
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteDirection(item)}
                      className="rounded-full px-3 py-1 text-xs text-sky-500 transition hover:bg-white hover:text-sky-700"
                    >
                      {t.delete}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

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