"use client";

import { useEffect, useRef, useState } from "react";
import type {
  CSSProperties,
  KeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from "react";

type RingItem = { id: string };

type Props<T extends RingItem> = {
  items: T[];
  selectedId: string | null;
  onSelectedChange: (id: string) => void;
  onActivate: (item: T) => void;
  renderItem: (
    item: T,
    state: { centered: boolean; index: number },
  ) => ReactNode;
  getAriaLabel: (item: T, centered: boolean) => string;
  ariaLabel: string;
  className?: string;
  activateOnlyWhenCentered?: boolean;
  onLongPress?: (item: T) => void;
  centerContent?: ReactNode;
};

const DRAG_DEGREES_PER_PIXEL = 0.28;
const MAX_INERTIA_STEPS = 3;

function wrapIndex(index: number, length: number) {
  return (index + length) % length;
}

export default function RotatingOrbRing<T extends RingItem>({
  items,
  selectedId,
  onSelectedChange,
  onActivate,
  renderItem,
  getAriaLabel,
  ariaLabel,
  className = "",
  activateOnlyWhenCentered = true,
  onLongPress,
  centerContent,
}: Props<T>) {
  const [dragDegrees, setDragDegrees] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragDegreesRef = useRef(0);
  const didDrag = useRef(false);
  const suppressClick = useRef(false);
  const longPressTimer = useRef<number | null>(null);
  const pointer = useRef<{
    startX: number;
    lastX: number;
    lastTime: number;
    velocity: number;
  } | null>(null);

  const selectedIndex = Math.max(
    0,
    items.findIndex((item) => item.id === selectedId),
  );
  const stepAngle = items.length > 0 ? 360 / items.length : 360;

  useEffect(() => {
    if (items.length && !items.some((item) => item.id === selectedId)) {
      onSelectedChange(items[0].id);
    }
  }, [items, onSelectedChange, selectedId]);

  useEffect(
    () => () => {
      if (longPressTimer.current !== null) {
        window.clearTimeout(longPressTimer.current);
      }
    },
    [],
  );

  function clearLongPress() {
    if (longPressTimer.current !== null) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  function move(direction: -1 | 1) {
    if (items.length < 2) return;
    onSelectedChange(
      items[wrapIndex(selectedIndex + direction, items.length)].id,
    );
  }

  function beginDrag(event: ReactPointerEvent<HTMLElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    const now = performance.now();
    pointer.current = {
      startX: event.clientX,
      lastX: event.clientX,
      lastTime: now,
      velocity: 0,
    };
    didDrag.current = false;
    setDragging(true);
  }

  function updateDrag(event: ReactPointerEvent<HTMLElement>) {
    if (!pointer.current) return;
    const now = performance.now();
    const totalX = event.clientX - pointer.current.startX;
    const elapsed = Math.max(1, now - pointer.current.lastTime);
    pointer.current.velocity =
      (event.clientX - pointer.current.lastX) / elapsed;
    pointer.current.lastX = event.clientX;
    pointer.current.lastTime = now;

    if (Math.abs(totalX) > 7) {
      didDrag.current = true;
      clearLongPress();
    }
    const nextDegrees = totalX * DRAG_DEGREES_PER_PIXEL;
    dragDegreesRef.current = nextDegrees;
    setDragDegrees(nextDegrees);
  }

  function finishDrag() {
    if (!pointer.current) return;
    const projectedDegrees =
      dragDegreesRef.current + pointer.current.velocity * 135;
    const steps = Math.max(
      -MAX_INERTIA_STEPS,
      Math.min(
        MAX_INERTIA_STEPS,
        Math.round(-projectedDegrees / stepAngle),
      ),
    );
    if (didDrag.current && steps !== 0 && items.length > 1) {
      onSelectedChange(
        items[wrapIndex(selectedIndex + steps, items.length)].id,
      );
      suppressClick.current = true;
    }
    pointer.current = null;
    dragDegreesRef.current = 0;
    setDragDegrees(0);
    setDragging(false);
    clearLongPress();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    } else if (event.key === "Enter" || event.key === " ") {
      const selected = items[selectedIndex];
      if (selected) {
        event.preventDefault();
        onActivate(selected);
      }
    }
  }

  return (
    <section
      className={`rotating-orb-ring ${dragging ? "is-dragging" : ""} ${className}`}
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPointerDown={beginDrag}
      onPointerMove={updateDrag}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
    >
      <div className="rotating-orb-track" aria-hidden="true" />
      {items.map((item, index) => {
        const centered = index === selectedIndex;
        const relativeIndex = wrapIndex(
          index - selectedIndex,
          items.length,
        );
        const angle =
          -90 + relativeIndex * stepAngle + dragDegrees;
        const radians = (angle * Math.PI) / 180;
        const fixedCenter = Boolean(centerContent);
        const x =
          centered && !fixedCenter ? 50 : 50 + Math.cos(radians) * 42;
        const y =
          centered && !fixedCenter ? 50 : 50 + Math.sin(radians) * 38;
        const depth = centered
          ? 1
          : 0.72 + ((Math.sin(radians) + 1) / 2) * 0.16;

        return (
          <button
            key={item.id}
            type="button"
            data-rotating-orb
            className={`rotating-orb-item ${
              centered ? "is-centered" : ""
            }`}
            style={
              {
                "--ring-x": `${x}%`,
                "--ring-y": `${y}%`,
                "--ring-scale": centered
                  ? fixedCenter
                    ? 1.05
                    : 1.18
                  : depth,
                "--ring-opacity": centered ? 1 : 0.68 + depth * 0.2,
                "--ring-z": centered
                  ? 20
                  : Math.round(4 + ((Math.sin(radians) + 1) / 2) * 5),
              } as CSSProperties
            }
            aria-label={getAriaLabel(item, centered)}
            aria-current={centered ? "true" : undefined}
            onPointerDown={() => {
              suppressClick.current = false;
              if (centered && onLongPress) {
                longPressTimer.current = window.setTimeout(() => {
                  suppressClick.current = true;
                  onLongPress(item);
                  if ("vibrate" in navigator) navigator.vibrate(22);
                }, 650);
              }
            }}
            onPointerUp={clearLongPress}
            onPointerCancel={clearLongPress}
            onClick={(event) => {
              event.stopPropagation();
              if (suppressClick.current || didDrag.current) {
                suppressClick.current = false;
                didDrag.current = false;
                return;
              }
              if (!centered) {
                onSelectedChange(item.id);
                if (!activateOnlyWhenCentered) onActivate(item);
              } else {
                onActivate(item);
              }
            }}
          >
            {renderItem(item, { centered, index })}
          </button>
        );
      })}
      {centerContent && (
        <div className="rotating-orb-fixed-center">{centerContent}</div>
      )}
      <p className="rotating-orb-hint">
        Drag to turn · Use arrow keys to explore
      </p>
    </section>
  );
}
