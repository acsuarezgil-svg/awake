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
        <a
          href="/"
          className={`text-sm transition ${
            isDark
              ? "text-slate-400 hover:text-stone-100"
              : "text-gray-500 hover:text-stone-800"
          }`}
        >
          {t.back}
        </a>

        <h1
          className={`mb-2 mt-4 text-3xl font-bold ${
            isDark ? "text-stone-100" : "text-stone-900"
          }`}
        >
          {t.journeyTitle}
        </h1>

        <p
          className={`mb-8 ${
            isDark ? "text-slate-300" : "text-gray-600"
          }`}
        >
          {t.journeyDescription}.
        </p>

        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setShowFavoritesOnly(false)}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              !showFavoritesOnly
                ? isDark
                  ? "border-slate-500 bg-slate-600 text-white"
                  : "border-black bg-black text-white"
                : isDark
                  ? "border-white/15 bg-slate-900/50 text-slate-300"
                  : "border-stone-200 bg-white text-gray-600"
            }`}
          >
            All
          </button>

          <button
            onClick={() => setShowFavoritesOnly(true)}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              showFavoritesOnly
                ? isDark
                  ? "border-slate-500 bg-slate-600 text-white"
                  : "border-black bg-black text-white"
                : isDark
                  ? "border-white/15 bg-slate-900/50 text-slate-300"
                  : "border-stone-200 bg-white text-gray-600"
            }`}
          >
            ⭐ Favorites
          </button>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {[
            ["today", "Today"],
            ["7days", "7 Days"],
            ["month", "Month"],
            ["all", "All"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setTimeFilter(value)}
              className={`rounded-full border px-3 py-1 text-sm transition ${
                timeFilter === value
                  ? isDark
                    ? "border-emerald-400/30 bg-emerald-500/20 text-emerald-200"
                    : "border-green-600 bg-green-600 text-white"
                  : isDark
                    ? "border-white/15 bg-slate-900/50 text-slate-300"
                    : "border-stone-200 bg-white text-stone-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {displayedReflections.length === 0 && (
            <p
              className={
                isDark ? "text-slate-400" : "text-gray-500"
              }
            >
              {showFavoritesOnly ? "No favorites yet." : t.noReflections}
            </p>
          )}

          {displayedReflections.map((reflection) => (
            <article
              key={reflection.id}
              className={`rounded-3xl border p-5 transition-colors ${
                isDark
                  ? "border-white/10 bg-slate-800/80"
                  : "border-stone-200 bg-gray-50"
              }`}
            >
              <p
                className={`mb-3 text-sm ${
                  isDark ? "text-slate-400" : "text-gray-500"
                }`}
              >
                {new Date(reflection.date).toLocaleString()}
              </p>

              {editingId === reflection.id && editReflection ? (
                <div className="space-y-3">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className={`min-h-80 w-full rounded-2xl border p-4 outline-none transition ${
                      isDark
                        ? "border-slate-600 bg-slate-900/60 text-stone-100 placeholder:text-slate-400 focus:border-slate-400"
                        : "border-stone-200 bg-white text-stone-800 placeholder:text-stone-400"
                    }`}
                    placeholder="Write whatever stayed with you..."
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      className={`rounded-xl px-4 py-2 ${
                        isDark
                          ? "bg-slate-600 text-white"
                          : "bg-black text-white"
                      }`}
                    >
                      Save
                    </button>

                    <button
                      onClick={cancelEdit}
                      className={`rounded-xl border px-4 py-2 ${
                        isDark
                          ? "border-white/15 text-slate-300"
                          : "border-stone-200 text-stone-600"
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {reflection.mode === "free" ? (
                    <>
                      <p
                        className={`text-lg font-semibold ${
                          isDark ? "text-stone-100" : "text-stone-800"
                        }`}
                      >
                        📖 Reflection
                      </p>

                      <p
                        className={`mt-3 whitespace-pre-wrap leading-7 ${
                          isDark ? "text-slate-200" : "text-stone-700"
                        }`}
                      >
                        {reflection.text}
                      </p>
                    </>
                  ) : (
                    <>
                      <p
                        className={`font-semibold ${
                          isDark ? "text-stone-100" : "text-stone-800"
                        }`}
                      >
                        {t.observe}
                      </p>

                      <p
                        className={`mb-2 ${
                          isDark ? "text-slate-200" : "text-stone-700"
                        }`}
                      >
                        {reflection.happened}
                      </p>

                      <p
                        className={`mb-4 ${
                          isDark ? "text-slate-300" : "text-gray-700"
                        }`}
                      >
                        {reflection.feeling}
                      </p>

                      <p
                        className={`font-semibold ${
                          isDark ? "text-stone-100" : "text-stone-800"
                        }`}
                      >
                        {t.choose}
                      </p>

                      <p
                        className={`mb-4 ${
                          isDark ? "text-slate-200" : "text-stone-700"
                        }`}
                      >
                        {reflection.seeking}
                      </p>

                      <p
                        className={`font-semibold ${
                          isDark ? "text-stone-100" : "text-stone-800"
                        }`}
                      >
                        {t.act}
                      </p>

                      <p
                        className={`mb-4 ${
                          isDark ? "text-slate-200" : "text-stone-700"
                        }`}
                      >
                        {reflection.action}
                      </p>

                      <p
                        className={`font-semibold ${
                          isDark ? "text-stone-100" : "text-stone-800"
                        }`}
                      >
                        {t.learn}
                      </p>

                      <p
                        className={
                          isDark ? "text-slate-200" : "text-stone-700"
                        }
                      >
                        {reflection.learned}
                      </p>
                    </>
                  )}

                  {reflection.updatedAt && (
                    <p
                      className={`mt-3 text-xs ${
                        isDark ? "text-slate-500" : "text-gray-400"
                      }`}
                    >
                      Edited
                    </p>
                  )}

                  <div
                    className={`mt-4 flex gap-4 text-sm ${
                      isDark ? "text-slate-300" : "text-stone-600"
                    }`}
                  >
                    <button
                      onClick={() => toggleFavorite(reflection.id)}
                      className={`transition ${
                        isDark
                          ? "hover:text-white"
                          : "hover:text-stone-900"
                      }`}
                    >
                      {reflection.favorite ? "⭐ Favorited" : "☆ Favorite"}
                    </button>

                    <button
                      onClick={() => startEdit(reflection)}
                      className={`transition ${
                        isDark
                          ? "hover:text-white"
                          : "hover:text-stone-900"
                      }`}
                    >
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