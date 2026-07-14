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

export default function ReflectionPage() {
  const [language, setLanguage] = useState<Language>("en");
  const t = translations[language];
  const [mode, setMode] = useState<"free" | "guided">("free");
  const [text, setText] = useState("");
  const [question, setQuestion] = useState("");
  const [wheelTheme, setWheelTheme] =
    useState<WheelTheme>("roseSage");
  

  const [happened, setHappened] = useState("");
  const [feeling, setFeeling] = useState("");
  const [seeking, setSeeking] = useState("");
  const [action, setAction] = useState("");
  const [learned, setLearned] = useState("");

  useEffect(() => {
    const savedLanguage = localStorage.getItem(
      "awake-language"
    ) as Language | null;

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

  function chooseQuestion() {
    const questions = t.reflectionQuestions;

    if (!questions || questions.length === 0) {
      setQuestion("");
      return;
    }

    setQuestion((currentQuestion) => {
      const otherQuestions = questions.filter(
        (item) => item !== currentQuestion
      );

      const availableQuestions =
        otherQuestions.length > 0 ? otherQuestions : questions;

      return availableQuestions[
        Math.floor(Math.random() * availableQuestions.length)
      ];
    });
  }

  useEffect(() => {
    chooseQuestion();
  }, [language]);

  function saveReflection() {
  const hasContent =
    mode === "free"
      ? text.trim().length > 0
      : [happened, feeling, seeking, action, learned].some(
          (value) => value.trim().length > 0
        );

  if (!hasContent) return;

  const saved = localStorage.getItem("awake-reflections");
    const existingReflections: Reflection[] = saved ? JSON.parse(saved) : [];

    const newReflection: Reflection =
      mode === "free"
        ? {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            mode: "free",
            text,
          }
        : {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            mode: "guided",
            happened,
            feeling,
            seeking,
            action,
            learned,
            
          };

    localStorage.setItem(
      "awake-reflections",
      JSON.stringify([newReflection, ...existingReflections])
    );

    setHappened("");
    setFeeling("");
    setSeeking("");
    setAction("");
    setLearned("");
    setText("");
  }
  const activeTheme = wheelThemes[wheelTheme];
  const isDark = isDarkWheelTheme(wheelTheme);

  const fieldClass = `w-full border p-3 transition-colors ${
    isDark
      ? "border-slate-600 bg-slate-800/80 text-stone-100 placeholder:text-slate-400 focus:border-slate-400"
      : "border-stone-200 bg-white text-stone-800 placeholder:text-stone-400"
  }`;

  const sectionHeadingClass = isDark
    ? "text-stone-100"
    : "text-stone-800";

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
        {t.newReflection}
      </h1>

      <p
        className={`mb-6 ${
          isDark ? "text-slate-300" : "text-gray-600"
        }`}
      >
        {t.observeChooseActLearn}
      </p>

      {question && (
        <section
          className={`mb-6 rounded-3xl border px-5 py-5 transition-colors ${
            isDark
              ? "border-white/10 bg-slate-800/70"
              : "border-stone-100 bg-stone-50"
          }`}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-stone-400">
            A question for this moment
          </p>

          <p
            className={`mt-3 text-lg font-light leading-7 ${
              isDark ? "text-stone-100" : "text-stone-700"
            }`}
          >
            “{question}”
          </p>

          <button
            type="button"
            onClick={chooseQuestion}
            className={`mt-4 text-sm transition ${
              isDark
                ? "text-slate-400 hover:text-stone-100"
                : "text-stone-400 hover:text-stone-700"
            }`}
          >
            Another question
          </button>
        </section>
      )}

      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("free")}
          className={`rounded-full border px-4 py-2 text-sm transition ${
            mode === "free"
              ? isDark
                ? "border-slate-500 bg-slate-600 text-white"
                : "border-black bg-black text-white"
              : isDark
                ? "border-white/15 bg-slate-900/50 text-slate-300"
                : "border-stone-200 bg-white text-gray-600"
          }`}
        >
          Free Write
        </button>

        <button
          type="button"
          onClick={() => setMode("guided")}
          className={`rounded-full border px-4 py-2 text-sm transition ${
            mode === "guided"
              ? isDark
                ? "border-slate-500 bg-slate-600 text-white"
                : "border-black bg-black text-white"
              : isDark
                ? "border-white/15 bg-slate-900/50 text-slate-300"
                : "border-stone-200 bg-white text-gray-600"
          }`}
        >
          Guided
        </button>
      </div>

      {mode === "free" && (
          <section className="mb-8">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write whatever stayed with you..."
              className={`${fieldClass} min-h-64 rounded-2xl p-4`}
            />
          </section>
        )}

        {mode === "guided" && (
          <>

      <section className="mb-6">
        <h2 className={`mb-3 text-xl font-semibold ${sectionHeadingClass}`}>
          {t.observe}
        </h2>

        <textarea
          value={happened}
          onChange={(e) => setHappened(e.target.value)}
          placeholder={t.whatHappened}
          className={`${fieldClass} mb-4 min-h-24 rounded-xl`}
        />

        <textarea
          value={feeling}
          onChange={(e) => setFeeling(e.target.value)}
          placeholder={t.whatFeeling}
          className={`${fieldClass} min-h-24 rounded-xl`}
        />
      </section>

      <section className="mb-6">
        <h2 className={`mb-3 text-xl font-semibold ${sectionHeadingClass}`}>
          {t.choose}
        </h2>

        <input
          value={seeking}
          onChange={(e) => setSeeking(e.target.value)}
          placeholder={t.whatSeeking}
          className={`${fieldClass} rounded-xl`}
        />
      </section>

      <section className="mb-6">
        <h2 className={`mb-3 text-xl font-semibold ${sectionHeadingClass}`}>
          {t.act}
        </h2>

        <textarea
          value={action}
          onChange={(e) => setAction(e.target.value)}
          placeholder={t.whatDidIDo}
          className={`${fieldClass} min-h-24 rounded-xl`}
        />
      </section>

      <section className="mb-8">
        <h2 className={`mb-3 text-xl font-semibold ${sectionHeadingClass}`}>
          {t.learn}
        </h2>

        <textarea
          value={learned}
          onChange={(e) => setLearned(e.target.value)}
          placeholder={t.whatLearned}
          className={`${fieldClass} min-h-24 rounded-xl`}
        />
      </section>
      </>
      )}

      <button
        onClick={saveReflection}
        className={`w-full rounded-2xl p-4 font-semibold transition ${
          isDark
            ? "border border-white/10 bg-slate-700 text-stone-100 hover:bg-slate-600"
            : "bg-black text-white hover:bg-stone-800"
        }`}
      >
        {t.saveReflection}
      </button>
      </section>
</main>
  );
}