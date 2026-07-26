"use client";

import { useRef } from "react";
import type {
  KeyboardEvent,
  PointerEvent,
} from "react";

import {
  generateAwakePalette,
  generateSystemOrbPalette,
  type AwakeAppearance,
  type AwakeHarmony,
  type AwakeOrbMaterial,
} from "../colorPalette";

type AwakeColorPickerProps = {
  hue: number;
  harmony: AwakeHarmony;
  appearance: AwakeAppearance;
  onHueChange: (hue: number) => void;
  onHarmonyChange: (harmony: AwakeHarmony) => void;
  onAppearanceChange?: (
    appearance: AwakeAppearance,
  ) => void;
  orbMaterial?: AwakeOrbMaterial;
  onOrbMaterialChange?: (material: AwakeOrbMaterial) => void;
  showPreview?: boolean;
};

const harmonyOptions: Array<{
  id: AwakeHarmony;
  label: string;
}> = [
  { id: "balanced", label: "Balanced" },
  { id: "softContrast", label: "Soft contrast" },
  { id: "closeHarmony", label: "Close harmony" },
];

export default function AwakeColorPicker({
  hue,
  harmony,
  appearance,
  onHueChange,
  onHarmonyChange,
  onAppearanceChange,
  orbMaterial = "glass",
  onOrbMaterialChange,
  showPreview = true,
}: AwakeColorPickerProps) {
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const palette = generateAwakePalette(
    hue,
    harmony,
    appearance,
  );
  const orb = generateSystemOrbPalette(
    hue,
    harmony,
    appearance,
  );

  function updateFromPointer(
    event: PointerEvent<HTMLDivElement>,
  ) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    const nextHue =
      (Math.atan2(y, x) * 180) / Math.PI + 90;
    onHueChange((nextHue + 360) % 360);
  }

  function handlePointerDown(
    event: PointerEvent<HTMLDivElement>,
  ) {
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromPointer(event);
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLDivElement>,
  ) {
    if (
      event.key !== "ArrowLeft" &&
      event.key !== "ArrowRight" &&
      event.key !== "ArrowUp" &&
      event.key !== "ArrowDown" &&
      event.key !== "Home" &&
      event.key !== "End"
    ) {
      return;
    }
    event.preventDefault();
    if (event.key === "Home") onHueChange(0);
    else if (event.key === "End") onHueChange(359);
    else {
      const direction =
        event.key === "ArrowRight" ||
        event.key === "ArrowUp"
          ? 1
          : -1;
      onHueChange((hue + direction * 3 + 360) % 360);
    }
  }

  const radians = ((hue - 90) * Math.PI) / 180;
  const selectorX = Math.cos(radians) * 42;
  const selectorY = Math.sin(radians) * 42;

  return (
    <div>
      <div className="flex justify-center">
        <div
          ref={wheelRef}
          role="slider"
          tabIndex={0}
          aria-label="Awake anchor color"
          aria-valuemin={0}
          aria-valuemax={359}
          aria-valuenow={Math.round(hue)}
          onPointerDown={handlePointerDown}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              updateFromPointer(event);
            }
          }}
          onKeyDown={handleKeyDown}
          className="relative h-40 w-40 touch-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-4"
          style={{
            background:
              "conic-gradient(from 0deg, hsl(0 48% 58%), hsl(45 48% 58%), hsl(90 42% 55%), hsl(150 42% 53%), hsl(205 44% 56%), hsl(260 42% 60%), hsl(315 43% 59%), hsl(360 48% 58%))",
            boxShadow:
              "inset 0 0 0 18px rgba(255,255,255,.52), inset 0 0 20px rgba(43,39,34,.16), 0 12px 30px rgba(58,52,44,.12)",
            color: palette.focus,
          }}
        >
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 h-7 w-7 rounded-full border-4 border-white shadow-md"
            style={{
              background: palette.primaryAccent,
              transform: `translate(calc(-50% + ${selectorX}px), calc(-50% + ${selectorY}px))`,
            }}
          />
          <span
            aria-hidden="true"
            className="absolute inset-[34%] rounded-full"
            style={{
              background: `radial-gradient(circle at 35% 28%, ${palette.orbHighlight}, ${palette.primaryAccent})`,
            }}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {harmonyOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onHarmonyChange(option.id)}
            className="min-h-11 rounded-2xl border px-2 text-xs font-medium transition"
            style={{
              borderColor:
                harmony === option.id
                  ? palette.primaryAccent
                  : palette.border,
              background:
                harmony === option.id
                  ? palette.primaryAccent
                  : palette.mutedSurface,
              color:
                harmony === option.id
                  ? palette.buttonText
                  : palette.secondaryText,
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      {onAppearanceChange && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {(["light", "dark"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onAppearanceChange(mode)}
              className="min-h-11 rounded-2xl border text-sm capitalize"
              style={{
                borderColor:
                  appearance === mode
                    ? palette.primaryAccent
                    : palette.border,
                color: palette.text,
                background: palette.mutedSurface,
              }}
            >
              {mode}
            </button>
          ))}
        </div>
      )}

      {onOrbMaterialChange && (
        <div className="mt-5">
          <p
            className="text-xs font-medium uppercase tracking-[0.16em]"
            style={{ color: palette.secondaryText }}
          >
            Orb material
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {(
              [
                "glass",
                "pearl",
                "mist",
                "frost",
                "glow",
                "aurora",
                "matte",
              ] as const
            ).map((material) => (
              <button
                key={material}
                type="button"
                onClick={() => onOrbMaterialChange(material)}
                className="min-h-11 rounded-2xl border px-2 text-xs capitalize"
                style={{
                  borderColor:
                    orbMaterial === material
                      ? palette.primaryAccent
                      : palette.border,
                  background:
                    orbMaterial === material
                      ? palette.primaryAccent
                      : palette.mutedSurface,
                  color:
                    orbMaterial === material
                      ? palette.buttonText
                      : palette.secondaryText,
                }}
                aria-pressed={orbMaterial === material}
              >
                {material}
              </button>
            ))}
          </div>
        </div>
      )}

      {showPreview && (
        <section
          className="mt-5 overflow-hidden rounded-3xl border p-5"
          style={{
            background: palette.pageBackground,
            borderColor: palette.border,
            color: palette.text,
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">Your Awake</h3>
              <p
                className="mt-1 text-xs"
                style={{ color: palette.secondaryText }}
              >
                Calm, coordinated, and readable
              </p>
            </div>
            <span
              className="rounded-full px-3 py-2 text-xs font-medium"
              style={{
                background: palette.primaryAccent,
                color: palette.buttonText,
              }}
            >
              7 Days
            </span>
          </div>

          <div className="mt-6 flex items-end justify-center gap-8">
            <span
              className="awake-orb h-20 w-20 rounded-full"
              style={{
                background: `radial-gradient(circle at 30% 24%, ${orb.highlight}, transparent 32%), linear-gradient(145deg, ${orb.highlight}, ${orb.main} 58%, ${orb.quiet})`,
                boxShadow: `0 0 30px ${orb.glow}`,
              }}
              aria-label="Active system orb preview"
            />
            <span
              className="awake-orb h-14 w-14 rounded-full opacity-65"
              style={{
                background: `radial-gradient(circle at 30% 24%, ${orb.highlight}, transparent 34%), linear-gradient(145deg, ${orb.inactiveAmber}, ${orb.quiet})`,
              }}
              aria-label="Inactive system orb preview"
            />
          </div>

          <button
            type="button"
            className="mt-6 min-h-11 w-full rounded-2xl text-sm font-semibold"
            style={{
              background: palette.primaryAccent,
              color: palette.buttonText,
            }}
          >
            Preview button
          </button>
        </section>
      )}
    </div>
  );
}
