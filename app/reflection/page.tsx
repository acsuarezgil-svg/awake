"use client";

import { useEffect, useState } from "react";
import { translations, type Language } from "../translations";

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

  return (
    <main className="min-h-screen bg-white p-6 w-full max-w-md mx-auto">
      <a href="/" className="text-sm text-gray-500">
        {t.back}
      </a>

      <h1 className="text-3xl font-bold mb-2 mt-4">
        {t.newReflection}
      </h1>

      <p className="text-gray-600 mb-6">
        {t.observeChooseActLearn}
      </p>

      {question && (
        <section className="mb-6 rounded-3xl bg-stone-50 px-5 py-5">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-400">
            A question for this moment
          </p>

          <p className="mt-3 text-lg font-light leading-7 text-stone-700">
            “{question}”
          </p>

          <button
            type="button"
            onClick={chooseQuestion}
            className="mt-4 text-sm text-stone-400 transition hover:text-stone-700"
          >
            Another question
          </button>
        </section>
      )}

      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("free")}
          className={`rounded-full px-4 py-2 text-sm ${
            mode === "free" ? "bg-black text-white" : "border text-gray-600"
          }`}
        >
          Free Write
        </button>

        <button
          type="button"
          onClick={() => setMode("guided")}
          className={`rounded-full px-4 py-2 text-sm ${
            mode === "guided" ? "bg-black text-white" : "border text-gray-600"
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
              className="w-full rounded-2xl border p-4 min-h-64"
            />
          </section>
        )}

        {mode === "guided" && (
          <>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">
          {t.observe}
        </h2>

        <textarea
          value={happened}
          onChange={(e) => setHappened(e.target.value)}
          placeholder={t.whatHappened}
          className="w-full rounded-xl border p-3 min-h-24 mb-4"
        />

        <textarea
          value={feeling}
          onChange={(e) => setFeeling(e.target.value)}
          placeholder={t.whatFeeling}
          className="w-full rounded-xl border p-3 min-h-24"
        />
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">
          {t.choose}
        </h2>

        <input
          value={seeking}
          onChange={(e) => setSeeking(e.target.value)}
          placeholder={t.whatSeeking}
          className="w-full rounded-xl border p-3"
        />
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">
          {t.act}
        </h2>

        <textarea
          value={action}
          onChange={(e) => setAction(e.target.value)}
          placeholder={t.whatDidIDo}
          className="w-full rounded-xl border p-3 min-h-24"
        />
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">
          {t.learn}
        </h2>

        <textarea
          value={learned}
          onChange={(e) => setLearned(e.target.value)}
          placeholder={t.whatLearned}
          className="w-full rounded-xl border p-3 min-h-24"
        />
      </section>
      </>
      )}

      <button
        onClick={saveReflection}
        className="w-full rounded-2xl bg-black text-white p-4 font-semibold"
      >
        {t.saveReflection}
      </button>
    </main>
  );
}