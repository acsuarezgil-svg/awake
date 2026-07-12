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

const filters = ["Today", "7 Days", "Month", "All"] as const;
type Filter = (typeof filters)[number];

const timePeriods: {
    key: TimePeriod;
    label: string;
}[] = [
        { key: "morning", label: "Morning" },
        { key: "afternoon", label: "Afternoon" },
        { key: "evening", label: "Evening" },
        { key: "night", label: "Night" },
    ];

const wheelThemes = {
    roseSage: {
        pattern: "251, 113, 133",
        investment: "52, 211, 153",
    },

    clayMoss: {
        pattern: "194, 120, 91",
        investment: "112, 143, 95",
    },

    lavenderMint: {
        pattern: "167, 139, 250",
        investment: "45, 212, 191",
    },

    yinYang: {
        pattern: "63, 63, 70",
        investment: "168, 162, 158",
    },

    ocean: {
        pattern: "30, 64, 175",
        investment: "45, 212, 191",
    },

    forest: {
        pattern: "22, 101, 52",
        investment: "132, 204, 22",
    },

    sunset: {
        pattern: "194, 65, 12",
        investment: "251, 191, 36",
    },

    midnight: {
        pattern: "51, 65, 85",
        investment: "20, 184, 166",
    },
} as const;

type WheelTheme = keyof typeof wheelThemes;

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
    const [filter, setFilter] = useState<Filter>("7 Days");
    const [wheelTheme, setWheelTheme] =
        useState<WheelTheme>("roseSage");
    const [loaded, setLoaded] = useState(false);
    const [selectedCell, setSelectedCell] =
        useState<SelectedCell | null>(null);
useEffect(() => {
    const savedEvents = localStorage.getItem(
        "awake-notice-events"
    );

    if (savedEvents) {
        setEvents(JSON.parse(savedEvents));
    }

    const savedWheelTheme = localStorage.getItem(
        "awake-wheel-theme"
    );

    if (
        savedWheelTheme &&
        savedWheelTheme in wheelThemes
    ) {
        setWheelTheme(savedWheelTheme as WheelTheme);
    }

    setLoaded(true);
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

                return visibleDateKeys.has(
                    getLocalDateKey(eventDate)
                );
            }),
        [events, visibleDateKeys]
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

            map[key][event.type] += 1;
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
            selectedCellEvents.filter(
                (event) => event.type === "pattern"
            ),
        [selectedCellEvents]
    );

    const selectedInvestments = useMemo(
        () =>
            selectedCellEvents.filter(
                (event) => event.type === "investment"
            ),
        [selectedCellEvents]
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

    const activeTheme = wheelThemes[wheelTheme];

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

                    <h1 className="mx-auto mt-4 max-w-xl text-3xl font-light leading-tight text-stone-800 sm:text-[2rem]">
                        How has awareness been showing up?
                    </h1>

                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-400">
                        A quiet view of when you paused and noticed.
                    </p>
                </header>

                <div className="mt-8 flex flex-wrap justify-center gap-2">
                    {filters.map((item) => (
                        <button
                            key={item}
                            type="button"
                            onClick={() => {
                                setFilter(item);
                                setSelectedCell(null);
                            }}
                            className={`rounded-full px-4 py-2 text-sm transition ${filter === item
                                    ? "bg-stone-800 text-white"
                                    : "border border-stone-200 bg-white text-stone-500"
                                }`}
                        >
                            {item}
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
                                                    className={`aspect-square rounded-xl border transition duration-200 sm:rounded-2xl ${
                                                        selectedCell?.dateKey === dateKey &&
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
                                <span>Patterns</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <span
                                    className="h-3.5 w-3.5 rounded"
                                    style={{
                                        background: `rgba(${activeTheme.investment}, 0.55)`,
                                    }}
                                />
                                <span>Investments</span>
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
                                Patterns
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
                                Investments
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 space-y-5">
                        {uniqueSelectedPatterns.length > 0 && (
                            <div>
                                <p className="break-words text-[10px] uppercase tracking-[0.16em] text-stone-400 sm:text-xs sm:tracking-[0.18em]">
                                    Patterns noticed
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
                                    Investments noticed
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