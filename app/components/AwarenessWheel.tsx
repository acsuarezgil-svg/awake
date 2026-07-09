"use client";

import { useEffect, useMemo, useState } from "react";

type Counts = Record<string, number>;
type ViewRange = "today" | "7days" | "month" | "all";

type NoticeEvent = {
  id: string;
  item: string;
  type: "pattern" | "investment";
  createdAt: string;
};

const defaultPatterns = ["Urgency", "Overthinking", "Avoidance"];
const defaultInvestments = ["Exercise", "Learning", "Creativity"];

export default function AwarenessWheel() {
  const [counts, setCounts] = useState<Counts>({});
  const [events, setEvents] = useState<NoticeEvent[]>([]);
  const [patterns, setPatterns] = useState(defaultPatterns);
  const [investments, setInvestments] = useState(defaultInvestments);
  const [message, setMessage] = useState("");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [viewRange, setViewRange] = useState<ViewRange>("today");
  const [showAllPatterns, setShowAllPatterns] = useState(false);
  const [showAllInvestments, setShowAllInvestments] = useState(false);

  useEffect(() => {
    const savedCounts = localStorage.getItem("awake-counts");
    const savedEvents = localStorage.getItem("awake-notice-events");
    const savedPatterns = localStorage.getItem("awake-patterns");
    const savedInvestments = localStorage.getItem("awake-investments");

    if (savedCounts) setCounts(JSON.parse(savedCounts));
    if (savedEvents) setEvents(JSON.parse(savedEvents));
    if (savedPatterns) setPatterns(JSON.parse(savedPatterns));
    if (savedInvestments) setInvestments(JSON.parse(savedInvestments));
  }, []);

  useEffect(() => {
    localStorage.setItem("awake-counts", JSON.stringify(counts));
  }, [counts]);

  useEffect(() => {
    localStorage.setItem("awake-notice-events", JSON.stringify(events));
  }, [events]);

  function isInRange(dateString: string) {
    if (viewRange === "all") return true;

    const created = new Date(dateString);
    const now = new Date();

    if (viewRange === "today") {
      return created.toDateString() === now.toDateString();
    }

    const daysAgo = new Date();
    daysAgo.setDate(now.getDate() - (viewRange === "7days" ? 7 : 30));

    return created >= daysAgo;
  }

  const filteredCounts = useMemo(() => {
    const nextCounts: Counts = {};

    events.filter((event) => isInRange(event.createdAt)).forEach((event) => {
      nextCounts[event.item] = (nextCounts[event.item] || 0) + 1;
    });

    return nextCounts;
  }, [events, viewRange]);

  function notice(item: string, type: "pattern" | "investment") {
    setCounts((current) => ({
      ...current,
      [item]: (current[item] || 0) + 1,
    }));

    setEvents((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        item,
        type,
        createdAt: new Date().toISOString(),
      },
    ]);

    setSelectedItem(item);
    setMessage("Noticed.");

    setTimeout(() => {
      setMessage("");
    }, 1200);
  }

  const sortedPatterns = [...patterns].sort(
    (a, b) => (filteredCounts[b] || 0) - (filteredCounts[a] || 0)
  );

  const sortedInvestments = [...investments].sort(
    (a, b) => (filteredCounts[b] || 0) - (filteredCounts[a] || 0)
  );

  const visiblePatterns = showAllPatterns
    ? sortedPatterns
    : sortedPatterns.slice(0, 4);

  const visibleInvestments = showAllInvestments
    ? sortedInvestments
    : sortedInvestments.slice(0, 4);

  const wheelItems = [
    ...visiblePatterns.map((item) => ({
      name: item,
      type: "pattern" as const,
    })),
    ...visibleInvestments.map((item) => ({
      name: item,
      type: "investment" as const,
    })),
  ];

  const radius = 125;

  const selectedCount = selectedItem ? filteredCounts[selectedItem] || 0 : 0;

  return (
    <section className="rounded-3xl border bg-gradient-to-br from-rose-50 via-white to-emerald-50 p-6 shadow-sm">
      <h1 className="mb-2 text-3xl font-bold">Awareness Wheel</h1>

      <p className="mb-6 text-gray-600">
        What is taking space in this moment?
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        {[
          ["today", "Today"],
          ["7days", "7 Days"],
          ["month", "Month"],
          ["all", "All"],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setViewRange(value as ViewRange)}
            className={`rounded-full px-4 py-2 text-sm transition ${
              viewRange === value
                ? "bg-white shadow text-gray-800"
                : "bg-white/50 text-gray-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="relative mx-auto mb-8 h-80 w-80 rounded-full bg-gradient-to-br from-rose-100 via-yellow-50 to-emerald-100 shadow-inner">
        <div className="absolute inset-6 rounded-full border border-white/70" />
        <div className="absolute inset-12 rounded-full border border-white/60" />
        <div className="absolute inset-20 rounded-full border border-white/50" />

        {wheelItems.map((item, index) => {
          const angle = (index / wheelItems.length) * 2 * Math.PI - Math.PI / 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <button
              key={`${item.type}-${item.name}`}
              onClick={() => notice(item.name, item.type)}
              className={`absolute rounded-full px-3 py-2 text-xs shadow-sm transition active:scale-95 ${
                item.type === "pattern"
                  ? "bg-rose-50 text-rose-800"
                  : "bg-emerald-50 text-emerald-800"
              }`}
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {item.name}
            </button>
          );
        })}

        <div className="absolute left-1/2 top-1/2 z-10 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-center font-semibold text-gray-700 shadow">
          This Moment
        </div>

        {message && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-4 py-2 text-sm text-gray-600 shadow">
            {message}
          </div>
        )}
      </div>

      {selectedItem && (
        <div className="mb-6 rounded-2xl border bg-white/80 p-4 shadow-sm">
          <p className="text-sm text-gray-500">Recently noticed</p>
          <p className="mt-1 text-xl font-semibold text-gray-800">
            {selectedItem}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Seen {selectedCount} {selectedCount === 1 ? "time" : "times"} in this view.
          </p>
          <p className="mt-3 text-sm text-gray-500">
            What helped create a little more space?
          </p>
        </div>
      )}

      <div className="grid gap-4">
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
          <p className="mb-3 font-semibold text-rose-700">
            Soft Coral · Patterns
          </p>

          <div className="flex flex-wrap gap-2">
            {visiblePatterns.map((item) => (
              <button
                key={item}
                onClick={() => notice(item, "pattern")}
                className="rounded-full bg-white px-4 py-2 text-sm shadow-sm"
              >
                {item}
              </button>
            ))}
          </div>

          {sortedPatterns.length > 4 && (
            <button
              onClick={() => setShowAllPatterns(!showAllPatterns)}
              className="mt-3 text-sm text-rose-700"
            >
              {showAllPatterns ? "Show top" : "View all patterns"}
            </button>
          )}
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="mb-3 font-semibold text-emerald-700">
            Soft Green · Investments
          </p>

          <div className="flex flex-wrap gap-2">
            {visibleInvestments.map((item) => (
              <button
                key={item}
                onClick={() => notice(item, "investment")}
                className="rounded-full bg-white px-4 py-2 text-sm shadow-sm"
              >
                {item}
              </button>
            ))}
          </div>

          {sortedInvestments.length > 4 && (
            <button
              onClick={() => setShowAllInvestments(!showAllInvestments)}
              className="mt-3 text-sm text-emerald-700"
            >
              {showAllInvestments ? "Show top" : "View all investments"}
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border bg-white/80 p-4">
        <p className="mb-2 text-sm text-gray-500">
          {viewRange === "today"
            ? "Today"
            : viewRange === "7days"
            ? "Last 7 days"
            : viewRange === "month"
            ? "Last month"
            : "All time"}
        </p>

        <p className="text-sm">
          Patterns:{" "}
          {patterns.reduce((sum, item) => sum + (filteredCounts[item] || 0), 0)}
        </p>

        <p className="text-sm">
          Investments:{" "}
          {investments.reduce(
            (sum, item) => sum + (filteredCounts[item] || 0),
            0
          )}
        </p>
      </div>
    </section>
  );
}