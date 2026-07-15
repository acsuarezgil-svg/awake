"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { translations, type Language } from "../translations";
import {
    isDarkWheelTheme,
    isWheelTheme,
    wheelThemes,
    type WheelTheme,
} from "../theme";



type NoticeEvent = {
  id: string;
  name: string;
  type:
    | "pattern"
    | "investment"
    | "value"
    | "boundary";
  date: string;
};

type TimePeriod = "morning" | "afternoon" | "evening" | "night";


const filters = [
  { key: "Today", label: "Today" },
  { key: "7 Days", label: "7 Days" },
  { key: "Month", label: "Month" },
  { key: "All", label: "All" },
] as const;

type Filter = (typeof filters)[number]["key"];
type InsightView = "awareness" | "compass";


const timePeriods: {
    key: TimePeriod;
    label: string;
}[] = [
        { key: "morning", label: "Morning" },
        { key: "afternoon", label: "Afternoon" },
        { key: "evening", label: "Evening" },
        { key: "night", label: "Night" },
    ];

type AwarenessCell = {
    pattern: number;
    investment: number;
};

type SelectedCell = {
    dateKey: string;
    dateLabel: string;
    period: TimePeriod;
    periodLabel: string;
};

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

function getLocalDateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function startOfDay(date: Date) {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);

    return result;
}

function addDays(date: Date, amount: number) {
    const result = new Date(date);
    result.setDate(result.getDate() + amount);

    return result;
}

function getDateRange(filter: Filter, events: NoticeEvent[]) {
    const today = startOfDay(new Date());

    if (filter === "Today") {
        return [today];
    }

    let start: Date;

    if (filter === "7 Days") {
        start = addDays(today, -6);
    } else if (filter === "Month") {
        start = new Date(today.getFullYear(), today.getMonth(), 1);
    } else {
        const validDates = events
            .map((event) => new Date(event.date))
            .filter((date) => !Number.isNaN(date.getTime()))
            .sort((a, b) => a.getTime() - b.getTime());

        start =
            validDates.length > 0
                ? startOfDay(validDates[0])
                : today;
    }

    const dates: Date[] = [];
    let current = startOfDay(start);

    while (current <= today) {
        dates.push(new Date(current));
        current = addDays(current, 1);
    }

    return dates;
}

function formatDateLabel(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
    }).format(date);
}

function getCellDescription(cell: AwarenessCell) {
    const total = cell.pattern + cell.investment;

    if (total === 0) {
        return "Quiet";
    }

    if (cell.pattern > 0 && cell.investment > 0) {
        return total === 1
            ? "Patterns and investments appeared"
            : "Patterns and investments returned";
    }

    if (cell.pattern > 0) {
        return total === 1
            ? "A pattern appeared"
            : "Patterns returned";
    }

    return total === 1
        ? "An investment appeared"
        : "Investments returned";
}

function getCellStyle(
    cell: AwarenessCell,
    theme: (typeof wheelThemes)[WheelTheme]
) {
    const total = cell.pattern + cell.investment;

    if (total === 0) {
        return {
            background: "rgb(250 250 249)",
            borderColor: "rgb(245 245 244)",
        };
    }

    const opacity =
        total === 1
            ? 0.28
            : total === 2
                ? 0.46
                : 0.68;

    if (cell.pattern > 0 && cell.investment > 0) {
        return {
            background: `linear-gradient(
        135deg,
        rgba(${theme.pattern}, ${opacity}),
        rgba(${theme.investment}, ${opacity})
      )`,
            borderColor: `rgba(${theme.pattern}, 0.28)`,
        };
    }

    if (cell.pattern > 0) {
        return {
            background: `rgba(${theme.pattern}, ${opacity})`,
            borderColor: `rgba(${theme.pattern}, 0.32)`,
        };
    }

    return {
        background: `rgba(${theme.investment}, ${opacity})`,
        borderColor: `rgba(${theme.investment}, 0.32)`,
    };
}

export default function InsightsPage() {
    const [events, setEvents] = useState<NoticeEvent[]>([]);
    const [filter, setFilter] = useState<Filter>("Today");
    const [insightView, setInsightView] =
        useState<InsightView>("awareness");
    const [wheelTheme, setWheelTheme] =
        useState<WheelTheme>("roseSage");
    const [language, setLanguage] = useState<Language>("en");
    const [loaded, setLoaded] = useState(false);
    const [selectedCell, setSelectedCell] =
        useState<SelectedCell | null>(null);

    const t = translations[language];
    const activeTheme = wheelThemes[wheelTheme];
    const isDark = isDarkWheelTheme(wheelTheme);

    const primaryLabel =
        insightView === "awareness"
            ? "Patterns"
            : "Boundaries";

        const secondaryLabel =
        insightView === "awareness"
            ? "Investments"
            : "Values";

        const bothLabel = "Both";    

    useEffect(() => {
        const savedEvents = localStorage.getItem(
            "awake-notice-events"
        );

        const savedWheelTheme = localStorage.getItem(
            "awake-wheel-theme"
        );

        const savedLanguage = localStorage.getItem(
            "awake-language"
        ) as Language | null;

        if (savedEvents) {
            setEvents(JSON.parse(savedEvents));
        }

        if (savedWheelTheme && isWheelTheme(savedWheelTheme)) {
            setWheelTheme(savedWheelTheme);
        }

        if (savedLanguage) {
            setLanguage(savedLanguage);
        }


        setLoaded(true);
        const savedInsightView =
            localStorage.getItem("awake-insight-view");

            if (
            savedInsightView === "awareness" ||
            savedInsightView === "compass"
            ) {
            setInsightView(savedInsightView);
}
    }, []);

    useEffect(() => {
        if (!selectedCell) {
            return;
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setSelectedCell(null);
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [selectedCell]);

    useEffect(() => {
        localStorage.setItem(
            "awake-insight-view",
            insightView
        );
        }, [insightView]);

    const visibleDates = useMemo(
        () => getDateRange(filter, events),
        [filter, events]
    );

    const visibleDateKeys = useMemo(
        () =>
            new Set(
                visibleDates.map((date) => getLocalDateKey(date))
            ),
        [visibleDates]
    );

    const filteredEvents = useMemo(
        () =>
            events.filter((event) => {
            const eventDate = new Date(event.date);

            if (Number.isNaN(eventDate.getTime())) {
                return false;
            }

            const belongsToView =
                insightView === "awareness"
                ? event.type === "pattern" ||
                    event.type === "investment"
                : event.type === "value" ||
                    event.type === "boundary";

            return (
                belongsToView &&
                visibleDateKeys.has(getLocalDateKey(eventDate))
            );
            }),
        [events, visibleDateKeys, insightView]
        );

    const awarenessMap = useMemo(() => {
        const map: Record<string, AwarenessCell> = {};

        for (const date of visibleDates) {
            const dateKey = getLocalDateKey(date);

            for (const period of timePeriods) {
                map[`${dateKey}-${period.key}`] = {
                    pattern: 0,
                    investment: 0,
                };
            }
        }

        for (const event of filteredEvents) {
            const eventDate = new Date(event.date);
            const dateKey = getLocalDateKey(eventDate);
            const period = getTimePeriod(eventDate);
            const key = `${dateKey}-${period}`;

            if (!map[key]) {
                continue;
            }

            if (
                event.type === "pattern" ||
                event.type === "boundary"
                ) {
                map[key].pattern += 1;
                } else {
                map[key].investment += 1;
                }
        }

        return map;
    }, [filteredEvents, visibleDates]);

    const selectedCellEvents = useMemo(() => {
        if (!selectedCell) {
            return [];
        }

        return filteredEvents.filter((event) => {
            const eventDate = new Date(event.date);

            return (
                getLocalDateKey(eventDate) === selectedCell.dateKey &&
                getTimePeriod(eventDate) === selectedCell.period
            );
        });
    }, [filteredEvents, selectedCell]);

    const selectedPatterns = useMemo(
        () =>
            selectedCellEvents.filter((event) =>
            insightView === "awareness"
                ? event.type === "pattern"
                : event.type === "boundary"
            ),
        [selectedCellEvents, insightView]
        );

        const selectedInvestments = useMemo(
        () =>
            selectedCellEvents.filter((event) =>
            insightView === "awareness"
                ? event.type === "investment"
                : event.type === "value"
            ),
        [selectedCellEvents, insightView]
        );

    const uniqueSelectedPatterns = useMemo(
        () => [...new Set(selectedPatterns.map((event) => event.name))],
        [selectedPatterns]
    );

    const uniqueSelectedInvestments = useMemo(
        () => [...new Set(selectedInvestments.map((event) => event.name))],
        [selectedInvestments]
    );

    const observation = useMemo(() => {
        if (filteredEvents.length === 0) {
            return "There is not enough history here yet. Keep noticing gently.";
        }

        const periodTotals: Record<TimePeriod, number> = {
            morning: 0,
            afternoon: 0,
            evening: 0,
            night: 0,
        };

        let patternTotal = 0;
        let investmentTotal = 0;

        for (const event of filteredEvents) {
            const eventDate = new Date(event.date);
            const period = getTimePeriod(eventDate);

            periodTotals[period] += 1;

            if (event.type === "pattern") {
                patternTotal += 1;
            } else {
                investmentTotal += 1;
            }
        }

        const orderedPeriods = Object.entries(
            periodTotals
        ).sort(
            (a, b) => b[1] - a[1]
        ) as [TimePeriod, number][];

        const [strongestPeriod, strongestValue] =
            orderedPeriods[0];

        const [, secondValue] = orderedPeriods[1];

        if (strongestValue === secondValue) {
            return "Your awareness was gently spread across different parts of the day.";
        }

        const periodLabels: Record<TimePeriod, string> = {
            morning: "mornings",
            afternoon: "afternoons",
            evening: "evenings",
            night: "nights",
        };

        if (patternTotal > investmentTotal) {
            return `Patterns appeared more often during the ${periodLabels[strongestPeriod]}.`;
        }

        if (investmentTotal > patternTotal) {
            return `Investments appeared more often during the ${periodLabels[strongestPeriod]}.`;
        }

        return `Both patterns and investments appeared more often during the ${periodLabels[strongestPeriod]}.`;
    }, [filteredEvents]);


    return (
        <main
            className={`min-h-screen px-4 py-8 transition-[background] duration-500 ${isDark ? "text-stone-100" : "text-stone-800"
                }`}
            style={{ background: activeTheme.pageBackground }}
        >
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

                    <h1
                        className={`mx-auto mt-4 max-w-xl text-3xl font-light leading-tight sm:text-[2rem] ${
                            isDark ? "text-stone-100" : "text-stone-800"
                        }`}
                        >
                        {insightView === "awareness"
                            ? "How has awareness been showing up?"
                            : "How have you been staying true?"}
                        </h1>

                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-400">
                        {insightView === "awareness"
                            ? "A quiet view of when you paused and noticed."
                            : "A quiet view of when you lived your values and honored your boundaries."}
                    </p>
                </header>

                <div className="mt-8 flex justify-center">
                    <div
                        className={`relative flex w-80 rounded-full p-1 ${
                        isDark
                            ? "bg-slate-800"
                            : "bg-stone-200"
                        }`}
                    >
                        <span
                        className={`absolute bottom-1 top-1 w-[calc(50%-0.25rem)] rounded-full transition-all duration-300 ${
                            insightView === "compass"
                            ? "translate-x-full awake-compass-glow"
                            : ""
                        }`}
                        style={{
                            backgroundColor:
                            insightView === "compass"
                                ? `rgba(${activeTheme.investment},0.82)`
                                : `rgba(${activeTheme.pattern},0.82)`,
                        }}
                        />

                        <button
                        className={`relative z-10 flex-1 rounded-full py-2 text-sm ${
                            insightView === "awareness"
                            ? "text-white"
                            : isDark
                            ? "text-slate-300"
                            : "text-stone-500"
                        }`}
                        onClick={() =>
                            setInsightView("awareness")
                        }
                        >
                        Awareness
                        </button>

                        <button
                        className={`relative z-10 flex-1 rounded-full py-2 text-sm ${
                            insightView === "compass"
                            ? "text-white"
                            : isDark
                            ? "text-slate-300"
                            : "text-stone-500"
                        }`}
                        onClick={() =>
                            setInsightView("compass")
                        }
                        >
                        Compass
                        </button>
                    </div>
                    </div>

                <div className="mt-8 flex flex-wrap justify-center gap-2">
                    {filters.map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => {
                                setFilter(item.key);
                                setSelectedCell(null);
                            }}
                            className={`rounded-full border px-4 py-2 text-sm transition ${filter === item.key
                                    ? isDark
                                        ? "border-slate-500 bg-slate-600 text-white"
                                        : "border-stone-800 bg-stone-800 text-white"
                                    : isDark
                                        ? "border-white/15 bg-slate-900/50 text-slate-300"
                                        : "border-stone-200 bg-white text-stone-500"
                                }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <section className="mx-auto mt-10 max-w-[560px] lg:max-w-[600px]">
                    <div className="rounded-3xl border border-stone-100 bg-white px-2 py-6 sm:px-6">
                        <div className="grid grid-cols-[72px_repeat(4,minmax(0,1fr))] gap-2 sm:grid-cols-[90px_repeat(4,minmax(0,1fr))] sm:gap-2.5">
                            <div />

                            {timePeriods.map((period) => (
                                <div
                                    key={period.key}
                                    className="pb-1 text-center text-[9px] text-stone-400 sm:text-xs"
                                >
                                    {period.label}
                                </div>
                            ))}

                            {visibleDates.map((date) => {
                                const dateKey = getLocalDateKey(date);

                                return (
                                    <div
                                        key={dateKey}
                                        className="contents"
                                    >
                                        <div className="flex items-center text-[10px] leading-4 text-stone-400 sm:text-sm">
                                            {formatDateLabel(date)}
                                        </div>

                                        {timePeriods.map((period) => {
                                            const cell =
                                                awarenessMap[
                                                `${dateKey}-${period.key}`
                                                ] || {
                                                    pattern: 0,
                                                    investment: 0,
                                                };

                                            const description =
                                                getCellDescription(cell);

                                            return (
                                                <button
                                                    key={`${dateKey}-${period.key}`}
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedCell({
                                                            dateKey,
                                                            dateLabel: formatDateLabel(date),
                                                            period: period.key,
                                                            periodLabel: period.label,
                                                        })
                                                    }
                                                    aria-label={`${formatDateLabel(
                                                        date
                                                    )}, ${period.label}: ${description}. Tap for details.`}
                                                    title={`${formatDateLabel(
                                                        date
                                                    )} · ${period.label} · ${description}`}
                                                    className={`aspect-square rounded-xl border transition duration-200 sm:rounded-2xl ${selectedCell?.dateKey === dateKey &&
                                                            selectedCell?.period === period.key
                                                            ? "awake-selected-cell z-10 scale-[1.04] ring-2 ring-stone-500 ring-offset-2"
                                                            : "hover:scale-[1.03]"
                                                        }`}
                                                    style={getCellStyle(cell, activeTheme)}
                                                />
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-xs text-stone-400">
                            <div className="flex items-center gap-2">
                                <span
                                    className="h-3.5 w-3.5 rounded"
                                    style={{
                                        background: `rgba(${activeTheme.pattern}, 0.55)`,
                                    }}
                                />
                                <span>{primaryLabel}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <span
                                    className="h-3.5 w-3.5 rounded"
                                    style={{
                                        background: `rgba(${activeTheme.investment}, 0.55)`,
                                    }}
                                />
                                <span>{secondaryLabel}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <span
                                    className="h-3.5 w-3.5 rounded"
                                    style={{
                                        background: `linear-gradient(
                      135deg,
                      rgba(${activeTheme.pattern}, 0.55),
                      rgba(${activeTheme.investment}, 0.55)
                    )`,
                                    }}
                                />
                                <span>Both</span>
                            </div>
                        </div>

                        <div className="mt-5 flex items-center justify-center gap-3 text-xs text-stone-400">
                            <span>Quiet</span>

                            <div
                                className="h-2 w-24 rounded-full"
                                style={{
                                    background: `linear-gradient(
                    to right,
                    rgb(250 250 249),
                    rgba(${activeTheme.investment}, 0.68)
                  )`,
                                }}
                                aria-hidden="true"
                            />

                            <span>Returning</span>
                        </div>
                    </div>
                </section>

                <section className="mx-auto mt-8 max-w-xl rounded-3xl bg-stone-50 px-6 py-7 text-center">
                    <p className="text-xs uppercase tracking-[0.22em] text-stone-400">
                        {filter}
                    </p>

                    <p className="mt-4 text-lg font-light leading-8 text-stone-700">
                        {loaded
                            ? observation
                            : "Looking gently at your awareness…"}
                    </p>
                </section>

                <p className="mx-auto mt-8 max-w-md text-center text-xs leading-5 text-stone-400">
                    Color shows what kind of awareness appeared.
                    Deeper shades mean it returned within the same
                    part of the day.
                </p>
            </section>
            {selectedCell && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-3 py-6 sm:px-6"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="selected-moment-title"
                >
                    <button
                        type="button"
                        onClick={() => setSelectedCell(null)}
                        aria-label="Close selected moment"
                        className="absolute inset-0 bg-stone-900/10 backdrop-blur-[2px]"
                    />

                    <section
                        className="awake-moment-card relative z-10 max-h-[88vh] w-full max-w-[520px] overflow-y-auto rounded-3xl border border-white/80 bg-white/95 px-4 py-5 shadow-[0_24px_70px_rgba(41,37,36,0.16)] sm:px-7 sm:py-7"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex min-w-0 items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 sm:text-xs">
                                    Selected moment
                                </p>

                                <h2
                                    id="selected-moment-title"
                                    className="mt-2 break-words text-xl font-light text-stone-700"
                                >
                                    {selectedCell.dateLabel}
                                </h2>

                                <p className="mt-1 text-sm text-stone-400">
                                    {selectedCell.periodLabel}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedCell(null)}
                                aria-label="Close selected moment"
                                className="shrink-0 rounded-full px-3 py-1.5 text-xs text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
                            >
                                Close
                            </button>
                        </div>
                        {selectedCellEvents.length === 0 ? (
                            <p className="mt-6 text-sm leading-6 text-stone-400">
                                No awareness moments were recorded during this part of the
                                day.
                            </p>
                        ) : (
                            <>
                                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    <div className="min-w-0 rounded-2xl bg-stone-50 px-3 py-4 text-center">
                                        <p className="text-2xl font-light text-stone-700">
                                            {selectedCellEvents.length}
                                        </p>

                                        <p className="mt-1 break-words text-xs text-stone-400">
                                            Moments
                                        </p>
                                    </div>

                                    <div className="min-w-0 rounded-2xl bg-stone-50 px-3 py-4 text-center">
                                        <p
                                            className="text-2xl font-light"
                                            style={{
                                                color: `rgb(${activeTheme.pattern})`,
                                            }}
                                        >
                                            {selectedPatterns.length}
                                        </p>

                                        <p className="mt-1 break-words text-xs text-stone-400">
                                            {primaryLabel}
                                        </p>
                                    </div>

                                    <div className="min-w-0 rounded-2xl bg-stone-50 px-3 py-4 text-center">
                                        <p
                                            className="text-2xl font-light"
                                            style={{
                                                color: `rgb(${activeTheme.investment})`,
                                            }}
                                        >
                                            {selectedInvestments.length}
                                        </p>

                                        <p className="mt-1 break-words text-xs text-stone-400">
                                            {secondaryLabel}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-5">
                                    {uniqueSelectedPatterns.length > 0 && (
                                        <div>
                                            <p className="break-words text-[10px] uppercase tracking-[0.16em] text-stone-400 sm:text-xs sm:tracking-[0.18em]">
                                                {insightView === "awareness"
                                                    ? "Patterns noticed"
                                                    : "Boundaries honored"}
                                            </p>

                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {uniqueSelectedPatterns.map((name) => (
                                                    <span
                                                        key={name}
                                                        className="max-w-full break-words rounded-full px-3 py-1.5 text-sm text-stone-600"
                                                        style={{
                                                            background: `rgba(${activeTheme.pattern}, 0.16)`,
                                                        }}
                                                    >
                                                        {name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {uniqueSelectedInvestments.length > 0 && (
                                        <div>
                                            <p className="break-words text-[10px] uppercase tracking-[0.16em] text-stone-400 sm:text-xs sm:tracking-[0.18em]">
                                                {insightView === "awareness"
                                                    ? "Investments noticed"
                                                    : "Values lived"}
                                            </p>

                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {uniqueSelectedInvestments.map((name) => (
                                                    <span
                                                        key={name}
                                                        className="max-w-full break-words rounded-full px-3 py-1.5 text-sm text-stone-600"
                                                        style={{
                                                            background: `rgba(${activeTheme.investment}, 0.16)`,
                                                        }}
                                                    >
                                                        {name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </section>
                </div>
            )}

            <style jsx global>{`
@keyframes awake-moment-enter {
    0% {
        opacity: 0;
        transform: translateY(12px) scale(0.94);
    }

    65% {
        opacity: 1;
        transform: translateY(0) scale(1.015);
    }

    100% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

    .awake-moment-card {
        animation: awake-moment-enter 320ms cubic-bezier(0.22, 1, 0.36, 1);
        transform-origin: center;
    }

    @keyframes awake-cell-open {
        0% {
            transform: scale(1);
            box-shadow: 0 0 0 rgba(120, 113, 108, 0);
        }

        55% {
            transform: scale(1.05);
            box-shadow: 0 0 0 6px rgba(120, 113, 108, 0.08);
        }

        100% {
            transform: scale(1.03);
            box-shadow: 0 0 0 3px rgba(120, 113, 108, 0.05);
        }
    }

    .awake-selected-cell {
        position: relative;
        animation: awake-cell-open 240ms ease-out forwards;
    }

    @media (prefers-reduced-motion: reduce) {
        .awake-moment-card,
        .awake-selected-cell {
            animation: none;
        }
    }
`}</style>
        </main>
    );
}