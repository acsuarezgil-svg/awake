"use client";

import { useEffect, useRef } from "react";
import type {
  KeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from "react";

export function circularOrbOffset(
  index: number,
  selected: number,
  length: number,
) {
  let offset = index - selected;
  if (offset > length / 2) offset -= length;
  if (offset < -length / 2) offset += length;
  return offset;
}

export function useOrbCarouselController<T extends { id: string }>(
  items: T[],
  selectedId: string | null,
  onSelectedChange: (id: string) => void,
) {
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const didSwipe = useRef(false);
  const selectedIndex = Math.max(
    0,
    items.findIndex((item) => item.id === selectedId),
  );

  function move(direction: -1 | 1) {
    if (items.length < 2) return;
    const next =
      (selectedIndex + direction + items.length) % items.length;
    onSelectedChange(items[next].id);
  }

  function onPointerDown(event: ReactPointerEvent<HTMLElement>) {
    didSwipe.current = false;
    swipeStart.current = { x: event.clientX, y: event.clientY };
  }

  function onPointerUp(event: ReactPointerEvent<HTMLElement>) {
    if (!swipeStart.current) return;
    const x = event.clientX - swipeStart.current.x;
    const y = event.clientY - swipeStart.current.y;
    swipeStart.current = null;
    if (Math.abs(x) < 42 || Math.abs(x) < Math.abs(y)) return;
    didSwipe.current = true;
    move(x < 0 ? 1 : -1);
  }

  function onPointerCancel() {
    swipeStart.current = null;
  }

  return {
    selectedIndex,
    move,
    didSwipe,
    pointerHandlers: { onPointerDown, onPointerUp, onPointerCancel },
  };
}

type OrbCarouselProps<T extends { id: string }> = {
  items: T[];
  selectedId: string | null;
  onSelectedChange: (id: string) => void;
  onOpen: (item: T) => void;
  renderItem: (
    item: T,
    state: { centered: boolean; offset: number },
  ) => ReactNode;
  ariaLabel: string;
};

export default function OrbCarousel<T extends { id: string }>({
  items,
  selectedId,
  onSelectedChange,
  onOpen,
  renderItem,
  ariaLabel,
}: OrbCarouselProps<T>) {
  const {
    selectedIndex,
    move,
    didSwipe,
    pointerHandlers,
  } = useOrbCarouselController(
    items,
    selectedId,
    onSelectedChange,
  );

  useEffect(() => {
    if (items.length && !items.some((item) => item.id === selectedId)) {
      onSelectedChange(items[0].id);
    }
  }, [items, onSelectedChange, selectedId]);

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
        onOpen(selected);
      }
    }
  }

  return (
    <section
      className="relative h-[25rem] touch-pan-y select-none outline-none"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      {...pointerHandlers}
    >
      {items.map((item, index) => {
        const offset = circularOrbOffset(index, selectedIndex, items.length);
        const centered = offset === 0;
        const visible = Math.abs(offset) <= 1;
        const direction = offset > 0 ? "+" : "-";
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              if (didSwipe.current) {
                didSwipe.current = false;
                return;
              }
              if (centered) onOpen(item);
              else onSelectedChange(item.id);
            }}
            className="absolute left-1/2 top-8 flex w-40 flex-col items-center text-center outline-none transition-all duration-700 ease-out motion-reduce:duration-0"
            style={{
              transform:
                offset === 0
                  ? "translateX(-50%) scale(1)"
                  : `translateX(calc(-50% ${direction} clamp(8.5rem, 27vw, 13rem))) scale(0.72)`,
              opacity: visible ? (centered ? 1 : 0.58) : 0,
              pointerEvents: visible ? "auto" : "none",
              zIndex: centered ? 2 : 1,
            }}
            aria-label={`${centered ? "Open" : "Center"} item`}
            aria-current={centered ? "true" : undefined}
          >
            {renderItem(item, { centered, offset })}
          </button>
        );
      })}
      <div className="absolute inset-x-0 bottom-6 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => move(-1)}
          disabled={items.length < 2}
          className="awake-button awake-button-secondary h-11 w-11 rounded-full p-0 disabled:opacity-35"
          aria-label="Previous system"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => move(1)}
          disabled={items.length < 2}
          className="awake-button awake-button-secondary h-11 w-11 rounded-full p-0 disabled:opacity-35"
          aria-label="Next system"
        >
          →
        </button>
      </div>
    </section>
  );
}
