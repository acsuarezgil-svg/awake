"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  isDarkWheelTheme,
  isWheelTheme,
  wheelThemes,
  type WheelTheme,
} from "../theme";
import LivingWheelCard, {
  type LivingWheelCardState,
} from "./LivingWheelCard";

type Counts = Record<string, number>;
type WheelView = "awareness" | "compass";

type NoticeEvent = {
  id: string;
  name: string;
  type: WheelItemType;
  date: string;
};

type PendingSelection = {
  name: string;
  type: WheelItemType;
};

type WheelItemType =
  | "pattern"
  | "investment"
  | "value"
  | "boundary";

const defaultPatterns = ["Urgency", "Overthinking", "Avoidance"];
const defaultInvestments = ["Exercise", "Learning", "Creativity"];
const defaultValues = [
  "Honesty",
  "Kindness",
  "Growth",
  "Health",
  "Family",
  "Courage",
  "Creativity",
  "Peace",
];

const defaultBoundaries = [
  "Pause",
  "Say No",
  "Rest",
  "Protect Sleep",
  "Leave",
  "Ask for Help",
  "Limit Work",
  "Take Space",
];

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
  const [filter, setFilter] = useState<Filter>("Today");
  const [message, setMessage] = useState("");
  const [rippleKey, setRippleKey] = useState<number | null>(null);
  const [wheelTheme, setWheelTheme] = useState<WheelTheme>("roseSage");
  const [showWheelAppearance, setShowWheelAppearance] = useState(false);
  const [showAwakeMenu, setShowAwakeMenu] = useState(false);
  const [showAppearanceSection, setShowAppearanceSection] =
    useState(false);
  const [showCenterMenu, setShowCenterMenu] =
    useState(false);

  const [pendingSelection, setPendingSelection] =
    useState<PendingSelection | null>(null);
  const [livingCard, setLivingCard] =
    useState<LivingWheelCardState | null>(null);
  const [isLivingCardExpanded, setIsLivingCardExpanded] =
    useState(false);
  const [isLongPressHolding, setIsLongPressHolding] =
    useState(false);
  const [wheelView, setWheelView] =
  useState<WheelView>("awareness");

  const [values, setValues] = useState(defaultValues);
  const [boundaries, setBoundaries] =
    useState(defaultBoundaries);
    
  const [directions, setDirections] = useState<string[]>([]);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isAutoCentering, setIsAutoCentering] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const autoCenterTimeoutRef = useRef<number | null>(null);
  const livingCardTimeoutRef = useRef<number | null>(null);
  const dragStartAngleRef = useRef<number | null>(null);
  const dragStartRotationRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const suppressClickRef = useRef(false);
  const longPressTimeoutRef = useRef<number | null>(null);
  const longPressTriggeredRef = useRef(false);
  const pressedSliceRef = useRef<PendingSelection | null>(null);
  const isManagingSliceRef = useRef(false);

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

    const savedWheelView = localStorage.getItem("awake-wheel-view");
    if (
      savedWheelView === "awareness" ||
      savedWheelView === "compass"
    ) {
      setWheelView(savedWheelView);
    }

    setValues(
      JSON.parse(localStorage.getItem("awake-values") || "null") ||
        defaultValues
    );

    setBoundaries(
      JSON.parse(
        localStorage.getItem("awake-boundaries") || "null"
      ) || defaultBoundaries
    );
    }, []);
    useEffect(() => {
      return () => {
        if (autoCenterTimeoutRef.current !== null) {
          window.clearTimeout(autoCenterTimeoutRef.current);
        }

        if (livingCardTimeoutRef.current !== null) {
          window.clearTimeout(livingCardTimeoutRef.current);
        }

        if (longPressTimeoutRef.current !== null) {
          window.clearTimeout(longPressTimeoutRef.current);
        }
      };
    }, []);

  const filteredEvents = useMemo(
    () => events.filter((event) => isInFilter(event.date, filter)),
    [events, filter]
  );

  const wheelItems = useMemo(() => {
    const allItems =
      wheelView === "awareness"
        ? [
            ...patterns.map((name) => ({
              name,
              type: "pattern" as const,
            })),
            ...investments.map((name) => ({
              name,
              type: "investment" as const,
            })),
          ]
        : [
            ...boundaries.map((name) => ({
              name,
              type: "boundary" as const,
            })),
            ...values.map((name) => ({
              name,
              type: "value" as const,
            })),
          ];

    return allItems.map((item) => {
      const count = filteredEvents.filter(
        (event) =>
          event.name === item.name &&
          event.type === item.type
      ).length;

      return {
        ...item,
        count,
        value:
          wheelView === "awareness"
            ? count === 0
              ? 1
              : Math.min(1 + Math.sqrt(count), 5)
            : 1,
      };
    });
  }, [
    wheelView,
    patterns,
    investments,
    boundaries,
    values,
    filteredEvents,
  ]);

  const totalValue = wheelItems.reduce((sum, item) => sum + item.value, 0);

  function getSliceMidAngle(
    name: string,
    type: WheelItemType
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
    type: WheelItemType
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

  function showLivingCard(
    nextState: LivingWheelCardState,
    duration?: number
  ) {
    if (livingCardTimeoutRef.current !== null) {
      window.clearTimeout(livingCardTimeoutRef.current);
      livingCardTimeoutRef.current = null;
    }

    isManagingSliceRef.current = false;
    setIsLivingCardExpanded(false);
    setLivingCard(nextState);

    if (duration) {
      livingCardTimeoutRef.current = window.setTimeout(() => {
        setLivingCard(null);
        livingCardTimeoutRef.current = null;
      }, duration);
    }
  }

  function expandLivingCard() {
  if (!livingCard) return;

  if (livingCardTimeoutRef.current !== null) {
    window.clearTimeout(livingCardTimeoutRef.current);
    livingCardTimeoutRef.current = null;
  }

  setIsLivingCardExpanded(true);
  triggerHaptic("light");
}

function closeLivingCard() {
  if (livingCardTimeoutRef.current !== null) {
    window.clearTimeout(livingCardTimeoutRef.current);
    livingCardTimeoutRef.current = null;
  }

  isManagingSliceRef.current = false;
  longPressTriggeredRef.current = false;
  suppressClickRef.current = false;

  setIsLongPressHolding(false);

  setIsLivingCardExpanded(false);
  setLivingCard(null);
  setPendingSelection(null);
}

function getWheelList(type: WheelItemType) {
  switch (type) {
    case "pattern":
      return patterns;

    case "investment":
      return investments;

    case "value":
      return values;

    case "boundary":
      return boundaries;
  }
}

function saveWheelList(
  type: WheelItemType,
  nextList: string[]
) {
  switch (type) {
    case "pattern":
      setPatterns(nextList);
      localStorage.setItem(
        "awake-patterns",
        JSON.stringify(nextList)
      );
      break;

    case "investment":
      setInvestments(nextList);
      localStorage.setItem(
        "awake-investments",
        JSON.stringify(nextList)
      );
      break;

    case "value":
      setValues(nextList);
      localStorage.setItem(
        "awake-values",
        JSON.stringify(nextList)
      );
      break;

    case "boundary":
      setBoundaries(nextList);
      localStorage.setItem(
        "awake-boundaries",
        JSON.stringify(nextList)
      );
      break;
  }
}

  function notice(name: string, type: WheelItemType) {
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
    setPendingSelection(null);
    setRippleKey((k) => (k ?? 0) + 1);
    setMessage(`Noticed ${name}`);

    showLivingCard(
      {
        mode: "noticed",
        name,
        type,
      },
      2600
    );

    triggerHaptic("notice");
    centerSelectedSlice(name, type);

    localStorage.setItem("awake-counts", JSON.stringify(nextCounts));
    localStorage.setItem("awake-notice-events", JSON.stringify(nextEvents));

    setTimeout(() => setMessage(""), 1400);
  }

  function noticeAgainFromCard() {
    if (!livingCard) return;

    notice(livingCard.name, livingCard.type);
  }

  function undoLastNoticeFromCard() {
    if (!livingCard) return;

    const eventIndex = events.findIndex(
      (event) =>
        event.name === livingCard.name &&
        event.type === livingCard.type
    );

    if (eventIndex === -1) {
      showLivingCard(
        {
          mode: "feedback",
          name: livingCard.name,
          type: livingCard.type,
          message: "No notice to undo",
        },
        2400
      );
      return;
    }

    const nextEvents = events.filter(
      (_, index) => index !== eventIndex
    );

    const nextCount = Math.max(
      0,
      (counts[livingCard.name] || 0) - 1
    );

    const nextCounts = {
      ...counts,
      [livingCard.name]: nextCount,
    };

    setEvents(nextEvents);
    setCounts(nextCounts);
    setPendingSelection(null);

    localStorage.setItem(
      "awake-notice-events",
      JSON.stringify(nextEvents)
    );

    localStorage.setItem(
      "awake-counts",
      JSON.stringify(nextCounts)
    );

    triggerHaptic("light");

    showLivingCard(
      {
        mode: "feedback",
        name: livingCard.name,
        type: livingCard.type,
        message: "↶ Last notice removed",
      },
      2600
    );
  }

  function renameSliceFromCard(nextName: string) {
  if (!livingCard) return;

  const trimmedName = nextName.trim();
  const oldName = livingCard.name;
  const type = livingCard.type;


  if (!trimmedName || trimmedName === oldName) {
    return;
  }
  const currentList = getWheelList(type);

  const nameAlreadyExists = currentList.some(
    (item) =>
      item.toLowerCase() === trimmedName.toLowerCase() &&
      item !== oldName
  );

  if (nameAlreadyExists) {
    showLivingCard(
      {
        mode: "feedback",
        name: oldName,
        type,
        message: "That name is already on your wheel",
      },
      2600
    );
    return;
  }

  const nextList = currentList.map((item) =>
    item === oldName ? trimmedName : item
  );

  saveWheelList(type, nextList);

  const nextEvents = events.map((event) =>
    event.name === oldName && event.type === type
      ? {
          ...event,
          name: trimmedName,
        }
      : event
  );

  const nextCounts = {
    ...counts,
    [trimmedName]: counts[oldName] || 0,
  };

  delete nextCounts[oldName];

  setEvents(nextEvents);
  setCounts(nextCounts);
  setPendingSelection(null);

  localStorage.setItem(
    "awake-notice-events",
    JSON.stringify(nextEvents)
  );

  localStorage.setItem(
    "awake-counts",
    JSON.stringify(nextCounts)
  );

  showLivingCard(
    {
      mode: "feedback",
      name: trimmedName,
      type,
      message: "✓ Slice renamed",
    },
    2600
  );
}

function removeSliceFromCard() {
  if (!livingCard) return;

  const { name, type } = livingCard;

  const currentList = getWheelList(type);

  const nextList = currentList.filter(
    (item) => item !== name
  );

  saveWheelList(type, nextList);

  setPendingSelection(null);

  showLivingCard(
    {
      mode: "feedback",
      name,
      type,
      message: "Removed from current wheel",
    },
    2600
  );
}

    function handleSliceTap(
      name: string,
      type: WheelItemType,
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

      showLivingCard({
        mode: "preview",
        name,
        type,
      });
    }

    function selectPerspective(nextFilter: Filter) {
      setFilter(nextFilter);
      setShowCenterMenu(false);
      triggerHaptic("light");
    }

    function changeWheelView(nextView: WheelView) {
      setWheelView(nextView);
      localStorage.setItem("awake-wheel-view", nextView);

      setPendingSelection(null);
      setLivingCard(null);
      setIsLivingCardExpanded(false);
      setShowCenterMenu(false);
      setWheelRotation(0);

      triggerHaptic("light");
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
    function clearLongPressTimer() {
      if (longPressTimeoutRef.current !== null) {
        window.clearTimeout(longPressTimeoutRef.current);
        longPressTimeoutRef.current = null;
      }
    }

    function startSliceLongPress(
      name: string,
      type: WheelItemType
    ) {
      clearLongPressTimer();

      pressedSliceRef.current = { name, type };
      longPressTriggeredRef.current = false;

      longPressTimeoutRef.current = window.setTimeout(() => {
        longPressTriggeredRef.current = true;
        suppressClickRef.current = true;
        isManagingSliceRef.current = true;

        setPendingSelection(null);

        showLivingCard({
          mode: "manage",
          name,
          type,
        });

        isManagingSliceRef.current = true;
        setIsLivingCardExpanded(true);
        setIsLongPressHolding(true);

        requestAnimationFrame(() => {
          triggerHaptic("settle");
        });

        longPressTimeoutRef.current = null;
      }, 650);
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
      if (isManagingSliceRef.current) {
        return;
      }

      const currentPointerAngle = getPointerAngle(
        event.clientX,
        event.clientY
      );

      const angleDifference =
        currentPointerAngle - dragStartAngleRef.current;

      const movementThreshold =
        longPressTimeoutRef.current !== null ? 9 : 3;

      if (Math.abs(angleDifference) > movementThreshold) {
        clearLongPressTimer();
        hasDraggedRef.current = true;
        setPendingSelection(null);
        setIsLivingCardExpanded(false);
        setLivingCard(null);
      }

      setWheelRotation(
        dragStartRotationRef.current + angleDifference
      );
    }

    function handleWheelPointerEnd(
      event: React.PointerEvent<SVGSVGElement>
    ) {
      clearLongPressTimer();
      dragStartAngleRef.current = null;

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      if (isManagingSliceRef.current) {
        setIsLongPressHolding(false);
        return;
      }
      suppressClickRef.current = hasDraggedRef.current;

      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }

    const activeWheelTheme = wheelThemes[wheelTheme];
    const isDark = isDarkWheelTheme(wheelTheme);
    const centerFilterLabel =
      wheelView === "awareness"
        ? filter.toUpperCase()
        : "VALUES";

    const centerSubtitle =
      wheelView === "awareness"
        ? "This Moment"
        : "Stay True";
    const perspectiveAccent = activeWheelTheme.patternFill;

    const perspectiveInactive = isDark
      ? "rgba(51,65,85,0.96)"
      : "rgba(87,83,78,0.82)";

    const perspectivePetalFill = isDark
      ? "rgba(248,250,252,0.88)"
      : "rgba(255,255,255,0.78)";

    const perspectivePetalStroke = isDark
      ? "rgba(255,255,255,0.18)"
      : "rgba(120,113,108,0.16)";

    let currentAngle = 0;

  return (
  <div
    className={`min-h-screen w-full transition-[background] duration-500 ${
      isDark ? "text-stone-100" : "text-stone-800"
    }`}
    style={{ background: activeWheelTheme.pageBackground }}
  >
    <section className="mx-auto max-w-4xl px-4 py-8 text-center">
      <div className="mb-7">
        <p className="text-xs lowercase tracking-[0.4em] text-stone-400">
          awake
        </p>

        <p
          className={`mt-3 text-sm font-light tracking-[0.18em] ${
            isDark ? "text-slate-300" : "text-stone-500"
          }`}
        >
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

          <p
            className={`mt-2 text-sm leading-6 ${
              isDark ? "text-slate-200" : "text-stone-600"
            }`}
          >
            {directions.slice(0, 3).join(" · ")}
            {directions.length > 3 && ` +${directions.length - 3}`}
          </p>
        </Link>
      )}
      <div
        className={`relative mx-auto mb-5 w-full max-w-sm rounded-full border p-1 transition-colors ${
          isDark
            ? "border-white/10 bg-slate-900/60"
            : "border-stone-200 bg-white/80"
        }`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute bottom-1 left-1 top-1 w-[calc(50%-0.25rem)] rounded-full transition-all duration-400 ease-out ${
            wheelView === "compass"
              ? "translate-x-full awake-compass-glow"
              : "translate-x-0 shadow-sm"
          }`}
          style={{
            backgroundColor:
              wheelView === "compass"
                ? `rgba(${activeWheelTheme.investment}, 0.82)`
                : `rgba(${activeWheelTheme.pattern}, 0.82)`,

            boxShadow:
              wheelView === "compass"
                ? `0 0 0 1px rgba(${activeWheelTheme.investment}, 0.55),
                  0 0 10px rgba(${activeWheelTheme.investment}, 0.42),
                  0 0 22px rgba(${activeWheelTheme.investment}, 0.22)`
                : `0 0 0 1px rgba(${activeWheelTheme.pattern}, 0.28)`,
          }}
        />

        <div className="relative z-10 grid grid-cols-2">
          <span
            className={`pointer-events-none px-4 py-2.5 text-center text-sm transition-colors ${
              wheelView === "awareness"
              ? isDark
                ? "text-white"
                : "text-stone-900"
                : isDark
                  ? "text-slate-400"
                  : "text-stone-400"
            }`}
          >
            Awareness
          </span>

          <span
            className={`pointer-events-none px-4 py-2.5 text-center text-sm transition-colors ${
              wheelView === "compass"
                ? isDark
                  ? "text-white"
                  : "text-stone-900"
                : isDark
                  ? "text-slate-400"
                  : "text-stone-400"
            }`}
          >
            Compass
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="1"
          step="1"
          value={wheelView === "awareness" ? 0 : 1}
          onChange={(event) => {
            changeWheelView(
              event.target.value === "0"
                ? "awareness"
                : "compass"
            );
          }}
          aria-label="Slide between Awareness and Compass"
          className="absolute inset-0 z-20 h-full w-full cursor-grab opacity-0 active:cursor-grabbing"
        />
      </div>

      <nav
        aria-label="Awake sections"
        className="mx-auto mb-5 max-w-md"
      >
        <div
          className={`overflow-hidden rounded-3xl border transition-colors duration-300 ${
            isDark
              ? "border-white/10 bg-slate-800/70"
              : "border-stone-200 bg-white/80"
          }`}
        >
          <button
            type="button"
            onClick={() => setShowAwakeMenu((current) => !current)}
            aria-expanded={showAwakeMenu}
            aria-controls="awake-home-menu"
            className={`awake-menu-pulse mx-auto flex items-center gap-2 rounded-full border px-4 py-2 text-xs transition ${
              isDark
                ? "border-white/15 bg-slate-800/80 text-slate-300 hover:border-white/25 hover:text-white"
                : "border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:text-stone-700"
            }`}
          >
            <span>
              {wheelView === "awareness"
                ? "Shape Your Awareness"
                : "Shape Your Compass"}
            </span>

            <span
              aria-hidden="true"
              className={`transition-transform duration-300 ${
                isDark ? "text-slate-400" : "text-stone-300"
              } ${showAwakeMenu ? "rotate-180" : ""}`}
            >
              ↓
            </span>
          </button>

          <div
            id="awake-home-menu"
            className={`grid transition-[grid-template-rows,opacity] duration-300 ${
              showAwakeMenu
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div
                className={`border-t px-5 pb-5 pt-4 ${
                  isDark ? "border-white/10" : "border-stone-100"
                }`}
              >
                <button
                  type="button"
                  onClick={() =>
                    setShowAppearanceSection((current) => !current)
                  }
                  aria-expanded={showAppearanceSection}
                  className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition ${
                    isDark
                      ? "text-slate-300 hover:bg-white/5"
                      : "text-stone-500 hover:bg-stone-50"
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-[0.2em]">
                    Wheel appearance
                  </span>

                  <span
                    aria-hidden="true"
                    className={`transition-transform duration-300 ${
                      showAppearanceSection ? "rotate-180" : ""
                    }`}
                  >
                    ↓
                  </span>
                </button>

                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ${
                    showAppearanceSection
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="mt-3 grid grid-cols-2 gap-2 min-[420px]:grid-cols-3">
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
                        className={`group min-w-[118px] rounded-2xl border p-2 text-left transition duration-200 ${
                          isDark
                            ? isActive
                              ? "border-white/50 bg-slate-800 shadow-sm ring-1 ring-white/20"
                              : "border-white/10 bg-slate-900/70 hover:-translate-y-0.5 hover:border-white/25"
                            : isActive
                              ? "border-stone-500 bg-white shadow-sm ring-1 ring-stone-300"
                              : "border-stone-200 bg-white hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-sm"
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

                        <span
                          className={`mt-2 block text-center text-[11px] ${
                            isDark ? "text-slate-300" : "text-stone-500"
                          }`}
                        >
                          {theme.name}
                        </span>
                      </button>
                       );
                    })}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`my-5 border-t ${
                      isDark ? "border-white/10" : "border-stone-100"
                    }`}
                  />

                <p
                  className={`text-[10px] uppercase tracking-[0.2em] ${
                    isDark ? "text-slate-400" : "text-stone-400"
                  }`}
                >
                  Shape your wheel
                </p>
                {/*<p
                  className={`text-[10px] uppercase tracking-[0.2em] ${
                    isDark ? "text-slate-400" : "text-stone-400"
                  }`}
                >
                  Wheel view
                </p>

                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {filters.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setFilter(item)}
                      className={`rounded-full border px-3 py-1.5 text-xs transition ${
                        filter === item
                          ? isDark
                            ? "border-slate-500 bg-slate-600 text-white"
                            : "border-stone-800 bg-stone-800 text-white"
                          : isDark
                            ? "border-white/10 bg-slate-900/50 text-slate-300"
                            : "border-stone-200 bg-white text-stone-500"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>*/}

                <div className="mt-5 space-y-1">
                  <AwakeMenuLink
                    href="/direction"
                    symbol="✦"
                    title={
                      wheelView === "awareness"
                        ? "Direction, Patterns & Investments"
                        : "Values & Boundaries"
                    }
                    isDark={isDark}
                  />

                  <AwakeMenuLink
                    href="/reflection"
                    symbol="✍︎"
                    title="Reflection"
                    isDark={isDark}
                  />

                  <AwakeMenuLink
                    href="/reflections"
                    symbol="◌"
                    title="Journey"
                    isDark={isDark}
                  />

                  <AwakeMenuLink
                    href="/insights"
                    symbol="⌁"
                    title="Insights"
                    isDark={isDark}
                  />

                  <AwakeMenuLink
                    href="/about"
                    symbol="♡"
                    title="About Awake"
                    isDark={isDark}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
       {/*

            <div className="mb-5">
              <button
                type="button"
                onClick={() => setShowWheelAppearance((current) => !current)}
                aria-expanded={showWheelAppearance}
                className={`mx-auto flex items-center gap-2 rounded-full border px-4 py-2 text-xs transition ${
                  isDark
                    ? "border-white/15 bg-slate-800/80 text-slate-300 hover:border-white/25 hover:text-white"
                    : "border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:text-stone-700"
                }`}
              >
                <span>Atmosphere</span>

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
                        className={`group min-w-[118px] rounded-2xl border p-2 text-left transition duration-200 ${
                          isDark
                            ? isActive
                              ? "border-white/50 bg-slate-800 shadow-sm ring-1 ring-white/20"
                              : "border-white/10 bg-slate-900/70 hover:-translate-y-0.5 hover:border-white/25"
                            : isActive
                              ? "border-stone-500 bg-white shadow-sm ring-1 ring-stone-300"
                              : "border-stone-200 bg-white hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-sm"
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

                        <span
                          className={`mt-2 block text-center text-[11px] ${
                            isDark ? "text-slate-300" : "text-stone-500"
                          }`}
                        >
                          {theme.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div> */}
            <LivingWheelCard
              state={livingCard}
              isDark={isDark}
              isExpanded={isLivingCardExpanded}
              isInteractionLocked={isLongPressHolding}
              onExpand={expandLivingCard}
              onClose={closeLivingCard}
              onNoticeAgain={noticeAgainFromCard}
              onUndoLastNotice={undoLastNoticeFromCard}
              onRename={renameSliceFromCard}
              onRemove={removeSliceFromCard}
            />

            <div
              className={`relative mx-auto mb-8 aspect-square w-full max-w-[340px] rounded-full p-4 shadow-inner transition-opacity duration-300 sm:mb-10 sm:max-w-[430px] md:max-w-[500px] lg:max-w-[520px] ${
                isLivingCardExpanded ? "opacity-80" : "opacity-100"
              }`}
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
          className="relative h-full w-full cursor-grab select-none active:cursor-grabbing"
          style={{
            touchAction: "none",
            userSelect: "none",
            WebkitUserSelect: "none",
            WebkitTouchCallout: "none",
            MozUserSelect: "none",
          }}
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
            const isPreview =
              livingCard?.mode === "preview" &&
              livingCard.name === item.name &&
              livingCard.type === item.type;

            const fill =
              item.type === "pattern" || item.type === "boundary"
                ? activeWheelTheme.patternFill
                : activeWheelTheme.investmentFill;

            return (
              <g
                key={`${item.type}-${item.name}`}
                onPointerDown={() => {
                  clearLongPressTimer();

                  longPressTriggeredRef.current = false;
                  suppressClickRef.current = false;

                  startSliceLongPress(item.name, item.type);
                }}
                onPointerUp={() => {
                  clearLongPressTimer();
                  pressedSliceRef.current = null;
                }}
                onPointerCancel={() => {
                  clearLongPressTimer();
                  pressedSliceRef.current = null;
                  longPressTriggeredRef.current = false;
                  suppressClickRef.current = false;
                }}
                
                onClick={() => {
                  if (
                    isManagingSliceRef.current ||
                    longPressTriggeredRef.current
                  ) {
                    longPressTriggeredRef.current = false;
                    suppressClickRef.current = false;
                    return;
                  }

                  handleSliceTap(item.name, item.type, showLabel);
                }}
                className="cursor-pointer transition hover:opacity-80"
              >
                <path
                  d={path}
                  fill={fill}
                  stroke={
                    isPreview
                      ? "rgba(255,255,255,0.96)"
                      : isPending
                        ? "rgba(120, 113, 108, 0.9)"
                        : "rgba(255,255,255,0.8)"
                  }
                  strokeWidth={isPreview ? "1.6" : isPending ? "1.5" : "0.8"}
                  opacity={
                    isPreview || isPending
                      ? 1
                      : item.count > 0
                        ? 0.98
                        : isDark
                          ? 0.38
                          : 0.5
                  }
                  className={isPreview ? "awake-slice-preview" : undefined}
                />

                {(showLabel || isPreview) && (
                  <text
                    x={label.x}
                    y={label.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${-wheelRotation} ${label.x} ${label.y})`}
                    className={`pointer-events-none select-none text-[3px] ${
                      isDark ? "fill-stone-100" : "fill-stone-700"
                    } ${isPreview ? "awake-preview-label" : ""}`}
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
            y="45"
            textAnchor="middle"
            className="pointer-events-none select-none text-[3.5px] font-semibold tracking-[0.08em] transition-[fill] duration-300"
            style={{ fill: perspectiveAccent }}
          >
            {centerFilterLabel}
          </text>

          <g
            role="button"
            tabIndex={0}
            aria-label="Change wheel perspective"
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onClick={(event) => {
              event.stopPropagation();
              setShowCenterMenu((current) => !current);
              triggerHaptic("light");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setShowCenterMenu((current) => !current);
                triggerHaptic("light");
              }
            }}
            className="group cursor-pointer"
          >
            <title>Change perspective</title>

            <circle
              cx="50"
              cy="51"
              r="5"
              fill="transparent"
            />

            <text
              x="50"
              y="51"
              textAnchor="middle"
              dominantBaseline="middle"
              className={`awake-perspective-toggle select-none text-[5px] font-semibold transition-[fill] duration-300 ${
                showCenterMenu ? "awake-perspective-toggle-open" : ""
              }`}
              style={{ fill: perspectiveAccent }}
            >
              +
            </text>
          </g>
          <g
            className={`awake-perspective-bloom ${
              showCenterMenu
                ? "awake-perspective-bloom-open"
                : "pointer-events-none"
            }`}
          >
            
            <PerspectiveOption
              x={50}
              y={28}
              label="TODAY"
              active={filter === "Today"}
              accentColor={perspectiveAccent}
              inactiveColor={perspectiveInactive}
              petalFill={perspectivePetalFill}
              petalStroke={perspectivePetalStroke}
              isDark={isDark}
              onClick={() => selectPerspective("Today")}
            />

            <PerspectiveOption
              x={26}
              y={50}
              label="7 DAYS"
              active={filter === "7 Days"}
              accentColor={perspectiveAccent}
              inactiveColor={perspectiveInactive}
              petalFill={perspectivePetalFill}
              petalStroke={perspectivePetalStroke}
              isDark={isDark}
              onClick={() => selectPerspective("7 Days")}
            />

            <PerspectiveOption
              x={74}
              y={50}
              label="MONTH"
              active={filter === "Month"}
              accentColor={perspectiveAccent}
              inactiveColor={perspectiveInactive}
              petalFill={perspectivePetalFill}
              petalStroke={perspectivePetalStroke}
              isDark={isDark}
              onClick={() => selectPerspective("Month")}
            />

            <PerspectiveOption
              x={50}
              y={74}
              label="ALL"
              active={filter === "All"}
              accentColor={perspectiveAccent}
              inactiveColor={perspectiveInactive}
              petalFill={perspectivePetalFill}
              petalStroke={perspectivePetalStroke}
              isDark={isDark}
              onClick={() => selectPerspective("All")}
            />
          </g>
          
          <text
            x="50"
            y="58"
            textAnchor="middle"
            className="pointer-events-none select-none fill-stone-600 text-[3.5px] font-light"
          >
            {centerSubtitle}
          </text>
        </svg>
      </div>

      {message && (
        <p className="sr-only" aria-live="polite">
          {message}
        </p>
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
          @keyframes awake-living-card-enter {
            0% {
              opacity: 0;
              transform: translateY(8px) scale(0.96);
            }

            70% {
              opacity: 1;
              transform: translateY(0) scale(1.01);
            }

            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          .awake-living-card {
            animation: awake-living-card-enter 280ms
              cubic-bezier(0.22, 1, 0.36, 1);
            transform-origin: center bottom;
          }
            @keyframes awake-slice-preview-pulse {
              0% {
                filter: drop-shadow(0 0 0 rgba(255, 255, 255, 0));
              }

              45% {
                filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.75));
              }

              100% {
                filter: drop-shadow(0 0 1px rgba(255, 255, 255, 0.12));
              }
            }

            @keyframes awake-preview-label-in {
              0% {
                opacity: 0;
              }

              100% {
                opacity: 1;
              }
            }

            .awake-slice-preview {
              animation: awake-slice-preview-pulse 900ms ease-out;
            }

            .awake-preview-label {
              animation: awake-preview-label-in 240ms ease-out;
            }
              .awake-perspective-bloom {
                opacity: 0;
                transform: scale(0.72);
                transform-box: view-box;
                transform-origin: 50px 50px;
                transition:
                  opacity 240ms ease,
                  transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
              }

              .awake-perspective-bloom-open {
                opacity: 1;
                transform: scale(1);
              }

              .awake-perspective-toggle {
                transform-box: fill-box;
                transform-origin: center;
                transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
              }

              .awake-perspective-toggle-open {
                transform: rotate(45deg);
              }

              .awake-perspective-active {
                filter: drop-shadow(0 0 1.5px currentColor);
              }
                @keyframes awake-menu-pulse {
                  0%,
                  100% {
                    box-shadow: 0 0 0 0 rgba(148, 163, 184, 0.08);
                  }

                  50% {
                    box-shadow: 0 0 0 6px rgba(148, 163, 184, 0.12);
                  }
                }

                .awake-menu-pulse {
                  animation: awake-menu-pulse 4.8s ease-in-out infinite;
                }
                  @keyframes awake-compass-glow {
                    0%,
                    100% {
                      filter: brightness(1);
                    }

                    50% {
                      filter: brightness(1.12);
                    }
                  }

                  .awake-compass-glow {
                    animation: awake-compass-glow 4.8s ease-in-out infinite;
                  }

        @media (prefers-reduced-motion: reduce) {
          .awake-breathe-halo,
          .awake-living-card,
          .awake-slice-preview,
          .awake-preview-label,
          .awake-menu-pulse,
          .awake-compass-glow {
            animation: none;
          }
 

          .awake-perspective-bloom,
          .awake-perspective-toggle {
            transition: none;
          }
        }
      `}</style>
    </section>
    </div>
  );
}

type AwakeMenuLinkProps = {
  href: string;
  symbol: string;
  title: string;
  isDark: boolean;
};

function AwakeMenuLink({
  href,
  symbol,
  title,
  isDark,
}: AwakeMenuLinkProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-2xl px-3 py-3 transition ${
        isDark
          ? "text-slate-300 hover:bg-white/5 hover:text-stone-100"
          : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"
      }`}
    >
      <span
        aria-hidden="true"
        className={isDark ? "text-slate-500" : "text-stone-300"}
      >
        {symbol}
      </span>

      <span className="min-w-0 flex-1 text-sm">
        {title}
      </span>

      <span
        aria-hidden="true"
        className={isDark ? "text-slate-600" : "text-stone-300"}
      >
        →
      </span>
    </Link>
  );
}

type PerspectiveOptionProps = {
  x: number;
  y: number;
  label: string;
  active: boolean;
  accentColor: string;
  inactiveColor: string;
  petalFill: string;
  petalStroke: string;
  isDark: boolean; 
  onClick: () => void;
};

function PerspectiveOption({
  x,
  y,
  label,
  active,
  accentColor,
  inactiveColor,
  petalFill,
  petalStroke,
  isDark,
  onClick,
}: PerspectiveOptionProps) {
  return (
    <g className="cursor-pointer">
      <circle
        cx={x}
        cy={y}
        r="8"
        fill={active ? accentColor : petalFill}
        fillOpacity={active ? 0.14 : 1}
        stroke={active ? accentColor : petalStroke}
        strokeWidth={active ? 0.7 : 0.45}
        onClick={onClick}
        className="transition-[fill,stroke,fill-opacity] duration-300"
      />

      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        className="pointer-events-none select-none text-[2.8px] font-medium transition-[fill,filter] duration-300"
        style={{
          fill: active
            ? isDark
              ? "rgba(30,41,59,0.98)"
              : accentColor
            : inactiveColor,
          filter: active
            ? `drop-shadow(0 0 1.4px ${accentColor})`
            : "none",
        }}
      >
        {label}
      </text>
    </g>
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