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

export default function ReflectionsPage() {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [language, setLanguage] = useState<Language>("en");
  const t = translations[language];   

  useEffect(() => {
    const saved = localStorage.getItem("awake-reflections");
    const savedLanguage = localStorage.getItem("awake-language") as Language | null;

    if (saved) {
      setReflections(JSON.parse(saved));
    }
    if (savedLanguage) {
        setLanguage(savedLanguage);
        }
  }, []);

  return (
    <main className="min-h-screen bg-white p-6 w-full max-w-md mx-auto">
      <a href="/" className="text-sm text-gray-500">
        {t.back}
      </a>

      <h1 className="text-3xl font-bold mb-2 mt-4">{t.journeyTitle}</h1>
      <p className="text-gray-600 mb-8">
        {t.journeyDescription}.
      </p>

      <div className="space-y-4">
        {reflections.length === 0 && (
          <p className="text-gray-500">{t.noReflections}</p>
        )}

        {reflections.map((reflection) => (
          <article
            key={reflection.id}
            className="rounded-2xl border bg-gray-50 p-4"
          >
            <p className="mb-3 text-sm text-gray-500">
              {new Date(reflection.date).toLocaleString()}
            </p>

            <p className="font-semibold">{t.observe}</p>
            <p className="mb-2">{reflection.happened}</p>
            <p className="mb-4 text-gray-700">{reflection.feeling}</p>

            <p className="font-semibold">{t.choose}</p>
            <p className="mb-4">{reflection.seeking}</p>

            <p className="font-semibold">{t.act}</p>
            <p className="mb-4">{reflection.action}</p>

            <p className="font-semibold">{t.learn}</p>
            <p>{reflection.learned}</p>
          </article>
        ))}
      </div>
    </main>
  );
}