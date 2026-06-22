"use client";

import { useEffect, useState } from "react";
import { translations, type Language } from "../translations";

type Reflection = {
  id: string;
  date: string;
  happened: string;
  feeling: string;
  seeking: string;
  action: string;
  learned: string;
};

export default function ReflectionPage() {
  const [language, setLanguage] = useState<Language>("en");
  const t = translations[language];

  const [happened, setHappened] = useState("");
  const [feeling, setFeeling] = useState("");
  const [seeking, setSeeking] = useState("");
  const [action, setAction] = useState("");
  const [learned, setLearned] = useState("");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("awake-language") as Language | null;

    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  function saveReflection() {
    const saved = localStorage.getItem("awake-reflections");
    const existingReflections: Reflection[] = saved ? JSON.parse(saved) : [];

    const newReflection: Reflection = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
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
  }

  return (
    <main className="min-h-screen bg-white p-6 w-full max-w-md mx-auto">
      <a href="/" className="text-sm text-gray-500">
        {t.back}
      </a>

      <h1 className="text-3xl font-bold mb-2 mt-4">
        {t.newReflection}
      </h1>

      <p className="text-gray-600 mb-8">
        {t.observeChooseActLearn}
      </p>

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

      <button
        onClick={saveReflection}
        className="w-full rounded-2xl bg-black text-white p-4 font-semibold"
      >
        {t.saveReflection}
      </button>
    </main>
  );
}