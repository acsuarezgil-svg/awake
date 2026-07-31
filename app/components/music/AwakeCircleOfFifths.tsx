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
      centerContent={
        <div className="awake-circle-focus" aria-live="polite">
          <span className="awake-circle-focus-key">{selected.displayKey}</span>
          <strong>{selected.awakeFoundationName}</strong>
          {selected.direction !== "core" && (
            <span>{getKeySignatureLabel(selected)}</span>
          )}
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
              <span className="awake-circle-key" aria-hidden="true">
                {item.displayKey}
              </span>
            </span>
            {centered && (
              <>
                <span className="ring-orb-label awake-circle-orb-label">
                  {item.awakeFoundationName}
                </span>
                {item.direction !== "core" && (
                  <span className="ring-orb-detail awake-supporting">
                    {getKeySignatureLabel(item)}
                  </span>
                )}
              </>
            )}
          </>
        );
      }}
    />
  );
}
