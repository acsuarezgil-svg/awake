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
  onActivate?: (item: T) => void;
  renderItem: (
    item: T,
    state: { centered: boolean; index: number; angle: number },
  ) => ReactNode;
  getAriaLabel?: (item: T, centered: boolean) => string;
  ariaLabel: string;
  className?: string;
  activateOnlyWhenCentered?: boolean;
  onLongPress?: (item: T) => void;
  centerContent?: ReactNode;
  centerInteractive?: boolean;
  itemsInteractive?: boolean;
  depthRange?: { back: number; front: number };
  opacityRange?: { back: number; front: number };
  showHint?: boolean;
};

const DRAG_DEGREES_PER_PIXEL = 0.28;
const DRAG_THRESHOLD_PX = 7;
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
  centerInteractive = false,
  itemsInteractive = true,
  depthRange = { back: 0.72, front: 0.88 },
  opacityRange,
  showHint = true,
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
    const now = performance.now();
    pointer.current = {
      startX: event.clientX,
      lastX: event.clientX,
      lastTime: now,
      velocity: 0,
    };
    didDrag.current = false;
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

    if (!didDrag.current && Math.abs(totalX) > DRAG_THRESHOLD_PX) {
      didDrag.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
      clearLongPress();
    }
    if (!didDrag.current) return;

    const nextDegrees = totalX * DRAG_DEGREES_PER_PIXEL;
    dragDegreesRef.current = nextDegrees;
    setDragDegrees(nextDegrees);
  }

  function finishDrag(event: ReactPointerEvent<HTMLElement>) {
    if (!pointer.current) return;
    const wasDrag = didDrag.current;
    const projectedDegrees =
      dragDegreesRef.current + pointer.current.velocity * 135;
    const steps = Math.max(
      -MAX_INERTIA_STEPS,
      Math.min(
        MAX_INERTIA_STEPS,
        Math.round(-projectedDegrees / stepAngle),
      ),
    );
    if (wasDrag && steps !== 0 && items.length > 1) {
      onSelectedChange(
        items[wrapIndex(selectedIndex + steps, items.length)].id,
      );
    }
    if (wasDrag) suppressClick.current = true;
    didDrag.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    pointer.current = null;
    dragDegreesRef.current = 0;
    setDragDegrees(0);
    setDragging(false);
    clearLongPress();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.target !== event.currentTarget) return;
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
        onActivate?.(selected);
      }
    }
  }

  return (
    <section
      className={`rotating-orb-ring ${dragging ? "is-dragging" : ""} ${className}`}
      aria-label={ariaLabel}
      tabIndex={itemsInteractive ? 0 : -1}
      onKeyDown={itemsInteractive ? handleKeyDown : undefined}
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
        const orbitDepth = (Math.sin(radians) + 1) / 2;
        const depth = centered
          ? 1
          : depthRange.back +
            orbitDepth * (depthRange.front - depthRange.back);
        const opacity = centered
          ? 1
          : opacityRange
            ? opacityRange.back +
              orbitDepth * (opacityRange.front - opacityRange.back)
            : 0.68 + depth * 0.2;

        const itemClassName = `rotating-orb-item ${
          centered ? "is-centered" : ""
        }`;
        const itemStyle = {
          "--ring-x": `${x}%`,
          "--ring-y": `${y}%`,
          "--ring-scale": centered
            ? fixedCenter
              ? 1.05
              : 1.18
            : depth,
          "--ring-opacity": opacity,
          "--ring-depth": orbitDepth,
          "--ring-brightness": 0.78 + orbitDepth * 0.22,
          "--ring-z": centered
            ? 20
            : Math.round(4 + orbitDepth * 5),
        } as CSSProperties;
        const content = renderItem(item, { centered, index, angle });

        if (!itemsInteractive) {
          return (
            <div
              key={item.id}
              data-rotating-orb
              className={itemClassName}
              style={itemStyle}
              aria-hidden="true"
            >
              {content}
            </div>
          );
        }

        return (
          <button
            key={item.id}
            type="button"
            data-rotating-orb
            className={itemClassName}
            style={itemStyle}
            aria-label={getAriaLabel?.(item, centered)}
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
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              event.stopPropagation();
              if (!centered) {
                onSelectedChange(item.id);
                if (!activateOnlyWhenCentered) onActivate?.(item);
              } else {
                onActivate?.(item);
              }
            }}
            onClick={(event) => {
              event.stopPropagation();
              if (suppressClick.current || didDrag.current) {
                suppressClick.current = false;
                didDrag.current = false;
                return;
              }
              if (!centered) {
                onSelectedChange(item.id);
                if (!activateOnlyWhenCentered) onActivate?.(item);
              } else {
                onActivate?.(item);
              }
            }}
          >
            {content}
          </button>
        );
      })}
      {centerContent && (
        <div
          className={`rotating-orb-fixed-center ${
            centerInteractive ? "is-interactive" : ""
          }`}
        >
          {centerContent}
        </div>
      )}
      {showHint && (
        <p className="rotating-orb-hint">
          Drag to turn · Use arrow keys to explore
        </p>
      )}
    </section>
  );
}
