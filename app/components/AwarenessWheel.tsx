"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  isWheelTheme,
  wheelThemes,
  type WheelTheme,
} from "../theme";

type Counts = Record<string, number>;

type NoticeEvent = {
  id: string;
  name: string;
  type: "pattern" | "investment";
  date: string;
};

type PendingSelection = {
  name: string;
  type: "pattern" | "investment";
};

const defaultPatterns = ["Urgency", "Overthinking", "Avoidance"];
const defaultInvestments = ["Exercise", "Learning", "Creativity"];

const filters = ["Today", "7 Days", "Month", "All"] as const;
type Filter = (typeof filters)[number];

type HapticStrength = "light" | "notice" | "settle";

function triggerHaptic(strength: HapticStrength) {
  if (
    typeof window === "undefined" ||
    !("vibrate" in navigator)
  ) {
    return;
  }

  const patterns: Record<HapticStrength, number | number[]> = {
    light: 8,
    notice: [12, 30, 18],
    settle: 10,
  };

  navigator.vibrate(patterns[strength]);
}

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
  const [rippleKey, setRippleKey] = useState<number | null>(null);
  const [wheelTheme, setWheelTheme] = useState<WheelTheme>("roseSage");
  const [showWheelAppearance, setShowWheelAppearance] = useState(false);
  const [pendingSelection, setPendingSelection] =
    useState<PendingSelection | null>(null);
  const [directions, setDirections] = useState<string[]>([]);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isAutoCentering, setIsAutoCentering] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const autoCenterTimeoutRef = useRef<number | null>(null);
  const dragStartAngleRef = useRef<number | null>(null);
  const dragStartRotationRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const suppressClickRef = useRef(false);

  useEffect(() => {
    setCounts(JSON.parse(localStorage.getItem("awake-counts") || "{}"));
    setDirections(
      JSON.parse(localStorage.getItem("awake-direction") || "[]")
    );
    setPatterns(
      JSON.parse(localStorage.getItem("awake-patterns") || "null") ||
        defaultPatterns
    );
    setInvestments(
      JSON.parse(localStorage.getItem("awake-investments") || "null") ||
        defaultInvestments
    );
    setEvents(JSON.parse(localStorage.getItem("awake-notice-events") || "[]"));

    const savedWheelTheme = localStorage.getItem("awake-wheel-theme");

    if (savedWheelTheme && isWheelTheme(savedWheelTheme)) {
      setWheelTheme(savedWheelTheme);
    }
    }, []);
    useEffect(() => {
      return () => {
        if (autoCenterTimeoutRef.current !== null) {
          window.clearTimeout(autoCenterTimeoutRef.current);
        }
      };
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
        value: count === 0 ? 1 : Math.min(1 + Math.sqrt(count), 5),
      };
    });
  }, [patterns, investments, filteredEvents]);

  const totalValue = wheelItems.reduce((sum, item) => sum + item.value, 0);

  function getSliceMidAngle(
    name: string,
    type: "pattern" | "investment"
  ) {
    let angle = 0;

    for (const item of wheelItems) {
      const sliceAngle = (item.value / totalValue) * 360;
      const midAngle = angle + sliceAngle / 2;

      if (item.name === name && item.type === type) {
        return midAngle;
      }

      angle += sliceAngle;
    }

    return null;
  }

  function normalizeAngle(angle: number) {
    return ((angle + 180) % 360 + 360) % 360 - 180;
  }

  function centerSelectedSlice(
    name: string,
    type: "pattern" | "investment"
  ) {
    const midAngle = getSliceMidAngle(name, type);

    if (midAngle === null) return;

    const displayedMidAngle = midAngle + wheelRotation;
    const shortestTurn = normalizeAngle(-displayedMidAngle);

    setIsAutoCentering(true);
    setWheelRotation((current) => current + shortestTurn);

    if (autoCenterTimeoutRef.current !== null) {
      window.clearTimeout(autoCenterTimeoutRef.current);
    }

    autoCenterTimeoutRef.current = window.setTimeout(() => {
      setIsAutoCentering(false);
      triggerHaptic("settle");
      autoCenterTimeoutRef.current = null;
    }, 550);
  }

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
    setPendingSelection(null);
    setRippleKey((k) => (k ?? 0) + 1);
    setMessage(`Noticed ${name}`);

    triggerHaptic("notice");
    centerSelectedSlice(name, type);

    localStorage.setItem("awake-counts", JSON.stringify(nextCounts));
    localStorage.setItem("awake-notice-events", JSON.stringify(nextEvents));

    setTimeout(() => setMessage(""), 1400);
  }

    function handleSliceTap(
      name: string,
      type: "pattern" | "investment",
      hasVisibleLabel: boolean
    ) {
      if (suppressClickRef.current) {
        return;
      }

      if (hasVisibleLabel) {
        triggerHaptic("light");
        notice(name, type);
        return;
      }

      const isAlreadyPending =
        pendingSelection?.name === name && pendingSelection?.type === type;

      if (isAlreadyPending) {
        triggerHaptic("light");
        notice(name, type);
        return;
      }

      triggerHaptic("light");
      setPendingSelection({ name, type });
    }

    function changeWheelTheme(nextTheme: WheelTheme) {
      setWheelTheme(nextTheme);
      localStorage.setItem("awake-wheel-theme", nextTheme);
    }

    function getPointerAngle(clientX: number, clientY: number) {
      const svg = svgRef.current;

      if (!svg) return 0;

      const rect = svg.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      return (
        Math.atan2(clientY - centerY, clientX - centerX) *
        (180 / Math.PI)
      );
    }

    function handleWheelPointerDown(
      event: React.PointerEvent<SVGSVGElement>
    ) {
      setIsAutoCentering(false);

      if (autoCenterTimeoutRef.current !== null) {
        window.clearTimeout(autoCenterTimeoutRef.current);
        autoCenterTimeoutRef.current = null;
      }

      event.currentTarget.setPointerCapture(event.pointerId);

      dragStartAngleRef.current = getPointerAngle(
        event.clientX,
        event.clientY
      );

      dragStartRotationRef.current = wheelRotation;
      hasDraggedRef.current = false;
      suppressClickRef.current = false;
    }

    function handleWheelPointerMove(
      event: React.PointerEvent<SVGSVGElement>
    ) {
      if (dragStartAngleRef.current === null) return;

      const currentPointerAngle = getPointerAngle(
        event.clientX,
        event.clientY
      );

      const angleDifference =
        currentPointerAngle - dragStartAngleRef.current;

      if (Math.abs(angleDifference) > 3) {
        hasDraggedRef.current = true;
        setPendingSelection(null);
      }

      setWheelRotation(
        dragStartRotationRef.current + angleDifference
      );
    }

    function handleWheelPointerEnd(
      event: React.PointerEvent<SVGSVGElement>
    ) {
      suppressClickRef.current = hasDraggedRef.current;
      dragStartAngleRef.current = null;

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }

    const activeWheelTheme = wheelThemes[wheelTheme];

    let currentAngle = 0;

  return (
    <section className="mx-auto max-w-4xl px-4 py-8 text-center">
      <div className="mb-7">
        <p className="text-xs lowercase tracking-[0.4em] text-stone-400">
          awake
        </p>

        <p className="mt-3 text-sm font-light tracking-[0.18em] text-stone-500">
          Observe · Choose · Grow
        </p>
      </div>

      {directions.length > 0 && (
        <Link
          href="/direction"
          className="mx-auto mb-6 block max-w-md rounded-2xl px-4 py-3 text-center transition hover:bg-stone-50"
        >
          <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400">
            Your direction
          </p>

          <p className="mt-2 text-sm leading-6 text-stone-600">
            {directions.slice(0, 3).join(" · ")}
            {directions.length > 3 && ` +${directions.length - 3}`}
          </p>
        </Link>
      )}

            <div className="mb-5">
              <button
                type="button"
                onClick={() => setShowWheelAppearance((current) => !current)}
                aria-expanded={showWheelAppearance}
                className="mx-auto flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs text-stone-500 transition hover:border-stone-300 hover:text-stone-700"
              >
                <span>Wheel appearance</span>

                <span
                  aria-hidden="true"
                  className={`transition-transform ${
                    showWheelAppearance ? "rotate-180" : ""
                  }`}
                >
                  ↓
                </span>
              </button>

              {showWheelAppearance && (
                <div className="mx-auto mt-4 grid max-w-[520px] grid-cols-2 gap-2 min-[420px]:grid-cols-3 sm:grid-cols-4">
                  {(Object.keys(wheelThemes) as WheelTheme[]).map((themeKey) => {
                    const theme = wheelThemes[themeKey];
                    const isActive = wheelTheme === themeKey;

                    return (
                      <button
                        key={themeKey}
                        type="button"
                        onClick={() => changeWheelTheme(themeKey)}
                        aria-label={`Use ${theme.name} wheel colors`}
                        aria-pressed={isActive}
                        title={theme.name}
                        className={`group min-w-[118px] rounded-2xl border bg-white p-2 text-left transition duration-200 ${
                          isActive
                            ? "border-stone-500 shadow-sm ring-1 ring-stone-300"
                            : "border-stone-200 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-sm"
                        }`}
                      >
                        <span
                          className="relative block h-8 w-full overflow-hidden rounded-xl border border-white/70"
                          style={{ background: theme.wheelBackground }}
                        >
                          <span
                            className="absolute inset-y-0 left-0 w-1/2"
                            style={{ backgroundColor: theme.patternFill }}
                          />

                          <span
                            className="absolute inset-y-0 right-0 w-1/2"
                            style={{ backgroundColor: theme.investmentFill }}
                          />

                          {isActive && (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-[10px] text-stone-700 shadow-sm">
                                ✓
                              </span>
                            </span>
                          )}
                        </span>

                        <span className="mt-2 block text-center text-[11px] text-stone-500">
                          {theme.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div
              className="relative mx-auto aspect-square w-full max-w-[340px] rounded-full p-4 shadow-inner sm:max-w-[430px] md:max-w-[500px] lg:max-w-[520px]"
              style={{ background: activeWheelTheme.wheelBackground }}
            >
        <div className="absolute inset-0 rounded-full bg-white/20" />
        {rippleKey !== null && (
          <div
            key={rippleKey}
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
          >
            <div className="ripple-circle" />
          </div>
        )}

        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          className="relative h-full w-full cursor-grab active:cursor-grabbing"
          style={{ touchAction: "none" }}
          onPointerDown={handleWheelPointerDown}
          onPointerMove={handleWheelPointerMove}
          onPointerUp={handleWheelPointerEnd}
          onPointerCancel={handleWheelPointerEnd}
        >
          <g
            style={{
              transform: `rotate(${wheelRotation}deg)`,
              transformOrigin: "50px 50px",
              transformBox: "view-box",
              transition: isAutoCentering
                ? "transform 550ms ease-in-out"
                : "none",
            }}
          >
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
            const showLabel = sliceAngle >= 18;
            const firstWord = item.name.trim().split(/\s+/)[0];
            const displayLabel =
              firstWord.length > 10 ? `${firstWord.slice(0, 9)}…` : firstWord;
            const isPending =
              pendingSelection?.name === item.name &&
              pendingSelection?.type === item.type;

            const fill =
              item.type === "pattern"
                ? activeWheelTheme.patternFill
                : activeWheelTheme.investmentFill;

            return (
              <g
                key={`${item.type}-${item.name}`}
                onClick={() => handleSliceTap(item.name, item.type, showLabel)}
                className="cursor-pointer transition hover:opacity-80"
              >
                <path
                  d={path}
                  fill={fill}
                  stroke={
                    isPending
                      ? "rgba(120, 113, 108, 0.9)"
                      : "rgba(255,255,255,0.8)"
                  }
                  strokeWidth={isPending ? "1.5" : "0.8"}
                  opacity={isPending ? 1 : 0.92}
                />

                {showLabel && (
                  <text
                    x={label.x}
                    y={label.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${-wheelRotation} ${label.x} ${label.y})`}
                    className="pointer-events-none fill-stone-700 text-[3px]"
                  >
                    {displayLabel}
                  </text>
                )}
              </g>
            );
          })}
        </g>

          <circle
            cx="50"
            cy="50"
            r="22"
            fill="rgba(255,255,255,0.9)"
            className="awake-breathe-halo"
          />
          

          <circle
            cx="50"
            cy="50"
            r="22"
            fill="rgba(255,255,255,0.9)"
          />

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

          <a
            href="/direction"
            aria-label="Shape your wheel"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
            className="group cursor-pointer"
          >
            <title>Shape your wheel</title>

            <circle
              cx="50"
              cy="60"
              r="4"
              fill="transparent"
            />

            <text
              x="50"
              y="60"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-stone-400 text-[4px] font-light transition group-hover:fill-stone-700"
            >
              +
            </text>
          </a>
        </svg>
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

      {pendingSelection && (
        <div className="mx-auto mt-3 max-w-sm rounded-2xl bg-white/85 px-4 py-3 text-sm text-stone-600 shadow-sm">
          <p>
            This slice is{" "}
            <span className="font-medium text-stone-800">
              {pendingSelection.name}
            </span>
          </p>
          <p className="mt-1 text-xs text-stone-400">
            Tap the same slice again to notice it.
          </p>
        </div>
      )}

      <nav
        aria-label="Awake sections"
        className="mx-auto mt-10 flex max-w-md flex-col gap-4"
      >
        <HomeActionCard
          href="/direction"
          symbol="✦"
          title="Shape Your Wheel"
          description="Choose the patterns and investments that matter to you."
        />

        <HomeActionCard
          href="/reflection"
          symbol="✍︎"
          title="Reflection"
          description="Capture what this moment taught you."
        />

        <HomeActionCard
          href="/reflections"
          symbol="◌"
          title="Journey"
          description="Revisit your reflections and meaningful moments."
        />

        <HomeActionCard
          href="/insights"
          symbol="⌁"
          title="Insights"
          description="Notice what keeps returning and what is growing."
        />

        <HomeActionCard
          href="/about"
          symbol="♡"
          title="About Awake"
          description="Explore the philosophy behind Awake."
        />
      </nav>

      {message && (
        <p className="sr-only" aria-live="polite">
          {message}
        </p>
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
      <style jsx global>{`
        @keyframes awake-breathe {
          0%,
           100% {
            transform: scale(1);
            opacity: 0.55;
          }
          
          50% {
            transform: scale(1.20);
            opacity: 0.12;
          }
        }

        .awake-breathe-halo {
          animation: awake-breathe 6.5s ease-in-out infinite;
          transform-box: view-box;
          transform-origin: 50px 50px;
        }

        @media (prefers-reduced-motion: reduce) {
          .awake-breathe-halo {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}

type HomeActionCardProps = {
  href: string;
  symbol: string;
  title: string;
  description: string;
};

function HomeActionCard({
  href,
  symbol,
  title,
  description,
}: HomeActionCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-stone-200 bg-white/80 px-5 py-5 text-left transition duration-300 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-sm"
    >
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="mt-0.5 text-lg text-stone-400 transition group-hover:text-stone-600"
        >
          {symbol}
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="text-base font-medium text-stone-700">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-stone-400">
            {description}
          </p>
        </div>

        <span
          aria-hidden="true"
          className="mt-1 text-stone-300 transition group-hover:translate-x-1 group-hover:text-stone-500"
        >
          →
        </span>
      </div>
    </Link>
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