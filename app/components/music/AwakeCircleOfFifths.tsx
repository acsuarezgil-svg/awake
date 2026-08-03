"use client";

import type { CSSProperties } from "react";
import {
  generateSystemOrbPalette,
  getFoundationHue,
  type AwakeColorPreferences,
} from "../../colorPalette";
import {
  getKeySignatureLabel,
  type CircleFoundationMapping,
} from "../../music/circleOfFifths";
import type { AwakeSystem } from "../../systems";
import RotatingOrbRing from "../navigation/RotatingOrbRing";

type Props = {
  items: CircleFoundationMapping[];
  selectedId: string;
  preferences: AwakeColorPreferences;
  onSelectedChange: (id: string) => void;
  onEnterFoundation: (foundation: AwakeSystem) => void;
  onFoundationLongPress: (foundation: AwakeSystem) => void;
};

function spokenKey(key: string) {
  return key
    .replaceAll("#", "-sharp")
    .replaceAll("b", "-flat")
    .replaceAll(/m\b/g, " minor");
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
  onEnterFoundation,
  onFoundationLongPress,
}: Props) {
  const selected = items.find((item) => item.id === selectedId) ?? items[0];
  if (!selected) return null;

  return (
    <RotatingOrbRing
      items={items}
      selectedId={selected.id}
      onSelectedChange={onSelectedChange}
      ariaLabel="Awake Circle of Fifths"
      className="home-foundation-ring awake-circle-of-fifths"
      depthRange={{ back: 0.82, front: 1 }}
      opacityRange={{ back: 0.82, front: 1 }}
      showHint={false}
      centerContent={
        <div className="awake-circle-focus" aria-live="polite">
          <strong>{selected.awakeFoundationName}</strong>
        </div>
      }
      onActivate={(item) => onEnterFoundation(item.foundation)}
      onLongPress={(item) => onFoundationLongPress(item.foundation)}
      getAriaLabel={(item, centered) =>
        `${spokenKey(item.majorKey)} Major, ${item.awakeFoundationName}, ${getKeySignatureLabel(item)}, relative minor ${spokenKey(item.relativeMinor)}. ${centered ? "Open mapped foundation" : "Bring to focus"}`
      }
      renderItem={(item, { centered, index }) => {
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
                {item.displayKey}
              </span>
              <span
                className={`awake-relative-minor-companion ${
                  centered ? "is-active" : ""
                }`}
                data-major-key={item.majorKey}
                data-relative-minor={item.relativeMinor}
                aria-hidden="true"
              >
                {item.relativeMinor.split(" / ")[0]}
              </span>
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
  );
}
