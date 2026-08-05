"use client";

import { useEffect, useRef } from "react";
import type {
  CSSProperties,
  KeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import {
  generateSystemOrbPalette,
  getFoundationHue,
  type AwakeColorPreferences,
} from "../../colorPalette";
import type { CircleFoundationMapping } from "../../music/circleOfFifths";
import RotatingOrbRing from "../navigation/RotatingOrbRing";

type Props = {
  items: CircleFoundationMapping[];
  selectedId: string;
  preferences: AwakeColorPreferences;
  onSelectedChange: (id: string) => void;
  onOpenCompanion: () => void;
  onCenterLongPress: () => void;
};

const CENTER_MOVE_THRESHOLD_PX = 7;
const CENTER_LONG_PRESS_MS = 650;

function musicalGlyphs(key: string) {
  return key.replaceAll("#", "♯").replaceAll("b", "♭");
}

function minorName(key: string) {
  return musicalGlyphs(key.split(" / ")[0].replace(/m$/, ""));
}

function KeySignatureRings({
  count,
  direction,
}: {
  count: number;
  direction: CircleFoundationMapping["direction"];
}) {
  if (direction === "core" || count === 0) return null;

  return (
    <span
      className={`awake-key-signature-rings is-${direction}`}
      style={
        {
          "--signature-ring-opacity": (0.16 + count * 0.045).toFixed(3),
        } as CSSProperties
      }
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <i
          key={index}
          style={
            {
              "--signature-ring-inset":
                direction === "sharp"
                  ? `${7 + index * 5}%`
                  : `${-4 - index * 4}%`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}

export default function AwakeCircleOfFifths({
  items,
  selectedId,
  preferences,
  onSelectedChange,
  onOpenCompanion,
  onCenterLongPress,
}: Props) {
  const holdTimer = useRef<number | null>(null);
  const centerPointer = useRef<{
    id: number;
    startX: number;
    startY: number;
    moved: boolean;
    held: boolean;
  } | null>(null);
  const selected = items.find((item) => item.id === selectedId) ?? items[0];

  useEffect(
    () => () => {
      if (holdTimer.current !== null) {
        window.clearTimeout(holdTimer.current);
      }
    },
    [],
  );

  function clearCenterHold() {
    if (holdTimer.current !== null) {
      window.clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }

  function beginCenterPress(event: ReactPointerEvent<HTMLButtonElement>) {
    event.stopPropagation();
    centerPointer.current = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
      held: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    clearCenterHold();
    holdTimer.current = window.setTimeout(() => {
      if (!centerPointer.current || centerPointer.current.moved) return;
      centerPointer.current.held = true;
      onCenterLongPress();
      if ("vibrate" in navigator) navigator.vibrate(22);
      holdTimer.current = null;
    }, CENTER_LONG_PRESS_MS);
  }

  function moveCenterPress(event: ReactPointerEvent<HTMLButtonElement>) {
    event.stopPropagation();
    const active = centerPointer.current;
    if (!active || active.id !== event.pointerId) return;
    const distance = Math.hypot(
      event.clientX - active.startX,
      event.clientY - active.startY,
    );
    if (distance > CENTER_MOVE_THRESHOLD_PX) {
      active.moved = true;
      clearCenterHold();
    }
  }

  function finishCenterPress(event: ReactPointerEvent<HTMLButtonElement>) {
    event.stopPropagation();
    const active = centerPointer.current;
    clearCenterHold();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    centerPointer.current = null;
    if (active && !active.moved && !active.held) onOpenCompanion();
  }

  function cancelCenterPress(event: ReactPointerEvent<HTMLButtonElement>) {
    event.stopPropagation();
    clearCenterHold();
    centerPointer.current = null;
  }

  function handleCenterKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    event.stopPropagation();
    onOpenCompanion();
  }

  if (!selected) return null;

  return (
    <>
      <RotatingOrbRing
      items={items}
      selectedId={selected.id}
      onSelectedChange={onSelectedChange}
      ariaLabel="Awake Circle of Fifths"
      className="home-foundation-ring awake-circle-of-fifths"
      depthRange={{ back: 0.82, front: 1 }}
      opacityRange={{ back: 0.82, front: 1 }}
      showHint={false}
      centerInteractive
      itemsInteractive={false}
      centerContent={
        <button
          type="button"
          className="awake-circle-focus"
          aria-label="Open learning companion"
          onPointerDown={beginCenterPress}
          onPointerMove={moveCenterPress}
          onPointerUp={finishCenterPress}
          onPointerCancel={cancelCenterPress}
          onKeyDown={handleCenterKeyDown}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          <strong className="awake-circle-focus-key">
            {musicalGlyphs(selected.displayKey)}
          </strong>
          <small>{selected.awakeFoundationName}</small>
        </button>
      }
      renderItem={(item, { centered, index, angle }) => {
        const hue = getFoundationHue(
          item.foundation.title,
          preferences.anchorHue,
        );
        const orb = generateSystemOrbPalette(
          hue,
          preferences.harmony,
          preferences.appearance,
        );

        return (
          <>
            <span
              className={`foundation-waypoint-orb navigation-foundation-orb awake-circle-major-orb is-${item.direction} relative rounded-full`}
              style={
                {
                  "--nav-main": orb.main,
                  "--nav-highlight": orb.highlight,
                  "--nav-glow": orb.glow,
                  "--nav-quiet": orb.quiet,
                  "--orb-delay": `${-(index % 9) * 0.55}s`,
                } as CSSProperties
              }
            >
              <KeySignatureRings
                count={item.accidentalCount}
                direction={item.direction}
              />
              <span className="awake-circle-key" aria-hidden="true">
                {musicalGlyphs(item.displayKey)}
              </span>
              <span
                className={`awake-relative-minor-companion ${
                  centered ? "is-active" : ""
                }`}
                style={
                  {
                    "--minor-angle": `${angle}deg`,
                  } as CSSProperties
                }
                data-major-key={item.majorKey}
                data-relative-minor={item.relativeMinor}
                aria-hidden="true"
              >
                {minorName(item.relativeMinor)}
              </span>
              {centered && item.direction !== "core" && (
                <span
                  className={`awake-key-signature-progress is-${item.direction}`}
                  aria-hidden="true"
                >
                  {Array.from(
                    { length: item.accidentalCount },
                    (_, progressIndex) => (
                      <i
                        key={progressIndex}
                        style={
                          {
                            "--signature-progress-index": progressIndex,
                          } as CSSProperties
                        }
                      />
                    ),
                  )}
                </span>
              )}
            </span>
            {centered && item.direction !== "core" && (
              <span className="ring-orb-detail awake-supporting">
                {item.accidentalCount}
                {item.direction === "sharp" ? "♯" : "♭"}
              </span>
            )}
          </>
        );
      }}
      />
      <p className="awake-circle-relationship" aria-live="polite">
        <strong>{musicalGlyphs(selected.displayKey)} major</strong>
        <span aria-hidden="true">•</span>
        <span>{minorName(selected.relativeMinor)} minor</span>
        <span aria-hidden="true">•</span>
        <span>companion</span>
      </p>
    </>
  );
}
