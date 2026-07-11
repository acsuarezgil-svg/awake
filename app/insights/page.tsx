"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type NoticeEvent = {
  id: string;
  name: string;
  type: "pattern" | "investment";
  date: string;
};

type TimePeriod = "morning" | "afternoon" | "evening" | "night";

const days = [
  { label: "Mon", dayIndex: 1 },
  { label: "Tue", dayIndex: 2 },
  { label: "Wed", dayIndex: 3 },
  { label: "Thu", dayIndex: 4 },
  { label: "Fri", dayIndex: 5 },
  { label: "Sat", dayIndex: 6 },
  { label: "Sun", dayIndex: 0 },
] as const;

const timePeriods: {
  key: TimePeriod;
  label: string;
}[] = [
  { key: "morning", label: "Morning" },
  { key: "afternoon", label: "Afternoon" },
  { key: "evening", label: "Evening" },
  { key: "night", label: "Night" },
];

function getStartOfCurrentWeek() {
  const now = new Date();
  const start = new Date(now);

  const day = now.getDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;

  start.setDate(now.getDate() - daysSinceMonday);
  start.setHours(0, 0, 0, 0);

  return start;
}

function getTimePeriod(date: Date): TimePeriod {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return "morning";
  }

  if (hour >= 12 && hour < 17) {
    return "afternoon";
  }

  if (hour >= 17 && hour < 21) {
    return "evening";
  }

  return "night";
}

function getCellStyle(value: number) {
  if (value === 0) {
    return "border-stone-100 bg-stone-50";
  }

  if (value === 1) {
    return "border-emerald-100 bg-emerald-100/70";
  }

  if (value === 2) {
    return "border-emerald-200 bg-emerald-200/80";
  }

  return "border-emerald-300 bg-emerald-400/75";
}

export default function InsightsPage() {
  const [events, setEvents] = useState<NoticeEvent[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const savedEvents = localStorage.getItem("awake-notice-events");

    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }

    setLoaded(true);
  }, []);

  const weekEvents = useMemo(() => {
    const startOfWeek = getStartOfCurrentWeek();
    const endOfWeek = new Date(startOfWeek);

    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return events.filter((event) => {
      const eventDate = new Date(event.date);

      return eventDate >= startOfWeek && eventDate < endOfWeek;
    });
  }, [events]);

  const awarenessMap = useMemo(() => {
    const map: Record<string, number> = {};

    for (const day of days) {
      for (const period of timePeriods) {
        map[`${day.dayIndex}-${period.key}`] = 0;
      }
    }

    for (const event of weekEvents) {
      const eventDate = new Date(event.date);
      const period = getTimePeriod(eventDate);
      const key = `${eventDate.getDay()}-${period}`;

      map[key] = (map[key] || 0) + 1;
    }

    return map;
  }, [weekEvents]);

  const observation = useMemo(() => {
    if (weekEvents.length === 0) {
      return "There is not enough history yet. Keep noticing gently.";
    }

    const periodTotals: Record<TimePeriod, number> = {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0,
    };

    for (const event of weekEvents) {
      const eventDate = new Date(event.date);
      const period = getTimePeriod(eventDate);

      periodTotals[period] += 1;
    }

    const orderedPeriods = Object.entries(periodTotals).sort(
      (a, b) => b[1] - a[1]
    ) as [TimePeriod, number][];

    const [strongestPeriod, strongestValue] = orderedPeriods[0];
    const [, secondValue] = orderedPeriods[1];

    if (strongestValue === secondValue) {
      return "Your awareness has been gently spread across different parts of the day.";
    }

    const labels: Record<TimePeriod, string> = {
      morning: "mornings",
      afternoon: "afternoons",
      evening: "evenings",
      night: "nights",
    };

    return `Your awareness appeared more often during the ${labels[strongestPeriod]} this week.`;
  }, [weekEvents]);

  return (
    <main className="min-h-screen bg-white px-4 py-8">
      <section className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="text-sm text-stone-400 transition hover:text-stone-700"
        >
          ← Awake
        </Link>

        <header className="mt-10 text-center">
          <p className="text-xs lowercase tracking-[0.4em] text-stone-400">
            insights
          </p>

          <h1 className="mt-4 text-3xl font-light text-stone-800">
            How has awareness been showing up?
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-400">
            A quiet view of when you paused and noticed this week.
          </p>
        </header>

        <section className="mt-12">
          <div className="overflow-hidden rounded-3xl border border-stone-100 bg-white px-3 py-6 sm:px-6">
            <div className="grid grid-cols-[44px_repeat(4,minmax(0,1fr))] gap-2 sm:grid-cols-[70px_repeat(4,minmax(0,1fr))] sm:gap-3">
              <div />

              {timePeriods.map((period) => (
                <div
                  key={period.key}
                  className="pb-1 text-center text-[10px] text-stone-400 sm:text-xs"
                >
                  {period.label}
                </div>
              ))}

              {days.map((day) => (
                <div key={day.dayIndex} className="contents">
                  <div className="flex items-center text-xs text-stone-400 sm:text-sm">
                    {day.label}
                  </div>

                  {timePeriods.map((period) => {
                    const value =
                      awarenessMap[`${day.dayIndex}-${period.key}`] || 0;

                    return (
                      <div
                        key={`${day.dayIndex}-${period.key}`}
                        aria-label={`${day.label} ${period.label}: ${
                          value === 0
                            ? "quiet"
                            : value === 1
                              ? "present"
                              : "returning"
                        }`}
                        className={`aspect-square rounded-xl border transition sm:rounded-2xl ${getCellStyle(
                          value
                        )}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="mt-7 flex items-center justify-center gap-3 text-xs text-stone-400">
              <span>Quiet</span>

              <div className="flex gap-1.5" aria-hidden="true">
                <span className="h-3 w-3 rounded bg-stone-50 ring-1 ring-stone-100" />
                <span className="h-3 w-3 rounded bg-emerald-100/70" />
                <span className="h-3 w-3 rounded bg-emerald-200/80" />
                <span className="h-3 w-3 rounded bg-emerald-400/75" />
              </div>

              <span>Returning</span>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-8 max-w-xl rounded-3xl bg-stone-50 px-6 py-7 text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-stone-400">
            This week
          </p>

          <p className="mt-4 text-lg font-light leading-8 text-stone-700">
            {loaded ? observation : "Looking gently at your week…"}
          </p>
        </section>

        <p className="mx-auto mt-8 max-w-md text-center text-xs leading-5 text-stone-400">
          The shades reflect moments of awareness, not success or failure.
        </p>
      </section>
    </main>
  );
}