"use client";

import type { CSSProperties } from "react";
import {
  generateSystemOrbPalette,
  getFoundationHue,
  type AwakeColorPreferences,
} from "../../colorPalette";
import type { AwakeSystem } from "../../systems";
import RotatingOrbRing from "../navigation/RotatingOrbRing";

export type FoundationOrbitItem =
  | { id: string; kind: "foundation"; foundation: AwakeSystem }
  | { id: string; kind: "breathe" };

type Props = {
  items: FoundationOrbitItem[];
  selectedId: string;
  preferences: AwakeColorPreferences;
  onSelectedChange: (id: string) => void;
  onEnterFoundation: (foundation: AwakeSystem) => void;
  onEnterBreathe: () => void;
  onFoundationLongPress: (foundation: AwakeSystem) => void;
};

export default function FoundationOrbit({
  items,
  selectedId,
  preferences,
  onSelectedChange,
  onEnterFoundation,
  onEnterBreathe,
  onFoundationLongPress,
}: Props) {
  return (
    <RotatingOrbRing
      items={items}
      selectedId={selectedId}
      onSelectedChange={onSelectedChange}
      ariaLabel="Foundation world"
      className="home-foundation-ring"
      depthRange={{ back: 0.7, front: 1 }}
      opacityRange={{ back: 0.56, front: 0.98 }}
      onActivate={(item) => {
        if (item.kind === "breathe") onEnterBreathe();
        else onEnterFoundation(item.foundation);
      }}
      onLongPress={(item) => {
        if (item.kind === "foundation") {
          onFoundationLongPress(item.foundation);
        }
      }}
      getAriaLabel={(item, centered) =>
        item.kind === "breathe"
          ? centered
            ? "Open breathing practice"
            : "Bring Breathe to the center"
          : `${centered ? "Enter" : "Bring to center"} ${
              item.foundation.title
            } foundation, ${item.foundation.focusAreas.length} systems`
      }
      renderItem={(item, { centered, index }) => {
        const foundation =
          item.kind === "foundation" ? item.foundation : null;
        const hue = foundation
          ? getFoundationHue(foundation.title, preferences.anchorHue)
          : preferences.anchorHue;
        const orb = generateSystemOrbPalette(
          hue,
          preferences.harmony,
          preferences.appearance,
        );
        return item.kind === "breathe" ? (
          <>
            <span
              className={`foundation-waypoint-orb breathe-navigation-orb awake-orb flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24 ${
                centered ? "is-centered" : ""
              }`}
            >
              {centered && (
                <span className="breathe-navigation-text">Breathe</span>
              )}
              <span
                className="breathe-navigation-ripple"
                aria-hidden="true"
              />
            </span>
            {centered && (
              <span className="ring-orb-detail awake-supporting mt-1">
                Tap to enter Practice
              </span>
            )}
          </>
        ) : (
          <>
            <span
              className="foundation-waypoint-orb navigation-foundation-orb relative h-20 w-20 rounded-full sm:h-24 sm:w-24"
              style={
                {
                  "--nav-main": orb.main,
                  "--nav-highlight": orb.highlight,
                  "--nav-glow": orb.glow,
                  "--nav-quiet": orb.quiet,
                  "--orb-delay": `${-(index % 9) * 0.55}s`,
                } as CSSProperties
              }
            />
            {centered && (
              <>
                <span className="ring-orb-label mt-2 max-w-24 font-medium leading-tight">
                  {item.foundation.title}
                </span>
                <span className="ring-orb-detail awake-supporting mt-1">
                  {item.foundation.focusAreas.length}{" "}
                  {item.foundation.focusAreas.length === 1
                    ? "system"
                    : "systems"}
                </span>
              </>
            )}
          </>
        );
      }}
    />
  );
}
