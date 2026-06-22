"use client";

import { useEffect, useState } from "react";
import { translations, type Language } from "../translations";

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
  const [directions, setDirections] = useState(defaultDirections);
  const [selected, setSelected] = useState<string[]>([]);
  const [language, setLanguage] = useState<Language>("en");
  const t = translations[language];   

  useEffect(() => {
    const savedDirections = localStorage.getItem("awake-directions");
    const savedSelected = localStorage.getItem("awake-direction");
    const savedLanguage = localStorage.getItem("awake-language") as Language | null;


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

  function saveDirections(updated: string[]) {
    setDirections(updated);
    localStorage.setItem("awake-directions", JSON.stringify(updated));
  }

  function saveSelected(updated: string[]) {
    setSelected(updated);
    localStorage.setItem("awake-direction", JSON.stringify(updated));
  }

  function toggle(item: string) {
    if (selected.includes(item)) {
      saveSelected(selected.filter((x) => x !== item));
    } else {
      saveSelected([...selected, item]);
    }
  }

  function addDirection() {
    const name = prompt("New direction:");

    if (!name) return;

    saveDirections([...directions, name]);
  }

  function editDirection(oldName: string) {
    const newName = prompt("Edit direction:", oldName);

    if (!newName) return;

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

    saveDirections(directions.filter((item) => item !== name));
    saveSelected(selected.filter((item) => item !== name));
  }

  return (
    <main className="min-h-screen bg-white p-6 w-full max-w-md mx-auto">
      <a href="/" className="text-sm text-gray-500">
        {t.back}
      </a>

      <h1 className="text-3xl font-bold mb-2 mt-4">{t.directionTitle}</h1>

      <p className="text-gray-600 mb-8">
        {t.directionPrompt}
      </p>

      <div className="space-y-3">
        {directions.map((item) => (
          <div
            key={item}
            className={`w-full rounded-xl border p-4 ${
              selected.includes(item)
                ? "bg-blue-100 border-blue-300"
                : "bg-white"
            }`}
          >
            <button
              onClick={() => toggle(item)}
              className="w-full text-left font-medium"
            >
              {item}
            </button>

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => editDirection(item)}
                className="rounded-lg bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
              >
                {t.edit}
              </button>

              <button
                onClick={() => deleteDirection(item)}
                className="rounded-lg bg-red-100 px-3 py-1 text-xs font-medium text-red-700"
              >
                {t.delete}
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={addDirection}
          className="w-full rounded-xl border border-dashed border-blue-300 p-4 text-left"
        >
          {t.customDirection}
        </button>
      </div>
    </main>
  );
}