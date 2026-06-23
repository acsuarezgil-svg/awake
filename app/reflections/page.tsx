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
  updatedAt?: string;
  favorite?: boolean;
};

export default function ReflectionsPage() {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [language, setLanguage] = useState<Language>("en");
  const t = translations[language];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editReflection, setEditReflection] = useState<Reflection | null>(null);   

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

  useEffect(() => {
    localStorage.setItem("awake-reflections", JSON.stringify(reflections));
  }, [reflections]);

  function startEdit(reflection: Reflection) {
  setEditingId(reflection.id);
  setEditReflection({ ...reflection });
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
            updatedAt: new Date().toISOString(),
          }
        : reflection
    )
  );

  cancelEdit();
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

            {editingId === reflection.id && editReflection ? (
              <div className="space-y-3">
                <input
                  value={editReflection.happened}
                  onChange={(e) =>
                    setEditReflection({ ...editReflection, happened: e.target.value })
                  }
                  className="w-full rounded-xl border p-3"
                  placeholder={t.observe}
                />

                <input
                  value={editReflection.feeling}
                  onChange={(e) =>
                    setEditReflection({ ...editReflection, feeling: e.target.value })
                  }
                  className="w-full rounded-xl border p-3"
                  placeholder="Feeling"
                />

                <input
                  value={editReflection.seeking}
                  onChange={(e) =>
                    setEditReflection({ ...editReflection, seeking: e.target.value })
                  }
                  className="w-full rounded-xl border p-3"
                  placeholder={t.choose}
                />

                <input
                  value={editReflection.action}
                  onChange={(e) =>
                    setEditReflection({ ...editReflection, action: e.target.value })
                  }
                  className="w-full rounded-xl border p-3"
                  placeholder={t.act}
                />

                <textarea
                  value={editReflection.learned}
                  onChange={(e) =>
                    setEditReflection({ ...editReflection, learned: e.target.value })
                  }
                  className="w-full rounded-xl border p-3"
                  placeholder={t.learn}
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
                <p className="font-semibold">{t.observe}</p>
                <p className="mb-2">{reflection.happened}</p>
                <p className="mb-4 text-gray-700">{reflection.feeling}</p>

                <p className="font-semibold">{t.choose}</p>
                <p className="mb-4">{reflection.seeking}</p>

                <p className="font-semibold">{t.act}</p>
                <p className="mb-4">{reflection.action}</p>

                <p className="font-semibold">{t.learn}</p>
                <p>{reflection.learned}</p>

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