"use client";

import { useEffect, useState } from "react";
import { translations, type Language } from "./translations";
import WordPlayground from "./components/WordPlayground";

const defaultPatterns = ["Urgency", "Overthinking", "Avoidance"];
const defaultInvestments = ["Exercise", "Learning", "Creativity"];


export default function Home() {
  const [perspective, setPerspective] = useState(4);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [patterns, setPatterns] = useState(defaultPatterns);
  const [investments, setInvestments] = useState(defaultInvestments);
  const [loaded, setLoaded] = useState(false);
  const [reflectionCount, setReflectionCount] = useState(0);
  const [directions, setDirections] = useState<string[]>([]);
  const [question, setQuestion] = useState("");
  const [latestInsight, setLatestInsight] = useState("");
  const trendScale = 10;
  const visualMax = trendScale * 1.5; 
  const [language, setLanguage] = useState<Language>("en");
  const t = translations[language];
  const [showAllPatterns, setShowAllPatterns] = useState(false);
  const [showAllInvestments, setShowAllInvestments] = useState(false);

  useEffect(() => {
    const savedCounts = localStorage.getItem("awake-counts");
    const savedPatterns = localStorage.getItem("awake-patterns");
    const savedInvestments = localStorage.getItem("awake-investments");
    const savedReflections = localStorage.getItem("awake-reflections");
    const savedDirection = localStorage.getItem("awake-direction");
    const savedLanguage = localStorage.getItem("awake-language") as Language | null;

    if (savedCounts) setCounts(JSON.parse(savedCounts));
    if (savedPatterns) setPatterns(JSON.parse(savedPatterns));
    if (savedInvestments) setInvestments(JSON.parse(savedInvestments));
    if (savedReflections) {
      const reflections = JSON.parse(savedReflections);

      setReflectionCount(reflections.length);

      if (reflections.length > 0) {
        setLatestInsight(reflections[0].learned);
      }
    }
 
    if (savedDirection) {
      setDirections(JSON.parse(savedDirection));
    }
    
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }

    setLoaded(true);
  }, []);

    useEffect(() => {
      const questions = t.reflectionQuestions;

      const randomQuestion =
        questions[Math.floor(Math.random() * questions.length)];

      setQuestion(randomQuestion);
    }, [language]);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem("awake-counts", JSON.stringify(counts));
    }
  }, [counts, loaded]);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem("awake-patterns", JSON.stringify(patterns));
    }
  }, [patterns, loaded]);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem("awake-investments", JSON.stringify(investments));
    }
  }, [investments, loaded]);
  function changeLanguage(newLanguage: Language) {
    setLanguage(newLanguage);
    localStorage.setItem("awake-language", newLanguage);
  }

  function increment(item: string) {
    setCounts((current) => ({
      ...current,
      [item]: (current[item] || 0) + 1,
    }));
  }

  function addPattern() {
    const name = prompt("New pattern:");

    if (!name) return;

    setPatterns((current) => [...current, name]);
  }

  function addInvestment() {
    const name = prompt("New investment:");

    if (!name) return;

    setInvestments((current) => [...current, name]);
  }

  function editPattern(oldName: string) {
    const newName = prompt("Edit pattern:", oldName);

    if (!newName) return;

    setPatterns((current) =>
      current.map((item) => (item === oldName ? newName : item))
    );

    setCounts((current) => {
      const updated = { ...current };
      updated[newName] = updated[oldName] || 0;
      delete updated[oldName];
      return updated;
    });
  }

  function deletePattern(name: string) {
    const isDefault = defaultPatterns.includes(name);

    const confirmed = confirm(
      isDefault
        ? `"${name}" is a default Awake pattern.\n\nAre you sure you want to delete it?`
        : `Delete pattern "${name}"?`
    );

    if (!confirmed) return;

    setPatterns((current) => current.filter((item) => item !== name));

    setCounts((current) => {
      const updated = { ...current };
      delete updated[name];
      return updated;
    });
  }

  function editInvestment(oldName: string) {
    const newName = prompt("Edit investment:", oldName);

    if (!newName) return;

    setInvestments((current) =>
      current.map((item) => (item === oldName ? newName : item))
    );

    setCounts((current) => {
      const updated = { ...current };
      updated[newName] = updated[oldName] || 0;
      delete updated[oldName];
      return updated;
    });
  }

  function deleteInvestment(name: string) {
    const isDefault = defaultInvestments.includes(name);

    const confirmed = confirm(
      isDefault
        ? `"${name}" is a default Awake investment.\n\nAre you sure you want to delete it?`
        : `Delete investment "${name}"?`
    );

    if (!confirmed) return;

    setInvestments((current) => current.filter((item) => item !== name));

    setCounts((current) => {
      const updated = { ...current };
      delete updated[name];
      return updated;
    });
  }

  const patternTotal = patterns.reduce(
    (total, item) => total + (counts[item] || 0),
    0
  );

  const investmentTotal = investments.reduce(
    (total, item) => total + (counts[item] || 0),
    0
  );
  function getPerspectiveEmoji(value: number) {
    if (value === 1) return "🔬";
    if (value === 2) return "🏠";
    if (value === 3) return "🏙️";
    if (value === 4) return "🌎";
    if (value === 5) return "🌙";
    if (value === 6) return "☀️";
    return "🌌";
  }

  function getPerspectiveLabel(value: number) {
    if (value === 1) return "This Moment";
    if (value === 2) return "Home";
    if (value === 3) return "My World";
    if (value === 4) return "Earth";
    if (value === 5) return "Moon";
    if (value === 6) return "Solar System";
    return "Milky Way";
  }

  function getPerspectiveSize(value: number) {
    return 48 + value * 16;
  }
  function getBarWidth(item: string) {
    const value = counts[item] || 0;

    const percent = Math.min(
      (value / visualMax) * 100,
      100
    );

    return `${percent}%`;
  }

  const sortedPatterns = [...patterns]
  .sort((a, b) => (counts[b] || 0) - (counts[a] || 0))
  .filter((item) => (counts[item] || 0) > 0);

  const sortedInvestments = [...investments]
    .sort((a, b) => (counts[b] || 0) - (counts[a] || 0))
    .filter((item) => (counts[item] || 0) > 0);

  const visiblePatterns = showAllPatterns
    ? sortedPatterns
    : sortedPatterns.slice(0, 5);

  const visibleInvestments = showAllInvestments
    ? sortedInvestments
    : sortedInvestments.slice(0, 5);

  const playgroundPatterns =
  visiblePatterns.length > 0 ? visiblePatterns : patterns.slice(0, 10);

  const playgroundInvestments =
    visibleInvestments.length > 0 ? visibleInvestments : investments.slice(0, 10);

  return (
    <main className="min-h-screen bg-white p-6 w-full max-w-md mx-auto">
      <div className="mb-4 flex justify-end gap-2">
        <button
          onClick={() => changeLanguage("en")}
          className="rounded-lg border px-3 py-1 text-sm"
        >
          EN
        </button>

        <button
          onClick={() => changeLanguage("es")}
          className="rounded-lg border px-3 py-1 text-sm"
        >
          ES
        </button>
      </div>

      <section className="mb-8 rounded-3xl border bg-green-50 p-6 text-center">
        <h1 className="mb-2 text-5xl font-bold text-green-900">
          {t.appName}
        </h1>

        <p className="mb-6 text-lg text-green-800">
          {t.tagline}
        </p>

        <p className="mb-1 text-gray-700">
          {t.welcomeLine1}
        </p>

        <p className="mb-6 text-gray-700">
          {t.welcomeLine2}
        </p>

        <div className="mb-6 space-y-3 text-left text-gray-700">
          <p>☀️ {t.noticeEnergy}</p>
          <p>☁️ {t.noticeTakes}</p>
          <p>🔁 {t.noticeReturns}</p>
          <p>♡ {t.noticeMatters}</p>
        </div>

        <a
          href="/direction"
          className="block rounded-2xl bg-green-900 p-4 font-semibold text-white"
        >
          {t.createAwareness} →
        </a>
      </section>
      <section className="mt-8 rounded-3xl border bg-gray-50 p-5 text-center">
        <h2 className="text-xl font-bold">Perspective</h2>
        <p className="mt-1 text-sm text-gray-600">
          Move the slider and notice what changes.
        </p>

        <div className="my-6 flex h-40 items-center justify-center">
          <div
            className="flex items-center justify-center rounded-full transition-all duration-300"
            style={{
              fontSize: `${getPerspectiveSize(perspective)}px`,
            }}
          >
            {getPerspectiveEmoji(perspective)}
          </div>
        </div>

        <input
          type="range"
          min="1"
          max="7"
          value={perspective}
          onChange={(e) => setPerspective(Number(e.target.value))}
          className="w-full"
        />

        <div className="mt-3 flex justify-between text-xs text-gray-500">
          <span>This Moment</span>
          <span>More Perspective</span>
        </div>

        <p className="mt-4 text-sm font-medium text-gray-700">
          {getPerspectiveLabel(perspective)}
        </p>
      </section>

      <WordPlayground
        patterns={playgroundPatterns}
        investments={playgroundInvestments}
      />

      <div className="rounded-2xl border bg-blue-50 p-4 mb-6">
  <p className="text-sm text-gray-500 mb-2">
    {t.currentDirection}
  </p>

  {directions.length === 0 ? (
    <p className="text-sm text-gray-500">
      {t.chooseDirection}
    </p>
  ) : (
    <div className="flex flex-wrap gap-2">
      {directions.map((item) => (
        <span
          key={item}
          className="rounded-full border bg-white px-3 py-1 text-sm"
        >
          {item}
        </span>
      ))}
    </div>
  )}
</div>
<div className="rounded-2xl border bg-yellow-50 p-4 mb-6">
  <p className="text-sm text-gray-500 mb-2">
    {t.reflectionQuestion}
  </p>

  <p className="italic">
    {question}
  </p>
</div>

<div className="rounded-2xl border bg-green-50 p-4 mb-6">
  <p className="text-sm text-gray-500 mb-2">
    {t.latestInsight}
  </p>

  <p className="italic">
    {latestInsight || t.noInsights}
  </p>
</div>

<div className="rounded-2xl border p-4 mb-6">
  <p className="text-sm text-gray-500 mb-3">
    {t.showingUp}
  </p>

  <p className="text-xs text-gray-400 mb-3">
    {t.showingUpDescription}
  </p>

  <div className="mb-5">
    <p className="font-semibold mb-3">{t.patterns}</p>

    <div className="space-y-3">
      {visiblePatterns.map((item) => (
        <div key={item} className="grid grid-cols-[1fr_2fr_auto] items-center gap-3">
          <span className="text-sm">{item}</span>

          <div className="h-3 rounded-full bg-blue-50">
            <div
              className="h-3 rounded-full bg-blue-500"
              style={{ width: getBarWidth(item) }}
            />
          </div>

          <span className="text-sm font-semibold text-gray-600">
            {counts[item] || 0}
          </span>
        </div>
      ))}
    </div>

    {sortedPatterns.length > 5 && (
      <button
        onClick={() => setShowAllPatterns(!showAllPatterns)}
        className="mt-3 text-sm text-blue-600"
      >
        {showAllPatterns ? "Show Less" : "Show All"}
      </button>
    )}
  </div>

  <div>
    <p className="font-semibold mb-3">{t.investments}</p>

    <div className="space-y-3">
      {visibleInvestments.map((item) => (
        <div key={item} className="grid grid-cols-[1fr_2fr_auto] items-center gap-3">
          <span className="text-sm">{item}</span>

          <div className="h-3 rounded-full bg-green-50">
            <div
              className="h-3 rounded-full bg-green-500"
              style={{ width: getBarWidth(item) }}
            />
          </div>

          <span className="text-sm font-semibold text-gray-600">
            {counts[item] || 0}
          </span>
        </div>
      ))}
    </div>
  </div>
  {sortedInvestments.length > 5 && (
    <button
      onClick={() => setShowAllInvestments(!showAllInvestments)}
      className="mt-3 text-sm text-green-600"
    >
      {showAllInvestments ? "Show Less" : "Show All"}
    </button>
  )}
</div>


      <div className="rounded-2xl bg-gray-50 border p-4 mb-8">
        <p className="text-sm text-gray-500 mb-1">{t.today}</p>

        <div className="space-y-1 text-sm">
          <p>{t.awakePatterns}: {patternTotal}</p>
          <p>{t.investments}: {investmentTotal}</p>
          <p>{t.reflections}: {reflectionCount}</p>

        </div>
      </div>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-blue-600 mb-4">
          🔵 {t.patterns}
        </h2>

        <div className="space-y-3">
          {patterns.map((item) => (
            <div
              key={item}
              className="w-full rounded-xl border border-blue-200 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => increment(item)}
                  className="text-left flex-1"
                >
                  {item}
                </button>

                <span className="font-semibold text-gray-500">
                  {counts[item] || 0}
                </span>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => editPattern(item)}
                  className="rounded-lg bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
                >
                  {t.edit}
                </button>

                <button
                  onClick={() => deletePattern(item)}
                  className="rounded-lg bg-red-100 px-3 py-1 text-xs font-medium text-red-700"
                >
                  {t.delete}
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={addPattern}
            className="w-full rounded-xl border border-dashed border-blue-300 p-4 text-left"
          >
            {t.customPattern}
          </button>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-green-600 mb-4">
          🟢 {t.investments}
        </h2>

        <div className="space-y-3">
          {investments.map((item) => (
            <div
              key={item}
              className="w-full rounded-xl border border-green-200 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => increment(item)}
                  className="text-left flex-1"
                >
                  {item}
                </button>

                <span className="font-semibold text-gray-500">
                  {counts[item] || 0}
                </span>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => editInvestment(item)}
                  className="rounded-lg bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
                >
                  {t.edit}
                </button>

                <button
                  onClick={() => deleteInvestment(item)}
                  className="rounded-lg bg-red-100 px-3 py-1 text-xs font-medium text-red-700"
                >
                  {t.delete}
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={addInvestment}
            className="w-full rounded-xl border border-dashed border-green-300 p-4 text-left"
          >
            + Custom Investment
          </button>
        </div>
      </section>

      <a
        href="/reflection"
        className="block w-full rounded-2xl bg-black p-4 text-center font-semibold text-white"
      >
        {t.addReflection}
      </a>
      <a
        href="/reflections"
        className="mt-3 block w-full rounded-2xl border p-4 text-center font-semibold"
      >
        {t.viewJourney}
      </a>
      <a
        href="/direction"
        className="mt-3 block w-full rounded-2xl border p-4 text-center font-semibold"
      >
        {t.direction}
      </a>

    </main>
  );
}