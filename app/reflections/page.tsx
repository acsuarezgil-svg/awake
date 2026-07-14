"use client";

import { useEffect, useState } from "react";
import { translations, type Language } from "../translations";
import {
  isDarkWheelTheme,
  isWheelTheme,
  wheelThemes,
  type WheelTheme,
} from "../theme";

type Reflection = {
  id: string;
  date: string;
  mode?: "guided" | "free";
  text?: string;
  happened?: string;
  feeling?: string;
  seeking?: string;
  action?: string;
  learned?: string;
  updatedAt?: string;
  favorite?: boolean;
};

export default function ReflectionsPage() {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [language, setLanguage] = useState<Language>("en");
  const t = translations[language];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editReflection, setEditReflection] = useState<Reflection | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [timeFilter, setTimeFilter] = useState("all");
  const [editText, setEditText] = useState("");
  const [wheelTheme, setWheelTheme] =
    useState<WheelTheme>("roseSage");

  useEffect(() => {
    const saved = localStorage.getItem("awake-reflections");
    const savedLanguage = localStorage.getItem("awake-language") as Language | null;
    const savedWheelTheme = localStorage.getItem("awake-wheel-theme");

    if (saved) {
      setReflections(JSON.parse(saved));
    }
    if (savedLanguage) {
        setLanguage(savedLanguage);
        }

    if (savedWheelTheme && isWheelTheme(savedWheelTheme)) {
      setWheelTheme(savedWheelTheme);
    }
  }, []);

  const activeTheme = wheelThemes[wheelTheme];
  const isDark = isDarkWheelTheme(wheelTheme);

  useEffect(() => {
    localStorage.setItem("awake-reflections", JSON.stringify(reflections));
  }, [reflections]);

  function startEdit(reflection: Reflection) {
  setEditingId(reflection.id);
  setEditReflection({ ...reflection });

  if (reflection.mode === "free") {
    setEditText(reflection.text || "");
  } else {
    setEditText(
      `Observe
${reflection.happened || ""}

Feeling
${reflection.feeling || ""}

Choose
${reflection.seeking || ""}

Act
${reflection.action || ""}

Learn
${reflection.learned || ""}`
    );
  }
}

function cancelEdit() {
  setEditingId(null);
  setEditReflection(null);
}

function saveEdit() {
  if (!editReflection) return;

  setReflections((prev) =>
    prev.map((reflection) =>
      reflection.id === editReflection.id
        ? {
            ...editReflection,
            mode: "free",
            text: editText,
            happened: "",
            feeling: "",
            seeking: "",
            action: "",
            learned: "",
            updatedAt: new Date().toISOString(),
          }
        : reflection
    )
  );

  cancelEdit();
  setEditText("");
}

function toggleFavorite(id: string) {
  setReflections((prev) =>
    prev.map((reflection) =>
      reflection.id === id
        ? { ...reflection, favorite: !reflection.favorite }
        : reflection
    )
  );
}
let filteredReflections = [...reflections];

const now = new Date();

if (timeFilter === "today") {
  filteredReflections = filteredReflections.filter((reflection) => {
    const date = new Date(reflection.date);

    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  });
}

if (timeFilter === "7days") {
  filteredReflections = filteredReflections.filter((reflection) => {
    const date = new Date(reflection.date);

    return (
      now.getTime() - date.getTime() <=
      7 * 24 * 60 * 60 * 1000
    );
  });
}

if (timeFilter === "month") {
  filteredReflections = filteredReflections.filter((reflection) => {
    const date = new Date(reflection.date);

    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  });
}

const displayedReflections = showFavoritesOnly
  ? filteredReflections.filter((reflection) => reflection.favorite)
  : filteredReflections;

  return (
    <main
        className={`min-h-screen w-full px-5 py-8 transition-[background] duration-500 ${
          isDark ? "text-stone-100" : "text-stone-800"
        }`}
        style={{ background: activeTheme.pageBackground }}
      >
        <section className="mx-auto w-full max-w-md">
      <a href="/" className="text-sm text-gray-500">
        {t.back}
      </a>

      <h1 className="text-3xl font-bold mb-2 mt-4">{t.journeyTitle}</h1>
      <p className="text-gray-600 mb-8">
        {t.journeyDescription}.
      </p>
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setShowFavoritesOnly(false)}
          className={`rounded-full px-4 py-2 text-sm ${
            !showFavoritesOnly
              ? "bg-black text-white"
              : "border text-gray-600"
          }`}
        >
          All
        </button>

        <button
          onClick={() => setShowFavoritesOnly(true)}
          className={`rounded-full px-4 py-2 text-sm ${
            showFavoritesOnly
              ? "bg-black text-white"
              : "border text-gray-600"
          }`}
        >
          ⭐ Favorites
        </button>
      </div>

      <div className="space-y-4">
        {displayedReflections.length === 0 && (
          <p className="text-gray-500">
            {showFavoritesOnly ? "No favorites yet." : t.noReflections}
          </p>
        )}

                <div className="mb-6 flex flex-wrap gap-2">
                  <button
                    onClick={() => setTimeFilter("today")}
                    className={`rounded-full px-3 py-1 text-sm ${
                      timeFilter === "today" ? "bg-green-600 text-white" : "border"
                    }`}
                  >
                    Today
                  </button>

                  <button
                    onClick={() => setTimeFilter("7days")}
                    className={`rounded-full px-3 py-1 text-sm ${
                      timeFilter === "7days" ? "bg-green-600 text-white" : "border"
                    }`}
                  >
                    7 Days
                  </button>

                  <button
                    onClick={() => setTimeFilter("month")}
                    className={`rounded-full px-3 py-1 text-sm ${
                      timeFilter === "month" ? "bg-green-600 text-white" : "border"
                    }`}
                  >
                    Month
                  </button>

                  <button
                    onClick={() => setTimeFilter("all")}
                    className={`rounded-full px-3 py-1 text-sm ${
                      timeFilter === "all" ? "bg-green-600 text-white" : "border"
                    }`}
                  >
                    All
                  </button>
                </div>

                {displayedReflections.map((reflection) => (
          <article
            key={reflection.id}
            className="rounded-2xl border bg-gray-50 p-4"
          >
            <p className="mb-3 text-sm text-gray-500">
              {new Date(reflection.date).toLocaleString()}
            </p>

            {editingId === reflection.id && editReflection ? (
              <div className="space-y-3">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="min-h-80 w-full rounded-2xl border p-4"
                  placeholder="Write whatever stayed with you..."
                />

                <div className="flex gap-2">
                  <button onClick={saveEdit} className="rounded-xl bg-black px-4 py-2 text-white">
                    Save
                  </button>

                  <button onClick={cancelEdit} className="rounded-xl border px-4 py-2">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {reflection.mode === "free" ? (
                  <>
                    <p className="font-semibold text-lg">📖 Reflection</p>
                    <p className="mt-3 whitespace-pre-wrap">{reflection.text}</p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold">{t.observe}</p>
                    <p className="mb-2">{reflection.happened}</p>
                    <p className="mb-4 text-gray-700">{reflection.feeling}</p>

                    <p className="font-semibold">{t.choose}</p>
                    <p className="mb-4">{reflection.seeking}</p>

                    <p className="font-semibold">{t.act}</p>
                    <p className="mb-4">{reflection.action}</p>

                    <p className="font-semibold">{t.learn}</p>
                    <p>{reflection.learned}</p>
                  </>
                )}

                {reflection.updatedAt && (
                  <p className="mt-3 text-xs text-gray-400">Edited</p>
                )}

                <div className="mt-4 flex gap-2">
                  <button onClick={() => toggleFavorite(reflection.id)}>
                    {reflection.favorite ? "⭐ Favorited" : "☆ Favorite"}
                  </button>

                  <button onClick={() => startEdit(reflection)}>
                    ✏️ Edit
                  </button>
                </div>
              </>
            )}
                      </article>
        ))}
      </div>
      </section>
    </main>
  );
}