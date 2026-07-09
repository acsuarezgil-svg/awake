"use client";

import { useEffect, useMemo, useState } from "react";

type Counts = Record<string, number>;

type NoticeEvent = {
  id: string;
  name: string;
  type: "pattern" | "investment";
  date: string;
};

const defaultPatterns = ["Urgency", "Overthinking", "Avoidance"];
const defaultInvestments = ["Exercise", "Learning", "Creativity"];

const filters = ["Today", "7 Days", "Month", "All"] as const;
type Filter = (typeof filters)[number];

function isInFilter(dateString: string, filter: Filter) {
  const eventDate = new Date(dateString);
  const now = new Date();

  if (filter === "All") return true;

  if (filter === "Today") {
    return eventDate.toDateString() === now.toDateString();
  }

  const diffDays =
    (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24);

  if (filter === "7 Days") return diffDays <= 7;

  if (filter === "Month") {
    return (
      eventDate.getMonth() === now.getMonth() &&
      eventDate.getFullYear() === now.getFullYear()
    );
  }

  return true;
}

export default function AwarenessWheel() {
  const [counts, setCounts] = useState<Counts>({});
  const [patterns, setPatterns] = useState(defaultPatterns);
  const [investments, setInvestments] = useState(defaultInvestments);
  const [events, setEvents] = useState<NoticeEvent[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("Today");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setCounts(JSON.parse(localStorage.getItem("awake-counts") || "{}"));
    setPatterns(
      JSON.parse(localStorage.getItem("awake-patterns") || "null") ||
        defaultPatterns
    );
    setInvestments(
      JSON.parse(localStorage.getItem("awake-investments") || "null") ||
        defaultInvestments
    );
    setEvents(JSON.parse(localStorage.getItem("awake-notice-events") || "[]"));
  }, []);

  const filteredEvents = useMemo(
    () => events.filter((event) => isInFilter(event.date, filter)),
    [events, filter]
  );

  const wheelItems = useMemo(() => {
    const allItems = [
      ...patterns.map((name) => ({ name, type: "pattern" as const })),
      ...investments.map((name) => ({ name, type: "investment" as const })),
    ];

    return allItems.map((item) => {
      const count = filteredEvents.filter(
        (event) => event.name === item.name && event.type === item.type
      ).length;

      return {
        ...item,
        count,
        value: Math.max(count, 1),
      };
    });
  }, [patterns, investments, filteredEvents]);

  const totalValue = wheelItems.reduce((sum, item) => sum + item.value, 0);

  function notice(name: string, type: "pattern" | "investment") {
    const nextCounts = {
      ...counts,
      [name]: (counts[name] || 0) + 1,
    };

    const nextEvent: NoticeEvent = {
      id: crypto.randomUUID(),
      name,
      type,
      date: new Date().toISOString(),
    };

    const nextEvents = [nextEvent, ...events];

    setCounts(nextCounts);
    setEvents(nextEvents);
    setSelected(name);
    setMessage(`Noticed ${name}`);

    localStorage.setItem("awake-counts", JSON.stringify(nextCounts));
    localStorage.setItem("awake-notice-events", JSON.stringify(nextEvents));

    setTimeout(() => setMessage(""), 1400);
  }

  let currentAngle = 0;

  return (
    <section className="mx-auto max-w-4xl px-4 py-8 text-center">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.3em] text-stone-400">
          Awareness Wheel
        </p>
        <h1 className="mt-2 text-3xl font-light text-stone-800">
          This moment has information.
        </h1>
        <p className="mt-3 text-sm text-stone-500">
          Tap what you notice. No judgment. Just awareness.
        </p>
      </div>

      <div className="mb-6 flex justify-center gap-2">
        {filters.map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`rounded-full px-4 py-2 text-sm transition ${
              filter === item
                ? "bg-stone-800 text-white"
                : "bg-white text-stone-500 shadow-sm"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="relative mx-auto h-[340px] w-[340px] rounded-full bg-gradient-to-br from-rose-50 via-emerald-50 to-sky-50 p-4 shadow-inner">
        <div className="absolute inset-0 animate-pulse rounded-full bg-white/20" />

        <svg viewBox="0 0 100 100" className="relative h-full w-full">
          {wheelItems.map((item) => {
            const sliceAngle = (item.value / totalValue) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + sliceAngle;
            currentAngle = endAngle;

            const largeArc = sliceAngle > 180 ? 1 : 0;

            const startOuter = polarToCartesian(50, 50, 48, endAngle);
            const endOuter = polarToCartesian(50, 50, 48, startAngle);
            const startInner = polarToCartesian(50, 50, 25, endAngle);
            const endInner = polarToCartesian(50, 50, 25, startAngle);

            const path = [
              `M ${startOuter.x} ${startOuter.y}`,
              `A 48 48 0 ${largeArc} 0 ${endOuter.x} ${endOuter.y}`,
              `L ${endInner.x} ${endInner.y}`,
              `A 25 25 0 ${largeArc} 1 ${startInner.x} ${startInner.y}`,
              "Z",
            ].join(" ");

            const midAngle = startAngle + sliceAngle / 2;
            const label = polarToCartesian(50, 50, 38, midAngle);

            const fill =
              item.type === "pattern"
                ? "rgba(251, 113, 133, 0.45)"
                : "rgba(52, 211, 153, 0.45)";

            return (
              <g
                key={`${item.type}-${item.name}`}
                onClick={() => notice(item.name, item.type)}
                className="cursor-pointer transition hover:opacity-80"
              >
                <path
                  d={path}
                  fill={fill}
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth="0.8"
                />

                <text
                  x={label.x}
                  y={label.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none fill-stone-700 text-[3px]"
                >
                  {item.name.length > 10
                    ? `${item.name.slice(0, 9)}…`
                    : item.name}
                </text>
              </g>
            );
          })}

          <circle cx="50" cy="50" r="22" fill="rgba(255,255,255,0.9)" />

          <text
            x="50"
            y="47"
            textAnchor="middle"
            className="fill-stone-700 text-[4px] font-light"
          >
            This
          </text>
          <text
            x="50"
            y="53"
            textAnchor="middle"
            className="fill-stone-700 text-[4px] font-light"
          >
            Moment
          </text>
        </svg>
      </div>

      {message && (
        <p className="mt-5 text-sm text-stone-500 transition">{message}</p>
      )}

      {selected && (
        <div className="mx-auto mt-8 max-w-md rounded-3xl bg-white/80 p-6 text-left shadow-sm">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
            Noticed
          </p>
          <h2 className="mt-2 text-2xl font-light text-stone-800">
            {selected}
          </h2>
          <p className="mt-3 text-sm leading-6 text-stone-500">
            This is not a score. It is simply something your awareness touched.
          </p>
        </div>
      )}
    </section>
  );
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}